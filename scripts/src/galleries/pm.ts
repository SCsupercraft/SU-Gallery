import type { GalleryConfig } from '../config.js';
import { penguinmodExtensionGallery } from '../extensions/pm.js';
import { markDuplicate } from '../modifications/dupe.js';
import { maySupport, supports } from '../modifications/mods.js';

const gallery: GalleryConfig = {
  name: 'PenguinMod Extension Gallery',
  id: 'pm',
  priority: 4,
  sources: {
    viewLocation: 'https://extensions.penguinmod.com/',
    iconLocation: {
      type: 'remote',
      url: 'https://raw.githubusercontent.com/PenguinMod/PenguinMod-ExtensionsGallery/refs/heads/main/static/navicon.png',
    },
    smallIcon: true,
  },
  extensions: [
    penguinmodExtensionGallery({
      sourceLocation:
        'https://raw.githubusercontent.com/PenguinMod/PenguinMod-ExtensionsGallery/refs/heads/main/',
      viewLocation: 'https://extensions.penguinmod.com/',
      exclude: [],
    }),
  ],
  modifications: [
    markDuplicate([
      // Pooiod's gallery
      'pooiod/Box2D',
      'pooiod/Dictation',
      'pooiod/Scratchblocks',
      'pooiod/VideoSharing',
      'pooiod/WindowHasher',

      // Pen+ gallery.
      'ObviousAlexC/PenPlus',

      // Ruby gallery.
      'RubyDevs/turboweather',

      // Miyo's gallery
      'Ashime/MoreFields',
    ]),
    supports(['pm']),
    maySupport(['em']),
  ],
};

export default gallery;
