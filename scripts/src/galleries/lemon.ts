import type { GalleryConfig } from '../config.js';
import { lemonExtensionGallery } from '../extensions/lemon.js';
import { markDuplicate } from '../modifications/dupe.js';

const gallery: GalleryConfig = {
  name: "Lemon's Extension Gallery",
  id: 'lemon',
  priority: 9,
  sources: {
    viewLocation: 'https://bludisanlemon.github.io/lemons-gallery/',
    iconLocation: {
      type: 'remote',
      url: 'https://raw.githubusercontent.com/BludIsAnLemon/lemons-gallery/refs/heads/main/favicon/favicon.png',
    },
    smallIcon: false,
  },
  extensions: [
    lemonExtensionGallery({
      sourceLocation:
        'https://raw.githubusercontent.com/BludIsAnLemon/lemons-gallery/refs/heads/main/',
      viewLocation: 'https://bludisanlemon.github.io/lemons-gallery/',
      exclude: [],
    }),
  ],
  modifications: [markDuplicate(['hello-work'])],
};

export default gallery;
