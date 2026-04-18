import type { GeneratedExtension } from '../build.js';
import {
  GalleryExtensionSource,
  type GalleryConfig,
  type ProgressReporter,
} from '../config.js';

import z from 'zod';
import path from 'path';

const ExtensionsSchema = z.object({
  extensions: z.array(
    z.object({
      slug: z.string(),
      id: z.string(),
      name: z.string(),
      description: z.string(),
      image: z.string(),
      by: z.array(z.object({ name: z.string(), link: z.httpUrl().optional() })),
      featured: z.boolean(),
      filename: z.string(),
    }),
  ),
});

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

class MistiumExtensionGallerySource extends GalleryExtensionSource {
  constructor(private readonly info: Info) {
    super();
  }

  name(): string {
    return 'MistiumExtensionGallerySource';
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
          await fetch(
            `${this.info.sourceLocation}generated-metadata/extensions-v0.json`,
          )
        ).text(),
      ),
    ).extensions.filter(
      (meta) =>
        !this.info.exclude.includes(
          meta.id.replace(/[^a-zA-Z0-9]+/g, '').trim(),
        ),
    );

    reporter.setMaxProgress(extensions.length);
    for (const meta of extensions) {
      const id = meta.id.replace(/[^a-zA-Z0-9]+/g, '').trim();
      const codeUrl = `${this.info.viewLocation || this.info.sourceLocation}${meta.featured ? 'featured' : 'files'}/${meta.filename.replaceAll(' ', '%20')}`;
      const res = await fetch(codeUrl);
      if (!res.ok) throw 'Failed to fetch: ' + codeUrl;

      const ext: GeneratedExtension = {
        name: meta.name,
        id,
        description: meta.description,
        authors: meta.by,
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

      if (meta.featured) {
        const bannerUrl = `${this.info.sourceLocation}${meta.image}`;
        const res = await fetch(bannerUrl);
        if (!res.ok) throw 'Failed to fetch: ' + bannerUrl;

        ext.banner = bannerUrl;
      }

      submit(ext);
      reporter.increment(1);
    }
  }
}

export function mistiumExtensionGallery(info: Info): GalleryExtensionSource {
  return new MistiumExtensionGallerySource(info);
}
