import type { GalleryConfig } from '../config.js';
import { penPlusExtensionGallery } from '../extensions/penPlus.js';
import { maySupport, supports } from '../modifications/mods.js';

const gallery: GalleryConfig = {
  name: 'Pen+ Extension Gallery',
  id: 'pen_plus',
  priority: 2,
  sources: {
    viewLocation: 'https://pen-group.github.io/extensions/',
    iconLocation: {
      type: 'remote',
      url: 'https://avatars.githubusercontent.com/u/161660629?s=128&v=4',
    },
    smallIcon: false,
  },
  extensions: [
    penPlusExtensionGallery({
      sourceLocation:
        'https://raw.githubusercontent.com/Pen-Group/extensions/refs/heads/main/',
      viewLocation: 'https://pen-group.github.io/extensions/',
      exclude: [],
    }),
  ],
  modifications: [supports(['pm']), maySupport(['em'])],
};

export default gallery;
