import type { GalleryConfig } from '../config.js';
import { miyoExtensionGallery } from '../extensions/miyo.js';
import { markDuplicate } from '../modifications/dupe.js';

const gallery: GalleryConfig = {
  name: "Miyo's Gallery",
  id: 'miyo',
  priority: 10,
  sources: {
    viewLocation: 'https://github.com/surv-is-a-dev/gallery/tree/main',
    iconLocation: {
      type: 'remote',
      url: 'https://avatars.githubusercontent.com/u/135030944?v=4',
    },
    smallIcon: false,
  },
  extensions: [
    miyoExtensionGallery({
      sourceLocation:
        'https://raw.githubusercontent.com/surv-is-a-dev/gallery/refs/heads/main/',
      exclude: [],
    }),
  ],
  modifications: [markDuplicate(['Placeholder'])],
};

export default gallery;
