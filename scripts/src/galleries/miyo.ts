import type { GalleryConfig } from '../config.js';
import { localExtensionGallery } from '../extensions/local.js';

const gallery: GalleryConfig = {
  name: "Miyo's Gallery (Archive)",
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
  extensions: [localExtensionGallery()],
  modifications: [],
};

export default gallery;
