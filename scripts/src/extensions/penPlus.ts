import type { Files, GeneratedExtension, Version } from '../build.js';
import {
  GalleryExtensionSource,
  type GalleryConfig,
  type ProgressReporter,
} from '../config.js';

import z from 'zod';

const ExtensionsSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    thumbnailFormat: z.string().optional(),
    latestVersion: z.string().optional(),
    turbowarpVersion: z.string().optional(),
    versions: z.array(z.object({ name: z.string(), filename: z.string() })),
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

class PenPlusExtensionGallerySource extends GalleryExtensionSource {
  constructor(private readonly info: Info) {
    super();
  }

  name(): string {
    return 'PenPlusExtensionGallerySource';
  }

  async gatherExtensions(
    submit: (extension: GeneratedExtension) => void,
    reporter: ProgressReporter,
    gallery: GalleryConfig,
    galleryDir: string,
  ): Promise<void> {
    const extensions = ExtensionsSchema.parse(
      JSON.parse(
        await (
          await fetch(`${this.info.sourceLocation}extensions.json`)
        ).text(),
      ),
    ).filter((meta) => !this.info.exclude.includes(meta.id));

    reporter.setMaxProgress(extensions.length);
    for (const meta of extensions) {
      let files: Files;
      if (meta.versions.length == 1 && meta.turbowarpVersion === undefined) {
        // Unversioned
        files = {
          versioned: false,
          location: `${this.info.viewLocation || this.info.sourceLocation}extensions/${meta.id}/${meta.versions[0]!.filename}`,
        };

        const res = await fetch(files.location);
        if (!res.ok) throw 'Failed to fetch: ' + files.location;
      } else {
        // Versioned
        const versions: Version[] = [];

        for (const version of meta.versions) {
          const codeUrl = `${this.info.viewLocation || this.info.sourceLocation}extensions/${meta.id}/${version.filename}`;
          versions.push({
            name: version.name,
            location: codeUrl,
          });

          const res = await fetch(codeUrl);
          if (!res.ok) throw 'Failed to fetch: ' + codeUrl;

          if (meta.latestVersion === version.filename)
            meta.latestVersion = version.name;
        }

        if (meta.turbowarpVersion !== undefined) {
          versions.push({
            name: 'TurboWarp Version',
            location: meta.turbowarpVersion,
          });

          const res = await fetch(meta.turbowarpVersion);
          if (!res.ok) throw 'Failed to fetch: ' + meta.turbowarpVersion;
        }

        files = {
          versioned: true,
          versions,
          mainVersion:
            meta.latestVersion !== undefined
              ? meta.latestVersion
              : meta.versions[0]!.name,
        };
      }

      const bannerUrl = `${this.info.viewLocation || this.info.sourceLocation}extensions/${meta.id}/thumbnail.${meta.thumbnailFormat || 'svg'}`;
      const res = await fetch(bannerUrl);
      if (!res.ok) throw 'Failed to fetch: ' + bannerUrl;

      const ext: GeneratedExtension = {
        name: meta.name,
        id: meta.id,
        description: meta.description,
        authors: [],
        originalAuthors: [],
        badges: [],
        supports: [],
        maySupport: [],
        duplicate: false,
        files,
        banner: bannerUrl,
      };

      submit(ext);
      reporter.increment(1);
    }
  }
}

export function penPlusExtensionGallery(info: Info): GalleryExtensionSource {
  return new PenPlusExtensionGallerySource(info);
}
