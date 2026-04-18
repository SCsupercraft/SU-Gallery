import type { GalleryConfig } from '../config.js';
import { rubyExtensionGallery } from '../extensions/ruby.js';
import { markDuplicate } from '../modifications/dupe.js';

const gallery: GalleryConfig = {
  name: 'Ruby Extension Gallery',
  id: 'ruby',
  priority: 5,
  sources: {
    viewLocation: 'https://ruby-devs.vercel.app/gallery',
    iconLocation: {
      type: 'remote',
      url: 'https://raw.githubusercontent.com/Ruby-Devs/Ruby-Devs.github.io/refs/heads/main/gallery/img/ruby.png',
    },
    smallIcon: true,
  },
  extensions: [
    rubyExtensionGallery({
      sourceLocation:
        'https://raw.githubusercontent.com/Ruby-Devs/Ruby-Devs.github.io/refs/heads/main/',
      exclude: ['penguingpt.pn'],
    }),
  ],
  modifications: [markDuplicate(['penguinhook'])],
};

export default gallery;
