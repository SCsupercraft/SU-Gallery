import type { GalleryConfig } from '../config.js';
import { turbowarpExtensionGallery } from '../extensions/tw.js';
import { markDuplicate } from '../modifications/dupe.js';
import { maySupport, supports } from '../modifications/mods.js';

const gallery: GalleryConfig = {
  name: 'Turbowarp Extension Gallery',
  id: 'tw',
  priority: 3,
  sources: {
    viewLocation: 'https://extensions.turbowarp.org/',
    iconLocation: {
      type: 'remote',
      url: 'https://github.com/TurboWarp/extensions/raw/refs/heads/master/website/turbowarp.svg',
    },
    smallIcon: true,
  },
  extensions: [
    turbowarpExtensionGallery({
      sourceLocation:
        'https://raw.githubusercontent.com/TurboWarp/extensions/refs/heads/master/',
      viewLocation: 'https://extensions.turbowarp.org/',
      exclude: [],
    }),
  ],
  modifications: [
    markDuplicate([
      // PenguinMod gallery
      'cloudlink',

      // Pen+ Gallery
      'penplus',
      'obviousAlexC/penPlus',
    ]),
    supports(['tw']),
    maySupport(['pm', 'em']),
  ],
};

export default gallery;
