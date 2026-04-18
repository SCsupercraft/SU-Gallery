import type { GeneratedExtension } from '../build.js';
import {
  GalleryExtensionSource,
  type GalleryConfig,
  type ProgressReporter,
} from '../config.js';

import z from 'zod';

const ExtensionsSchema = z.array(
  z.object({
    name: z.string(),
    description: z.string(),
    url: z.string(),
    thumb: z.string(),
    recommended: z.boolean().default(false),
    legendary: z.boolean().default(false),
  }),
);

type Info = {
  /**
   * The location to pull files from.
   */
  sourceLocation: string;

  /**
   * A list of extension IDs to exclude.
   */
  exclude: string[];
};

class RubyExtensionGallerySource extends GalleryExtensionSource {
  constructor(private readonly info: Info) {
    super();
  }

  name(): string {
    return 'RubyExtensionGallerySource';
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
          await fetch(`${this.info.sourceLocation}data/extensions.json`)
        ).text(),
      ),
    ).filter((meta) => {
      const code: string = meta.url.split('/').pop()!;
      const id = code.slice(0, code.lastIndexOf('.js'));
      return !this.info.exclude.includes(id);
    });

    reporter.setMaxProgress(extensions.length);
    for (const meta of extensions) {
      const codeUrl = meta.url;
      const bannerUrl = meta.thumb;

      const code: string = codeUrl.split('/').pop()!;
      const id = code.slice(0, code.lastIndexOf('.js'));

      const res1 = await fetch(codeUrl);
      if (!res1.ok) throw 'Failed to fetch: ' + codeUrl;

      const res2 = await fetch(bannerUrl);
      if (!res2.ok) throw 'Failed to fetch: ' + bannerUrl;

      submit({
        name: meta.name,
        id,
        description: meta.description,
        authors: [],
        originalAuthors: [],
        badges: meta.legendary
          ? [
              {
                name: 'Joke',
                tooltip:
                  "This extension was made as a joke, please don't take it seriously",
              },
            ]
          : [],
        supports: [],
        maySupport: [],
        duplicate: false,
        files: {
          versioned: false,
          location: codeUrl,
        },
        banner: bannerUrl,
      });
      reporter.increment(1);
    }
  }
}

export function rubyExtensionGallery(info: Info): GalleryExtensionSource {
  return new RubyExtensionGallerySource(info);
}
