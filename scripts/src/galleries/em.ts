import type { GalleryConfig } from '../config.js';
import { penguinmodExtensionGallery } from '../extensions/pm.js';
import { supports } from '../modifications/mods.js';

const gallery: GalleryConfig = {
  name: 'ElectraMod Extension Gallery',
  id: 'em',
  priority: 6,
  sources: {
    viewLocation: 'https://electramod-extensions-gallery.vercel.app/',
    iconLocation: {
      type: 'remote',
      url: 'https://raw.githubusercontent.com/ElectraMod/ElectraMod-ExtensionsGallery/refs/heads/main/static/navicon.png',
    },
    smallIcon: false,
  },
  extensions: [
    penguinmodExtensionGallery({
      sourceLocation:
        'https://raw.githubusercontent.com/ElectraMod/ElectraMod-ExtensionsGallery/refs/heads/main/',
      viewLocation: 'https://electramod-extensions-gallery.vercel.app/',
      exclude: [],
    }),
  ],
  modifications: [supports(['em'])],
};

export default gallery;
