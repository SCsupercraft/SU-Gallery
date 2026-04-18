import type { GalleryConfig } from '../config.js';
import { localExtensionGallery } from '../extensions/local.js';
import { remoteExtension } from '../extensions/remote.js';

const gallery: GalleryConfig = {
  name: 'Other Extensions',
  id: 'other',
  priority: 1,
  sources: {
    iconLocation: { type: 'local', extension: 'svg' },
    smallIcon: false,
  },
  extensions: [
    localExtensionGallery(),
    remoteExtension({
      name: 'Threads',
      id: 'soup/soup_threads',
      description:
        'Take full control of the sequencer so you can fix all of those pesky one-frame-off bugs.',
      license: 'MIT',

      authors: [{ name: 'Soup', link: 'https://github.com/the-can-of-soup' }],
      originalAuthors: [],
      badges: [
        {
          name: 'External',
          tooltip:
            'This extension was taken from an external github repository',
          link: 'https://github.com/the-can-of-soup/pm_threads/',
        },
      ],

      supports: ['pm'],
      maySupport: [],

      duplicate: false,

      files: {
        versioned: false,
        location:
          'https://raw.githubusercontent.com/the-can-of-soup/pm_threads/refs/heads/main/soup_threads.js',
      },
    }),
    remoteExtension({
      name: 'Prim Utilities',
      id: 'm0v0/PrimUtilities',
      description: 'Powerful blocks for working with prime numbers.',
      license: 'MIT',

      banner:
        'https://raw.githubusercontent.com/M0v0/Website/refs/heads/main/Scratch/Extensions/Extension%201/Group%205.png',

      authors: [
        { name: 'Mister', link: 'https://scratch.mit.edu/users/Jupiter12786/' },
      ],
      originalAuthors: [],
      badges: [
        {
          name: 'External',
          tooltip: 'This extension was taken from another extension gallery',
          link: 'https://m0v0.github.io/Website/',
        },
      ],

      supports: ['tw'],
      maySupport: ['pm', 'em'],

      duplicate: false,

      files: {
        versioned: false,
        location:
          'https://raw.githubusercontent.com/M0v0/Website/refs/heads/main/Scratch/Extensions/Extension%201/Code.js',
      },
    }),
  ],
  modifications: [],
};

export default gallery;
