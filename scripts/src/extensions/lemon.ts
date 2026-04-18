import type { GeneratedExtension } from '../build.js';
import {
  GalleryExtensionSource,
  type GalleryConfig,
  type ProgressReporter,
} from '../config.js';

import z from 'zod';
import path from 'path';

const ExtensionsSchema = z.array(
  z.object({
    title: z.string(),
    img: z.string().nullable(),
    description: z.string(),
    url: z.string(),
    docsURL: z.string().optional(),
    sandboxed: z.boolean(),
    creator: z.array(z.object({ name: z.string(), url: z.string() })),
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

class LemonExtensionGallerySource extends GalleryExtensionSource {
  constructor(private readonly info: Info) {
    super();
  }

  name(): string {
    return 'LemonExtensionGallerySource';
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
    ).filter(
      (meta) =>
        !this.info.exclude.includes(
          meta.url
            .substring(0, meta.url.lastIndexOf('.'))
            .replace('extensions/', '')
            .replaceAll(' ', '_'),
        ),
    );

    reporter.setMaxProgress(extensions.length);
    for (const meta of extensions) {
      const id = meta.url
        .substring(0, meta.url.lastIndexOf('.'))
        .replace('extensions/', '')
        .replaceAll(' ', '_');

      const codeUrl = `${this.info.viewLocation || this.info.sourceLocation}${meta.url}`;
      const res = await fetch(codeUrl);
      if (!res.ok) throw 'Failed to fetch: ' + codeUrl;

      const ext: GeneratedExtension = {
        id,
        name: meta.title,
        description: meta.description,
        authors: meta.creator.map((creator) => {
          return {
            name: creator.name,
            link: creator.url,
          };
        }),
        originalAuthors: [],
        badges: [],
        supports: [],
        maySupport: [],
        duplicate: false,
        files: {
          versioned: false,
          location: codeUrl,
        },
      };

      if (meta.img !== null) {
        const bannerUrl = `${this.info.viewLocation || this.info.sourceLocation}${meta.img}`;
        const res = await fetch(bannerUrl);
        if (!res.ok) throw 'Failed to fetch: ' + bannerUrl;

        ext.banner = bannerUrl;
      }

      submit(ext);
      reporter.increment(1);
    }
  }
}

export function lemonExtensionGallery(info: Info): GalleryExtensionSource {
  return new LemonExtensionGallerySource(info);
}
