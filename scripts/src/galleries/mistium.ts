import type { GalleryConfig } from '../config.js';
import { mistiumExtensionGallery } from '../extensions/mistium.js';
import { supports } from '../modifications/mods.js';

const gallery: GalleryConfig = {
  name: "Mistium's Extension Gallery",
  id: 'mistium',
  priority: 7,
  sources: {
    viewLocation: 'https://extensions.mistium.com/',
    iconLocation: {
      type: 'remote',
      url: 'https://avatars.rotur.dev/mist',
    },
    smallIcon: false,
  },
  extensions: [
    mistiumExtensionGallery({
      sourceLocation:
        'https://raw.githubusercontent.com/Mistium/extensions.mistium/refs/heads/main/',
      viewLocation: 'https://extensions.mistium.com/',
      exclude: [],
    }),
  ],
  modifications: [supports(['tw'])],
};

export default gallery;
