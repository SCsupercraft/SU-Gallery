import { ExtensionDataPlugin } from './extension-data-plugin.mjs';

/**
 * @type {import("./build.mjs").Config}
 */
export default {
	plugins: [ExtensionDataPlugin],
	grab: {
		galleries: [
			{
				name: "SCsupercraft's extension gallery", // I'm using this for my own gallery
				priority: 1000,

				location: 'app/data/gallery/extensions',
				type: 'local',

				icon: 'app/data/gallery/icon.png',
				smallIcon: false,
			},
			{
				name: 'Other extensions', // Use this for standalone extensions that are not in any gallery, or for extensions that are in galleries with lots of other (duplicate) extensions.
				priority: -1,

				location: './app/data/gallery/other-extensions',
				type: 'local',
			},
			{
				name: 'TurboWarp extension gallery',
				priority: 4,

				location:
					'https://raw.githubusercontent.com/TurboWarp/extensions/refs/heads/master/',
				viewLocation: 'https://extensions.turbowarp.org/',
				type: 'turbowarp',

				icon: 'https://github.com/TurboWarp/extensions/raw/refs/heads/master/website/turbowarp.svg',
				smallIcon: true,
			},
			{
				name: 'PenguinMod extension gallery',
				priority: 3,

				location:
					'https://raw.githubusercontent.com/PenguinMod/PenguinMod-ExtensionsGallery/refs/heads/main/',
				viewLocation: 'https://extensions.penguinmod.com/',
				type: 'penguinmod',

				icon: 'https://raw.githubusercontent.com/PenguinMod/PenguinMod-ExtensionsGallery/refs/heads/main/static/navicon.png',
				smallIcon: true,
			},
			{
				name: 'Ruby extension gallery',
				priority: 2,

				location:
					'https://raw.githubusercontent.com/Ruby-Devs/Ruby-Devs.github.io/refs/heads/main/',
				viewLocation: 'https://ruby-devs.vercel.app/gallery',
				type: 'ruby',

				icon: 'https://raw.githubusercontent.com/Ruby-Devs/Ruby-Devs.github.io/refs/heads/main/gallery/img/ruby.png',
				smallIcon: true,

				replacements: [
					{ type: 'removal', replacement: 'penguingpt.pn' },
					/*{
						type: 'addition',
						replacement: {
							name: 'PenguinGPT',
							description:
								"Using WorkingTurboGPT's source code, we made PenguinGPT! New features will come like DALL-E, etc, all for free!",
							url: 'https://raw.githubusercontent.com/PenguinMod/PenguinMod-ExtensionsGallery/refs/heads/main/static/extensions/MubiLop/penguingpt.js',
							thumb: 'https://ruby-devs.vercel.app/cdn/thumbnails/penguingpt.png',
							recommended: true,
						},
					},*/
				],
			},
			{
				name: 'ElectraMod extension gallery',
				priority: 1,

				location:
					'https://raw.githubusercontent.com/ElectraMod/ElectraMod-ExtensionsGallery/refs/heads/main/',
				viewLocation:
					'https://electramod-extensions-gallery.vercel.app/',
				type: 'penguinmod',

				icon: 'https://raw.githubusercontent.com/ElectraMod/ElectraMod-ExtensionsGallery/refs/heads/main/static/navicon.png',
				smallIcon: false,
			},
		],
	},
};
