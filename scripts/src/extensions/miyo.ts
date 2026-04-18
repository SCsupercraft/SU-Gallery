import type { Badge, GeneratedExtension } from '../build.js';
import {
  GalleryExtensionSource,
  type GalleryConfig,
  type ProgressReporter,
} from '../config.js';

import JSON5 from 'json5';
import path from 'path';
import z from 'zod';
import { config } from '../site.js';

const CreditSchema = z.object({
  name: z.string(),
  url: z.string(),
});

const MetadataSchema = z.object({
  img: z.string().optional(),
  id: z.string(),
  name: z.string(),
  description: z.string(),
  search_tags: z.set(z.string()).default(() => new Set<string>()),
  requirements: z.set(z.string()).default(() => new Set<string>()),
  mode: z.set(z.string()),
  credits: z.set(CreditSchema),
  mod: z
    .set(z.string())
    .or(z.array(z.string()).transform((value) => new Set<string>(value)))
    .or(z.string().transform((value) => new Set<string>([value])))
    .default(() => new Set<string>()),
});
const ExtensionsSchema = z.set(MetadataSchema);

const MetadataMods: { [key: string]: string } = {};
for (const entry of Object.entries(config.mods)) {
  MetadataMods[entry[0]] = entry[0];
  MetadataMods[entry[1].name] = entry[0];
  MetadataMods[entry[1].name.toLowerCase()] = entry[0];
}

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

class MiyoExtensionGallerySource extends GalleryExtensionSource {
  constructor(private readonly info: Info) {
    super();
  }

  name(): string {
    return 'MiyoExtensionGallerySource';
  }

  async gatherExtensions(
    submit: (extension: GeneratedExtension) => void,
    reporter: ProgressReporter,
    gallery: GalleryConfig,
    galleryDir: string,
  ): Promise<void> {
    const extensions = ExtensionsSchema.parse(
      JSON5.parse(
        await (
          await fetch(
            `${this.info.sourceLocation}site-files/extensions/index.json5`,
          )
        ).text(),
      ),
    )
      .values()
      .filter((meta) => !this.info.exclude.includes(meta.id))
      .toArray();

    reporter.setMaxProgress(extensions.length);
    for (const meta of extensions) {
      const codeUrl =
        this.info.viewLocation !== undefined
          ? `${this.info.viewLocation}extensions/${meta.id}.js`
          : `${this.info.sourceLocation}site-files/extensions/${meta.id}.js`;
      const res = await fetch(codeUrl);
      if (!res.ok) throw 'Failed to fetch: ' + codeUrl;

      const supports: string[] = meta.mod
        .values()
        .toArray()
        .map((mod) => MetadataMods[mod.toLowerCase()])
        .filter((v) => v !== undefined) as string[];

      const badges: Badge[] = [];

      meta.search_tags
        .values()
        .toArray()
        .forEach((val) => {
          switch (val) {
            case 'experimental':
              badges.push({
                name: 'Experimental',
                tooltip: 'This extension is experimental, use with caution.',
              });
              break;
            case 'advanced':
              badges.push({
                name: 'Advanced',
              });
              break;
          }
        });

      meta.requirements
        .values()
        .toArray()
        .forEach((val) => {
          switch (val) {
            case 'internet':
              badges.push({
                name: 'Internet',
                tooltip: 'This extension requires access to the internet.',
              });
              break;
            case 'hardware':
              badges.push({
                name: 'Hardware',
                tooltip: 'This extension requires special hardware.',
              });
              break;
            case 'mobile':
              badges.push({
                name: 'Mobile',
                tooltip: 'This extension is for mobile devices.',
              });
              break;
          }
        });

      const ext: GeneratedExtension = {
        id: meta.id,
        name: meta.name,
        description: meta.description,
        authors: meta.credits
          .values()
          .toArray()
          .map((credit) => {
            return {
              name: credit.name,
              link: credit.url,
            };
          }),
        originalAuthors: [],
        badges,
        supports,
        maySupport: [],
        duplicate: false,
        files: {
          versioned: false,
          location: codeUrl,
        },
      };

      if (meta.img != undefined && meta.img.length > 0) {
        const bannerUrl =
          this.info.viewLocation !== undefined
            ? `${this.info.viewLocation}images/${meta.img}`
            : `${this.info.sourceLocation}site-files/images/${meta.img}`;
        const res = await fetch(bannerUrl);
        if (!res.ok) throw 'Failed to fetch: ' + bannerUrl;

        ext.banner = bannerUrl;
      }

      submit(ext);
      reporter.increment(1);
    }
  }
}

export function miyoExtensionGallery(info: Info): GalleryExtensionSource {
  return new MiyoExtensionGallerySource(info);
}
