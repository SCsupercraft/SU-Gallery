import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as process from 'node:process';

import ora from 'ora';
import { Chalk } from 'chalk';
const chalk = new Chalk();

import ExtendedJSON from '@turbowarp/json';
import JSON5 from 'json5';

import { BuildHelper } from './helper.mjs';

/**
 * @typedef {Object} ExtensionReplacement
 * @property {"removal" | "addition"} type The type of replacement
 * @property {string | PenguinModExtension} replacement
 */

/**
 * @typedef {Object} ExtensionGalleryLocation
 * @property {string} name The gallery name. (Displayed in gallery)
 * @property {number} priority The gallery's priority.
 * @property {string} icon This is the url of the gallery's icon (Displayed in gallery)
 * @property {boolean} smallIcon Should the icon be smaller?
 * @property {string} location This is the root url of the gallery, this property is only for external extension galleries.
 * @property {string} viewLocation This is the url of the gallery's website, where the user would normally find the gallery's extension. (Displayed in gallery)
 * @property {ExtensionReplacement[]} [replacements] Allows replacing extension id's
 */

/**
 * @typedef {Object} ExtensionGallery
 * @property {'local' | 'turbowarp-gallery' | 'penguin-mod-gallery'} type The type of gallery.
 * @property {string} id The gallery id. (Used to find files)
 * @property {string} name The gallery name. (Displayed in gallery)
 * @property {number} priority The gallery's priority. (Not included in file)
 * @property {string} icon This is the url of the gallery's icon (Displayed in gallery)
 * @property {boolean} smallIcon Should the icon be smaller?
 * @property {string} [location] This is the root url of the gallery, this property is only for external extension galleries.
 * @property {string} [viewLocation] This is the url of the gallery's website, where the user would normally find the gallery's extension. (Displayed in gallery)
 * @property {Extension[]} extensions A list of extensions in this gallery. (Displayed in gallery)
 */

/**
 * @typedef {Object} Extension
 * @property {string} id The extension's id.
 * @property {ExtensionMetaData} [metadata] Extension metadata.
 * @property {boolean} [featured] Is the extension featured.
 */

/**
 * @typedef {Object} ExtensionAuthor
 * @property {"creator" | "originalCreator"} [type] The type of author.
 * @property {string} name The author's name or username.
 * @property {string} [link] A link to one of the author's profiles or personal websites.
 */

/**
 * @typedef {Object} ExtensionBadge
 * @property {string} name The badge name.
 * @property {string} [tooltip] A tooltip when hovering over this badge.
 */

/**
 * @typedef {Object} ExtensionMetaData
 * @property {string} id The id of this extension.
 * @property {string} name The extension's name. (Displayed in the gallery)
 * @property {string} description The extension's description. (Displayed in the gallery)
 * @property {ExtensionAuthor[]} credits A list of authors who made the extension. (Displayed in the gallery)
 * @property {ExtensionBadge[]} [badges]  A list of badges to display next to the extension name. (Displayed in gallery)
 * @property {string} [license] The extension's license. (Displayed in the gallery)
 * @property {string} [banner] The file extension of the extension's banner. (Used to find the correct file)
 * @property {boolean} [featured] Is this extension featured on our gallery?
 */

/** @type {string[]} */
const messages = [];
/** @type {string[]} */
let featured = [];

/** @type {import('ora').Ora} */
let spinner;
(async () => {
	spinner = ora({
		text: chalk.yellowBright('Grabbing galleries'),
		color: 'yellow',
	}).start();
})();

/**
 * Get the text representation of the galleries type.
 * @param {'local' | 'turbowarp-gallery' | 'penguin-mod-gallery'} type The type of gallery.
 * @param {string} [location] The gallery location.
 */
function getGalleryTypeText(type, location) {
	switch (type) {
		case 'local':
			return '(local)';
		case 'turbowarp-gallery':
			return `(turbowarp-gallery@${location})`;
		case 'penguin-mod-gallery':
			return `(penguin-mod-gallery@${location})`;
	}
}

