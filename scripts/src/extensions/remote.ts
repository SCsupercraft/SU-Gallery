import type { Badge, GeneratedExtension } from '../build.js';
import {
  GalleryExtensionSource,
  type GalleryConfig,
  type ProgressReporter,
} from '../config.js';
import { config } from '../site.js';

class RemoteExtensionSource extends GalleryExtensionSource {
  constructor(private readonly info: GeneratedExtension) {
    super();
  }

  name(): string {
    return `RemoteExtensionSource (${this.info.id})`;
  }

  async gatherExtensions(
    submit: (extension: GeneratedExtension) => void,
    reporter: ProgressReporter,
    gallery: GalleryConfig,
    galleryDir: string,
  ): Promise<void> {
    this.info.name = this.info.name.trim();
    this.info.description = this.info.description.trim();
    if (this.info.license !== undefined)
      this.info.license = this.info.license.trim();

    if (this.info.id.match(/^[a-zA-Z0-9/_-]+$/) === null)
      throw `Invalid extension id: ${this.info.id}`;

    for (const obj of [
      ...this.info.authors,
      ...this.info.originalAuthors,
      ...this.info.badges,
    ] as Badge[]) {
      obj.name = obj.name.trim();
      if (obj.tooltip !== undefined) obj.tooltip = obj.tooltip.trim();
      if (obj.link !== undefined) {
        obj.link = obj.link.trim();
        if (obj.link.match(/^https?:\/\//) === null)
          throw `Invalid protocol, expected 'http' or 'https': ${obj.link}`;
      }
    }

    for (const mod of [...this.info.supports, ...this.info.maySupport]) {
      if (!(mod in config.mods)) throw `Invalid scratch mod: ${mod}`;
    }

    if (this.info.banner !== undefined) {
      const banner = this.info.banner;

      const res = await fetch(banner);
      if (!res.ok) throw 'Failed to fetch: ' + banner;
    }

    const files = this.info.files;
    if (files.versioned) {
      for (const version of files.versions) {
        const res = await fetch(version.location);
        if (!res.ok) throw 'Failed to fetch: ' + version.location;
      }
    } else {
      const res = await fetch(files.location);
      if (!res.ok) throw 'Failed to fetch: ' + files.location;
    }

    submit(this.info);
  }
}

export function remoteExtension(
  info: GeneratedExtension,
): GalleryExtensionSource {
  return new RemoteExtensionSource(info);
}
