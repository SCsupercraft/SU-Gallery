import type { SiteConfig } from './config.js';

export const config: SiteConfig = {
  viewLocation: 'https://scsupercraft.github.io/SU-Gallery/',
  basename: '/SU-Gallery/',
  static: true,
  featured: [
    { gallery: 'pm', extension: 'AndrewGaming587/agBuffer' },
    { gallery: 'pm', extension: 'Div/divAlgEffects' },
    { gallery: 'tw', extension: 'gamejolt' },
    { gallery: 'pen_plus', extension: 'PenP' },
  ],
  mods: {
    tw: {
      name: 'TurboWarp',
      viewLocation: 'https://turbowarp.org/',
      iconLocation:
        'https://github.com/TurboWarp/extensions/raw/refs/heads/master/website/turbowarp.svg',
      smallIcon: true,
    },
    pm: {
      name: 'PenguinMod',
      viewLocation: 'https://penguinmod.com/',
      iconLocation:
        'https://raw.githubusercontent.com/PenguinMod/PenguinMod-ExtensionsGallery/refs/heads/main/static/navicon.png',
      smallIcon: true,
    },
    em: {
      name: 'ElectraMod',
      viewLocation: 'https://electramod.vercel.app/',
      iconLocation:
        'https://raw.githubusercontent.com/ElectraMod/ElectraMod-ExtensionsGallery/refs/heads/main/static/navicon.png',
      smallIcon: false,
    },
  },
  alias: {
    authors: [
      {
        name: 'LilyMakesThings',
        link: 'https://scratch.mit.edu/users/LilyMakesThings/',
        otherNames: [],
      },
      {
        name: 'SharkPool',
        link: 'https://github.com/SharkPool-SP',
        otherNames: [],
      },
      {
        name: 'TheShovel',
        link: 'https://github.com/TheShovel',
        otherNames: [],
      },
      {
        name: 'MikeDev101',
        link: 'https://github.com/MikeDev101',
        otherNames: ['MikeDEV'],
      },
      {
        name: 'yuri-kiss',
        link: 'https://github.com/yuri-kiss',
        otherNames: ['Mio', '0znzw'],
      },
    ],
  },
};