/** @type {ExtensionGallery[]} */
let galleries;
try {
	featured = ExtendedJSON.parse(
		await fs.readFile(
			path.resolve(
				process.cwd(),
				'app/data/gallery/extensions/featured.json'
			),
			'utf-8'
		)
	);

	galleries = [
		...(await getLocalGallery("SCsupercraft's extension gallery")),
		...(await getTurbowarpGalleries([
			// {
			// 	name: 'TurboWarp extension gallery',
			// 	priority: 3,
			// 	icon: 'https://github.com/TurboWarp/extensions/raw/refs/heads/master/website/turbowarp.svg',
			// 	smallIcon: true,
			// 	location:
			// 		'https://raw.githubusercontent.com/TurboWarp/extensions/refs/heads/master/',
			// 	viewLocation: 'https://extensions.turbowarp.org/',
			// },
			// {
			// 	name: 'GoofyWarp extension gallery',
			// 	priority: 0,
			// 	icon: 'https://raw.githubusercontent.com/goofywarp/extensions/refs/heads/master/website/turbowarp.svg',
			// 	smallIcon: true,
			// 	location:
			// 		'https://raw.githubusercontent.com/goofywarp/extensions/refs/heads/master/',
			// 	viewLocation: 'https://goofywarp.github.io/extensions/',
			// 	replacements: [
			// 		{ type: 'removal', replacement: 'TheShovel/ColourPicker' },
			// 		{ type: 'addition', replacement: 'TheShovel/ColorPicker' },
			// 	],
			// },
		])),
		...(await getPenguinModGalleries([
			// {
			// 	name: 'PenguinMod extension gallery',
			// 	priority: 2,
			// 	icon: 'https://raw.githubusercontent.com/PenguinMod/PenguinMod-ExtensionsGallery/refs/heads/main/static/navicon.png',
			// 	smallIcon: true,
			// 	location:
			// 		'https://raw.githubusercontent.com/PenguinMod/PenguinMod-ExtensionsGallery/refs/heads/main/',
			// 	viewLocation: 'https://extensions.penguinmod.com/',
			// },
			{
				name: 'ElectraMod extension gallery',
				priority: 1,
				icon: 'https://raw.githubusercontent.com/ElectraMod/ElectraMod-ExtensionsGallery/refs/heads/main/static/navicon.png',
				smallIcon: false,
				location:
					'https://raw.githubusercontent.com/ElectraMod/ElectraMod-ExtensionsGallery/refs/heads/main/',
				viewLocation:
					'https://electramod-extensions-gallery.vercel.app/',
			},
		])),
	]
		.sort((a, b) => {
			if (a.priority > b.priority) return -1;
			if (a.priority < b.priority) return 1;
			return 0;
		})
		.map((gallery) => {
			return {
				...gallery,
				priority: undefined,
			};
		});

	BuildHelper.write(
		path.resolve(process.cwd(), 'scripts/.galleries.json'),
		JSON.stringify(galleries)
	);
	spinner.succeed('Updated gallery list:\n');
} catch (e) {
	spinner.fail('Failed to update gallery list:\n');
	console.log(e);
	process.exit(0);
}
messages.forEach((msg) => console.log(`${msg}`));
console.log();
galleries.forEach((gallery) =>
	console.log(
		`${chalk.gray('added')} ${chalk.blueBright(gallery.name)} ${chalk.gray(
			getGalleryTypeText(gallery.type, gallery.location)
		)}`
	)
);
console.log();

function isFeatured(id) {
	return featured.includes(id);
}

/**
 * Returns the local extension gallery
 * @param {string} name The display name of the local gallery
 * @returns {Promise<ExtensionGallery[]>}
 */
