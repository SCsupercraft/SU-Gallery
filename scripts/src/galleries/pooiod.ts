import type { GalleryConfig } from '../config.js';
import { pooiodExtensionGallery } from '../extensions/pooiod.js';

const gallery: GalleryConfig = {
  name: "Pooiod7's Scratch Extensions",
  id: 'pooiod',
  priority: 8,
  sources: {
    viewLocation: 'https://p7scratchextensions.pages.dev/',
    iconLocation: {
      type: 'local',
      extension: 'png',
    },
    smallIcon: false,
  },
  extensions: [
    pooiodExtensionGallery({
      sourceLocation:
        'https://raw.githubusercontent.com/pooiod/ScratchExtensions/refs/heads/main/',
      viewLocation: 'https://p7scratchextensions.pages.dev/',
      exclude: [],
    }),
  ],
  modifications: [],
};

export default gallery;
