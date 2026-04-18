import type { Author, GeneratedExtension } from '../build.js';
import {
  GalleryExtensionSource,
  type GalleryConfig,
  type ProgressReporter,
} from '../config.js';

import ExtendedJSON from '@turbowarp/json';
import z from 'zod';

const ExtensionsSchema = z.array(z.string());

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

class TurboWarpExtensionGallerySource extends GalleryExtensionSource {
  constructor(private readonly info: Info) {
    super();
  }

  name(): string {
    return 'TurboWarpExtensionGallerySource';
  }

  async gatherExtensions(
    submit: (extension: GeneratedExtension) => void,
    reporter: ProgressReporter,
    gallery: GalleryConfig,
    galleryDir: string,
  ): Promise<void> {
    const extensions = ExtensionsSchema.parse(
      ExtendedJSON.parse(
        await (
          await fetch(`${this.info.sourceLocation}extensions/extensions.json`)
        ).text(),
      ),
    ).filter((id) => !this.info.exclude.includes(id));

    reporter.setMaxProgress(extensions.length);
    for (const id of extensions) {
      const codeUrl =
        this.info.viewLocation !== undefined
          ? `${this.info.viewLocation}${id}.js`
          : `${this.info.sourceLocation}extensions/${id}.js`;
      const res = await fetch(codeUrl);
      if (!res.ok) throw `Failed to fetch: ${codeUrl}`;
      const data = this.parseMetadata(await res.text(), id);
      const ext: GeneratedExtension = {
        name: data.name,
        id: id,
        description: data.description,
        license: data.license,
        authors: data.authors,
        originalAuthors: data.originalAuthors,
        badges: [],
        supports: [],
        maySupport: [],
        duplicate: false,
        files: {
          versioned: false,
          location: codeUrl,
        },
      };
      await this.addBanner(ext, id);

      submit(ext);
      reporter.increment(1);
    }
  }

  async addBanner(ext: GeneratedExtension, id: string) {
    for (let extension of ['png', 'jpg', 'svg']) {
      try {
        const location = `${this.info.viewLocation || this.info.sourceLocation}images/${id}.${extension}`;
        if (await this.remoteFileExists(location)) {
          ext.banner = location;
          break;
        }
      } catch (e) {}
    }
  }

  async remoteFileExists(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  parseMetadata(code: string, id: string) {
    const data: {
      name: string;
      description: string;
      license?: string;
      authors: Author[];
      originalAuthors: Author[];
    } = { name: '', description: '', authors: [], originalAuthors: [] };

    for (const line of code.split('\n')) {
      if (!line.startsWith('//')) {
        // End of header.
        break;
      }

      const withoutComment = line.substring(2).trim();
      const parts = this.splitFirst(withoutComment, ':');
      if (parts.length === 1) {
        // Invalid.
        continue;
      }

      const key = parts[0]!.toLowerCase().trim();
      const value = parts[1]!.trim();

      switch (key) {
        case 'name':
          data.name = value;
          break;
        case 'description':
          data.description = value;
          break;
        case 'license':
          data.license = value;
          break;
        case 'by':
          data.authors.push(this.parseAuthor(value));
          break;
        case 'original':
          data.originalAuthors.push(this.parseAuthor(value));
          break;
        default:
          break;
      }
    }

    if (data.name.length == 0) throw 'Failed to find extension name for: ' + id;
    if (data.description.length == 0)
      throw 'Failed to find extension description for: ' + id;
    return data;
  }

  splitFirst(string: string, split: string): string[] {
    const idx = string.indexOf(split);
    if (idx === -1) {
      return [string];
    }
    return [string.substring(0, idx), string.substring(idx + split.length)];
  }

  parseAuthor(data: string) {
    const parts = this.splitFirst(data, '<');
    if (parts.length === 1) {
      const author: Author = {
        name: data,
      };
      return author;
    }

    const name = parts[0]!.trim();
    const link = parts[1]!.replace('>', '');

    const author: Author = {
      name,
      link,
    };

    return author;
  }
}

export function turbowarpExtensionGallery(info: Info): GalleryExtensionSource {
  return new TurboWarpExtensionGallerySource(info);
}