async function getLocalGallery(name) {
	return new Promise(async (resolve, reject) => {
		try {
			/** @type {string[]} */
			const extensions = ExtendedJSON.parse(
				await fs.readFile(
					path.resolve(
						process.cwd(),
						'app/data/gallery/extensions/extensions.json'
					),
					'utf-8'
				)
			);
			/** @type {ExtensionGallery} */
			const gallery = {
				type: 'local',
				id: name.toLowerCase().replaceAll(' ', '_'),
				name,
				priority: 9999,
				smallIcon: false,
				extensions: extensions.map((ext) => {
					/** @type {Extension} */
					const extension = {
						id: ext,
						featured: isFeatured(ext),
					};
					messages.push(
						`${chalk.gray('added')} ${chalk.blueBright(
							ext
						)} ${chalk.gray('for')} ${chalk.blueBright(name)}`
					);
					return extension;
				}),
			};
			resolve([gallery]);
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * Returns all turbowarp galleries
 * @param {ExtensionGalleryLocation[]} galleryLocations A list of root urls for turbowarp galleries
 * @returns {Promise<ExtensionGallery[]>}
 */
async function getTurbowarpGalleries(galleryLocations) {
	return new Promise(async (resolve, reject) => {
		try {
			/** @type {ExtensionGallery[]} */
			const galleries = [];
			for (const i in galleryLocations) {
				const extensions = await getTurbowarpGalleryExtensions(
					galleryLocations[i].location,
					galleryLocations[i].name,
					galleryLocations[i].replacements
				);
				galleries.push({
					type: 'turbowarp-gallery',
					id: galleryLocations[i].name
						.toLowerCase()
						.replaceAll(' ', '_'),
					name: galleryLocations[i].name,
					priority: galleryLocations[i].priority,
					icon: galleryLocations[i].icon,
					smallIcon: galleryLocations[i].smallIcon,
					location: galleryLocations[i].location,
					viewLocation: galleryLocations[i].viewLocation,
					extensions,
				});
			}
			resolve(galleries);
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * Adds extensions from a turbowarp gallery
 * @param {string} url The root url of the turbowarp gallery
 * @param {string} name The name of the penguin mod gallery
 * @param {ExtensionReplacement[]} replacements Extension replacements
 * @returns {Promise<Extension[]>}
 */
async function getTurbowarpGalleryExtensions(url, name, replacements) {
	return new Promise(async (resolve, reject) => {
		try {
			/** @type {string[]} */
			const extensions = ExtendedJSON.parse(
				await (await fetch(`${url}extensions/extensions.json`)).text()
			);
			if (replacements)
				replacements.forEach((replacement) => {
					switch (replacement.type) {
						case 'removal': {
							extensions.splice(
								extensions.indexOf(replacement.replacement),
								1
							);
							break;
						}
						case 'addition': {
							extensions.push(replacement.replacement);
							break;
						}
					}
				});
			resolve(
				extensions.map((ext) => {
					/** @type {Extension} */
					const extension = {
						id: ext,
						featured: isFeatured(ext),
					};
					messages.push(
						`${chalk.gray('added')} ${chalk.blueBright(
							ext
						)} ${chalk.gray('for')} ${chalk.blueBright(name)}`
					);
					return extension;
				})
			);
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * @typedef {Object} PenguinModExtension
 * @property {string} name
 * @property {string} description
 * @property {string} code
 * @property {string} banner
 * @property {string} creator
 * @property {string} [creatorAlias]
 * @property {boolean} isGitHub
 * @property {boolean} [unstable]
 * @property {string} [unstableReason]
 */

/**
 * Returns all penguin mod galleries
 * @param {ExtensionGalleryLocation[]} galleryLocations A list of root urls for penguin mod galleries
 * @returns {Promise<ExtensionGallery[]>}
 */
async function getPenguinModGalleries(galleryLocations) {
	return new Promise(async (resolve, reject) => {
		try {
			/** @type {ExtensionGallery[]} */
			const galleries = [];
			for (const i in galleryLocations) {
				const extensions = await getPenguinModGalleryExtensions(
					galleryLocations[i].location,
					galleryLocations[i].name,
					galleryLocations[i].replacements
				);
				galleries.push({
					type: 'penguin-mod-gallery',
					id: galleryLocations[i].name
						.toLowerCase()
						.replaceAll(' ', '_'),
					name: galleryLocations[i].name,
					priority: galleryLocations[i].priority,
					icon: galleryLocations[i].icon,
					smallIcon: galleryLocations[i].smallIcon,
					location: galleryLocations[i].location,
					viewLocation: galleryLocations[i].viewLocation,
					extensions,
				});
			}
			resolve(galleries);
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * Adds extensions from a penguin mod gallery
 * @param {string} url The root url of the penguin mod gallery
 * @param {string} name The name of the penguin mod gallery
 * @param {ExtensionReplacement[]} replacements Extension replacements
 * @returns {Promise<Extension[]>}
 */
async function getPenguinModGalleryExtensions(url, name, replacements) {
	return new Promise(async (resolve, reject) => {
		try {
			/** @type {PenguinModExtension[]} */
			const extensions = await extractJsonExport(
				await (await fetch(`${url}src/lib/extensions.js`)).text()
			);
			if (replacements)
				replacements.forEach((replacement) => {
					switch (replacement.type) {
						case 'removal': {
							extensions.splice(
								extensions.findIndex(
									(extension) =>
										extension.code.slice(
											0,
											extension.code.lastIndexOf('.js')
										) == replacement.replacement
								),
								1
							);
							break;
						}
						case 'addition': {
							extensions.push(replacement.replacement);
							break;
						}
					}
				});
			resolve(
				extensions.map((ext) => {
					const id = ext.code.slice(0, ext.code.lastIndexOf('.js'));
					/** @type {Extension} */
					const extension = {
						id,
						metadata: getMetaDataForPenguinModExtension(ext),
						featured: isFeatured(id),
					};
					messages.push(
						`${chalk.gray('added')} ${chalk.blueBright(
							id
						)} ${chalk.gray('for')} ${chalk.blueBright(name)}`
					);
					return extension;
				})
			);
		} catch (e) {
			reject(e);
		}
	});
}

/**
 *
 * @param {PenguinModExtension} ext Extension data
 * @returns {ExtensionMetaData}
 */
function getMetaDataForPenguinModExtension(ext) {
	/** @type {ExtensionAuthor | undefined} */
	const creator =
		ext.creator != undefined
			? {
					type: 'creator',
					name:
						ext.creatorAlias != null
							? ext.creatorAlias
							: ext.creator,
					link:
						ext.isGitHub === true
							? `https://github.com/${ext.creator}`
							: `https://scratch.mit.edu/users/${ext.creator}`,
			  }
			: undefined;
	/** @type {ExtensionMetaData} */
	const metadata = {
		id: ext.code.slice(0, ext.code.lastIndexOf('.js')),
		name: ext.name,
		description: ext.description,
		credits: [creator],
		banner: ext.banner,
		badges: ext.unstable
			? [
					{
						name: 'Unstable',
						tooltip: ext.unstableReason,
					},
			  ]
			: [],
	};
	return metadata;
}

/**
 * Extracts JSON from a files exports
 * @param {string} fileContent The content of the file to extract exports from
 * @returns {Promise<PenguinModExtension[]>}
 */
async function extractJsonExport(fileContent) {
	try {
		// Search for the export statement and extract all exported objects.
		const exportsIndex = fileContent.indexOf('export default [') + 15;

		if (exportsIndex > -1) {
			/** @type {string} */
			const exportedObjects = fileContent.slice(
				exportsIndex,
				fileContent.indexOf(';', exportsIndex)
			);

			// Parse the extracted text as JSON.

			return JSON5.parse(exportedObjects);
		}

		throw new Error('Export not found in the file.');
	} catch (error) {
		throw new Error(`Error fetching or processing the file: ${error}`);
	}
}
