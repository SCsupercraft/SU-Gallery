import type { Data } from './build-data.js';
import { LocalExtensionGallery } from './galleries/local.js';
import { MistiumExtensionGallery } from './galleries/mistium.js';
import { PenPlusExtensionGallery } from './galleries/pen_plus.js';
import { PenguinModExtensionGallery } from './galleries/penguinmod.js';
import { RubyExtensionGallery } from './galleries/ruby.js';
import { TurboWarpExtensionGallery } from './galleries/turbowarp.js';

export const data: Data = {
	supportedMods: [
		{
			id: 'tw',
			name: 'TurboWarp',
			link: 'https://turbowarp.org/',
			iconUrl:
				'https://github.com/TurboWarp/extensions/raw/refs/heads/master/website/turbowarp.svg',
			smallIcon: true,
		},
		{
			id: 'pm',
			name: 'PenguinMod',
			link: 'https://penguinmod.com/',
			iconUrl:
				'https://raw.githubusercontent.com/PenguinMod/PenguinMod-ExtensionsGallery/refs/heads/main/static/navicon.png',
			smallIcon: true,
		},
		{
			id: 'em',
			name: 'ElectraMod',
			link: 'https://electramod.vercel.app/',
			iconUrl:
				'https://raw.githubusercontent.com/ElectraMod/ElectraMod-ExtensionsGallery/refs/heads/main/static/navicon.png',
			smallIcon: false,
		},
	],
	galleries: [
		new LocalExtensionGallery(
			{
				id: 'scsupercraft',
				name: "SCsupercraft's Extension Gallery",
				smallIcon: false,
			},
			[
				{
					type: 'addSupportedMod',
					id: 'pm',
				},
				{
					type: 'addSupportedMod',
					id: 'em',
					uncertain: true,
				},
			]
		),
		new LocalExtensionGallery(
			{
				id: 'other',
				name: 'Other Extensions',
				smallIcon: false,
			},
			[]
		),
		new PenPlusExtensionGallery(
			{
				id: 'pen_plus',
				name: 'Pen+ Extension Gallery',
				sourceLocation:
					'https://raw.githubusercontent.com/Pen-Group/extensions/refs/heads/main/',
				viewLocation: 'https://pen-group.github.io/extensions/',
				iconUrl:
					'https://avatars.githubusercontent.com/u/161660629?s=128&v=4',
				iconExtension: 'png',
				smallIcon: false,
			},
			[
				{
					type: 'addSupportedMod',
					id: 'pm',
				},
				{
					type: 'addSupportedMod',
					id: 'em',
					uncertain: true,
				},
			]
		),
		new TurboWarpExtensionGallery(
			{
				id: 'tw',
				name: 'TurboWarp Extension Gallery',
				sourceLocation:
					'https://raw.githubusercontent.com/TurboWarp/extensions/refs/heads/master/',
				viewLocation: 'https://extensions.turbowarp.org/',
				iconUrl:
					'https://github.com/TurboWarp/extensions/raw/refs/heads/master/website/turbowarp.svg',
				smallIcon: true,
			},
			[
				{
					type: 'addSupportedMod',
					id: 'tw',
				},
				{
					type: 'addSupportedMod',
					id: 'pm',
					uncertain: true,
				},
				{
					type: 'addSupportedMod',
					id: 'em',
					uncertain: true,
				},
			]
		),
		new PenguinModExtensionGallery(
			{
				id: 'pm',
				name: 'PenguinMod Extension Gallery',
				sourceLocation:
					'https://raw.githubusercontent.com/PenguinMod/PenguinMod-ExtensionsGallery/refs/heads/main/',
				viewLocation: 'https://extensions.penguinmod.com/',
				iconUrl:
					'https://raw.githubusercontent.com/PenguinMod/PenguinMod-ExtensionsGallery/refs/heads/main/static/navicon.png',
				smallIcon: true,
			},
			[
				{
					type: 'addSupportedMod',
					id: 'pm',
				},
				{
					type: 'addSupportedMod',
					id: 'em',
					uncertain: true,
				},
			]
		),
		new RubyExtensionGallery(
			{
				id: 'ruby',
				name: 'Ruby Extension Gallery',
				sourceLocation:
					'https://raw.githubusercontent.com/Ruby-Devs/Ruby-Devs.github.io/refs/heads/main/',
				viewLocation: 'https://ruby-devs.vercel.app/gallery',
				iconUrl:
					'https://raw.githubusercontent.com/Ruby-Devs/Ruby-Devs.github.io/refs/heads/main/gallery/img/ruby.png',
				smallIcon: true,
			},
			[
				{
					type: 'remove',
					extensionId: 'penguingpt.pn',
				},
			]
		),
		new PenguinModExtensionGallery(
			{
				id: 'em',
				name: 'ElectraMod Extension Gallery',
				sourceLocation:
					'https://raw.githubusercontent.com/ElectraMod/ElectraMod-ExtensionsGallery/refs/heads/main/',
				viewLocation:
					'https://electramod-extensions-gallery.vercel.app/',
				iconUrl:
					'https://raw.githubusercontent.com/ElectraMod/ElectraMod-ExtensionsGallery/refs/heads/main/static/navicon.png',
				smallIcon: false,
			},
			[
				{
					type: 'addSupportedMod',
					id: 'em',
				},
			]
		),
		new MistiumExtensionGallery(
			{
				id: 'mistium',
				name: "Mistium's Extension Gallery",
				sourceLocation:
					'https://raw.githubusercontent.com/Mistium/extensions.mistium/refs/heads/main/',
				viewLocation: 'https://extensions.mistium.com/',
				iconUrl: 'https://avatars.rotur.dev/mist',
				iconExtension: 'png',
				smallIcon: false,
			},
			[
				{
					type: 'addSupportedMod',
					id: 'tw',
				},
			]
		),
	],
	featured: [
		{ galleryId: 'scsupercraft', extensionId: 'SCsupercraft/debugging' },
		{ galleryId: 'pm', extensionId: 'MikeDev101/e2ee' },
		{ galleryId: 'tw', extensionId: 'gamejolt' },
		{ galleryId: 'pen_plus', extensionId: 'PenP' },
	],
	duplicates: [
		{
			galleryId: 'tw',
			extensionId: 'cloudlink',
		},
		{ galleryId: 'ruby', extensionId: 'penguinhook' },
		{ galleryId: 'tw', extensionId: 'penplus' },
		{ galleryId: 'tw', extensionId: 'obviousAlexC/penPlus' },
		{ galleryId: 'pm', extensionId: 'ObviousAlexC/PenPlus' },
		{ galleryId: 'pm', extensionId: 'RubyDevs/turboweather' },
	],
	authorsAlias: [
		{
			name: 'SharkPool',
			link: 'https://github.com/SharkPool-SP',
			alias: [],
		},
		{
			name: 'TheShovel',
			link: 'https://github.com/TheShovel',
			alias: [],
		},
		{
			name: 'MikeDev101',
			link: 'https://github.com/MikeDev101',
			alias: ['MikeDEV'],
		},
		{
			name: 'yuri-kiss',
			link: 'https://github.com/yuri-kiss',
			alias: ['Mio'],
		},
	],
	githubPages: true,
};
