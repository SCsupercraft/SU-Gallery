import type { Badge, GeneratedExtension, Version } from '../build.js';
import {
  GalleryExtensionSource,
  type GalleryConfig,
  type ProgressReporter,
} from '../config.js';

import z from 'zod';

const ExtensionsSchema = z.array(
  z.object({
    id: z.string(),
    image: z.string(),
    title: z.string(),
    description: z.string(),
    subtext: z.string(),
    icon: z.string(),
    iconText: z.string(),
    buttons: z.array(
      z.object({ text: z.string(), color: z.string(), link: z.string() }),
    ),
    tags: z.array(z.string()),
    type: z.array(z.string()),
    hidden: z.boolean(),
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

class PooiodExtensionGallerySource extends GalleryExtensionSource {
  constructor(private readonly info: Info) {
    super();
  }

  name(): string {
    return 'PooiodExtensionGallerySource';
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
      let mainVersion;
      const versions: Version[] = meta.buttons
        .filter((button) => button.link.startsWith('/view/#/[id]/'))
        .map((button) => {
          const filename = button.link.replace('/view/#/[id]/', '');
          return {
            name: button.text.replace('View ', ''),
            location: `${this.info.viewLocation || this.info.sourceLocation}ext/${meta.id}/${filename}`,
          };
        });
      if (
        meta.buttons.find((button) => button.link === '/view/#/[id]') !=
        undefined
      ) {
        versions.push({
          name: 'Main',
          location: `${this.info.viewLocation || this.info.sourceLocation}ext/${meta.id}/main.js`,
        });
        mainVersion = 'Main';
      }
      if (mainVersion === undefined) mainVersion = versions[0]!.name;

      for (const version of versions) {
        const res = await fetch(version.location);
        if (!res.ok) throw 'Failed to fetch: ' + version.location;
      }

      const badges: Badge[] = [];
      if (meta.hidden)
        badges.push({
          name: 'Hidden',
        });
      if (meta.tags.includes('unfinished'))
        badges.push({
          name: 'Unfinished',
        });
      if (meta.iconText || meta.subtext) {
        let text = '';
        const flag1 = meta.iconText != meta.subtext;
        if (meta.subtext) {
          text += meta.subtext;
          if (meta.iconText && flag1) text += ' - ';
        }
        if (meta.iconText && flag1) text += meta.iconText;

        badges.push({
          name: 'Note',
          tooltip: text,
        });
      }

      const ext: GeneratedExtension = {
        id: meta.id,
        name: meta.title,
        description: meta.description,
        authors: [],
        originalAuthors: [],
        badges: badges,
        supports: [],
        maySupport: [],
        duplicate: false,
        files:
          versions.length > 1
            ? {
                versioned: true,
                versions,
                mainVersion,
              }
            : {
                versioned: false,
                location: versions[0]!.location,
              },
      };

      const bannerUrl = `${this.info.viewLocation || this.info.sourceLocation}${(meta.image.startsWith('/') ? meta.image.substring(1) : meta.image).replaceAll('[id]', meta.id)}`;
      const res = await fetch(bannerUrl);
      if (!res.ok) throw 'Failed to fetch: ' + bannerUrl;

      ext.banner = bannerUrl;

      submit(ext);
      reporter.increment(1);
    }
  }
}

export function pooiodExtensionGallery(info: Info): GalleryExtensionSource {
  return new PooiodExtensionGallerySource(info);
}
