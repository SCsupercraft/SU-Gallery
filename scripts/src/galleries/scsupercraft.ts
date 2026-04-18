import type { GalleryConfig } from '../config.js';
import { localExtensionGallery } from '../extensions/local.js';

const gallery: GalleryConfig = {
  name: "SCsupercraft's Extensions",
  id: 'sc',
  priority: 0,
  sources: {
    iconLocation: { type: 'local', extension: 'png' },
    smallIcon: false,
  },
  extensions: [localExtensionGallery()],
  modifications: [],
};

export default gallery;
