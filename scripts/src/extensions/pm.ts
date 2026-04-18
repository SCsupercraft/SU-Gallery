import type { Author, GeneratedExtension } from '../build.js';
import {
  GalleryExtensionSource,
  type GalleryConfig,
  type ProgressReporter,
} from '../config.js';

import JSON5 from 'json5';
import z from 'zod';

const ExtensionsSchema = z.array(
  z.object({
    name: z.string(),
    description: z.string(),
    code: z.string(),
    banner: z.string(),
    creator: z.string(),
    creatorAlias: z.string().optional(),
    isGitHub: z.boolean().default(false),
    unstable: z.boolean().default(false),
    unstableReason: z.string().optional(),
    notes: z.string().optional(),
  }),
);

type Info = {
  /**
   * The location to pull files from.
   */
  sourceLocation: string;

  /**
   * Links to extension code & banners will be from this location.
   */
  viewLocation?: string;

  /**
   * A list of extension IDs to exclude.
   */
  exclude: string[];
};

class PenguinModExtensionGallerySource extends GalleryExtensionSource {
  constructor(private readonly info: Info) {
    super();
  }

  name(): string {
    return 'PenguinModExtensionGallerySource';
  }

  async gatherExtensions(
    submit: (extension: GeneratedExtension) => void,
    reporter: ProgressReporter,
    gallery: GalleryConfig,
    galleryDir: string,
  ): Promise<void> {
    const extensions = ExtensionsSchema.parse(
      await this.extractJsonExport(
        await (
          await fetch(`${this.info.sourceLocation}src/lib/extensions.js`)
        ).text(),
      ),
    ).filter(
      (meta) =>
        !this.info.exclude.includes(
          meta.code.slice(0, meta.code.lastIndexOf('.')),
        ),
    );

    reporter.setMaxProgress(extensions.length);
    for (const meta of extensions) {
      const id = meta.code.slice(0, meta.code.lastIndexOf('.'));
      const codeUrl =
        this.info.viewLocation !== undefined
          ? `${this.info.viewLocation}extensions/${meta.code}`
          : `${this.info.sourceLocation}static/extensions/${meta.code}`;
      const bannerUrl =
        this.info.viewLocation !== undefined
          ? `${this.info.viewLocation}images/${meta.banner}`
          : `${this.info.sourceLocation}static/images/${meta.banner}`;

      const res1 = await fetch(codeUrl);
      if (!res1.ok) throw 'Failed to fetch: ' + codeUrl;
      const res2 = await fetch(bannerUrl);
      if (!res2.ok) throw 'Failed to fetch: ' + bannerUrl;

      const author: Author | undefined =
        meta.creator != undefined
          ? {
              name:
                meta.creatorAlias != undefined
                  ? meta.creatorAlias
                  : meta.creator,
              link:
                meta.isGitHub === true
                  ? `https://github.com/${meta.creator}`
                  : `https://scratch.mit.edu/users/${meta.creator}`,
            }
          : undefined;

      const ext: GeneratedExtension = {
        name: meta.name,
        id,
        description: meta.description,
        authors: author !== undefined ? [author] : [],
        originalAuthors: [],
        badges: [],
        supports: [],
        maySupport: [],
        duplicate: false,
        files: {
          versioned: false,
          location: codeUrl,
        },
        banner: bannerUrl,
      };

      if (meta.notes) {
        ext.badges.push({
          name: 'Note',
          tooltip: meta.notes,
        });
      }

      if (meta.unstable) {
        ext.badges.push({
          name: 'Unstable',
          tooltip: meta.unstableReason,
        });
      }

      submit(ext);
      reporter.increment(1);
    }
  }

  async extractJsonExport(fileContent: string) {
    try {
      // Search for the export statement and extract all exported objects.
      const exportsIndex = fileContent.indexOf('export default [') + 15;

      if (exportsIndex > -1) {
        const exportedObjects: string = fileContent.slice(
          exportsIndex,
          fileContent.indexOf(';', exportsIndex),
        );

        return JSON5.parse(exportedObjects);
      }

      throw 'No export found in the file.';
    } catch (error) {
      throw `Failed to process file: ${error}`;
    }
  }
}

export function penguinmodExtensionGallery(info: Info): GalleryExtensionSource {
  return new PenguinModExtensionGallerySource(info);
}
