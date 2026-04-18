import type { GeneratedGallery } from '../build.js';
import { GalleryModification, type GalleryConfig } from '../config.js';
import { config } from '../site.js';

class Supports extends GalleryModification {
  constructor(
    private readonly mods: string[],
    private readonly ids: string[],
    private readonly willSupport: boolean,
  ) {
    super();
  }

  name(): string {
    return `${this.willSupport ? 'Supports' : 'MaySupport'} (${this.mods.reduce((p, c, i) => p + (i == 0 ? '' : ', ') + c, '')})`;
  }

  modify(gallery: GalleryConfig, galleryData: GeneratedGallery): void {
    this.mods.forEach((mod) => {
      if (!(mod in config.mods)) throw 'Invalid scratch mod: ' + mod;
    });

    for (const extension of galleryData.extensions) {
      if (this.ids.length > 0 && !this.ids.includes(extension.id)) continue;

      const array = this.willSupport
        ? extension.supports
        : extension.maySupport;
      for (const mod of this.mods) {
        if (!array.includes(mod)) array.push(mod);
      }
    }
  }
}

export function supports(
  mods: string[],
  ids: string[] = [],
): GalleryModification {
  return new Supports(mods, ids, true);
}

export function maySupport(
  mods: string[],
  ids: string[] = [],
): GalleryModification {
  return new Supports(mods, ids, false);
}
