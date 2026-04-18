import type { GeneratedGallery } from '../build.js';
import { GalleryModification, type GalleryConfig } from '../config.js';

class MarkDuplicate extends GalleryModification {
  constructor(
    private readonly include: string[],
    private readonly exclude: string[],
  ) {
    super();
  }

  name(): string {
    return 'MarkDuplicate';
  }

  modify(gallery: GalleryConfig, galleryData: GeneratedGallery): void {
    for (const extension of galleryData.extensions) {
      if (this.include.includes(extension.id)) extension.duplicate = true;
      if (this.exclude.includes(extension.id)) extension.duplicate = false;
    }
  }
}

export function markDuplicate(
  include: string[],
  exclude: string[] = [],
): GalleryModification {
  return new MarkDuplicate(include, exclude);
}
