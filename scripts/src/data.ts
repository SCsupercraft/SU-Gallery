import type { Data } from './build-data.js';
import { LocalExtensionGallery } from './galleries/local.js';
import { MistiumExtensionGallery } from './galleries/mistium.js';
import { PenPlusExtensionGallery } from './galleries/pen_plus.js';
import { PenguinModExtensionGallery } from './galleries/penguinmod.js';
import { PooiodExtensionGallery } from './galleries/pooiod.js';
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
		new PooiodExtensionGallery(
			{
				id: 'pooiod',
				name: "Pooiod7's Scratch Extensions",
				sourceLocation:
					'https://raw.githubusercontent.com/pooiod/ScratchExtensions/refs/heads/main/',
				viewLocation: 'https://p7scratchextensions.pages.dev/',
				// Unfortunately both the SVG and ICO files used by the gallery aren't resized property, so we need a PNG.
				iconUrl:
					'data:image/png;base64,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2tvaY/KEN0StVivPADSZP6+8J/7xm38fi5ctKk+0mFrH9PAF4IrbdfyeccrR50fH1juVJwCaxPmzvxvf+vEX/CzDPkJgtYiB/QfF9H1nxC7j94xJHVNi/JiJ0d7WXj4GQIM8tvbRuG3JvFi4dH5cPffSuPmuP5aP0MIEVosaPHBIjNly+4Z96XDjIcNiwtjXRmfH5Ji4/e6xw7ad0VbzPRTN6r4Vi2PR0ptj4ZL5cfu9t8Sqxx4sHwFehb8+uTbuf/g+3yXYhwksesSEsbvGKUfNignjXlue6EUrVy+Pz59xeFx365XlCYBE3uROj1i15sG4+L/Oje7urpgyYWq0tXk1q7ddfPW58YmvH+zNtQAN4BUsetxuO74uzjvhihg6ZJPyRAN017vjuO/OiF///kflCYAe4mUFetwtd90QM07aP9aue7w80cO6693xmVM/JK4AGkxg0RALFs8RWQ32fFxd+oeflCcAepjAomFEVuOIK4DeJbBoKJHV88QVQO8TWDScyOo54gqgOQgseoXIyieuAJqHwKLXiKw84gqguQgsepXIevXEFUDzEVj0OpH1yokrgOYksGgKIuvlE1cAzUtg0TRE1oYTVwDNTWDRVETWSxNXAM1PYNF0RNYLE1cA1SCwaErPR9bqxx4qT33WU888Gf906gfFFUAFCCya1oLFc+Itn9pZUETE/DuvjwP/ade47A8/LU8ANKFax/SolyM0m7fsPT1OPOy02GrENuWppa1d93ic9rOZccHs70ZXd1d5BqBJCSwqo1arxagRY2Li9rtHZ8fk6Nh6p6jVWu9F2Psfvi8WLpkfC5fMj/tWLI7uenf5CABNTmABACRrvU//AQB6mcACAEgmsAAAkgksAIBkAgsAIJnAAgBIJrAAAJIJLACAZAILACCZwAIASCawAACSCSwAgGQCCwAgmcACAEgmsAAAkgksAIBkAgsAIJnAAgBIJrAAAJIJLACAZAILACCZwAIASCawAACSCSwAgGQCCwAgmcACAEgmsAAAkgksAIBkAgsAIJnAAgBIJrAAAJIJLACAZAILACCZwAIASCawAACSCSwAgGQCCwAgmcACAEgmsAAAkgksAIBkAgsAIJnAAgBIJrAAAJIJLACAZAILACCZwAIASCawAACSCSwAgGQCCwAgmcACAEgmsAAAkgksAIBkAgsAIJnAAgBIJrAAAJIJLACAZAILACCZwAIASCawAACSCSwAgGQCCwAgmcACAEgmsAAAkgksAIBkAgsAIJnAAgBIJrAAAJIJLACAZAILACCZwAIASCawAACSCSwAgGQCCwAgmcACAEgmsAAAkgksAIBkAgsAIJnAAgBIJrAAAJIJLACAZAILACCZwAIASCawAACSCSwAgGQCCwAgmcACAEgmsAAAkgksAIBkAgsAIJnAAgBIJrAAAJIJLACAZAILACCZwAIASCawAACSCSwAgGQCCwAgmcACAEgmsAAAkgksAIBkAgsAIJnAAgBIJrAAAJIJLACAZAILACCZwAIASCawAACSCSwAgGQCCwAgmcACAEgmsAAAkgksAIBkAgsAIJnAAgBIJrAAAJIJLACAZAILACCZwAIASCawAACSCSwAgGQCCwAg2f8FJ0A5wDd2dJYAAAAASUVORK5CYII=',
				iconExtension: 'png',
				smallIcon: false,
			},
			[]
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
