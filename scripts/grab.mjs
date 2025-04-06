import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as process from 'node:process';

import ora from 'ora';
import { Chalk } from 'chalk';
const chalk = new Chalk();

import ExtendedJSON from '@turbowarp/json';
import JSON5 from 'json5';

import { BuildHelper } from './helper.mjs';
import config from './build.config.mjs';

/**
 * @typedef {Object} GrabGallery
 * @property {string} name The gallery name. (Displayed in gallery)
 * @property {int} priority The gallery's priority.
 * @property {string} location This is the root url of the gallery, this property is only for external extension galleries.
 * @property {string} [viewLocation] This is the url of the gallery's website, where the user would normally find the gallery's extension. (Displayed in gallery)
 * @property {GalleryType} type The type of gallery.
 * @property {string} [icon] This is the location of the gallery's icon (Displayed in gallery)
 * @property {boolean} [smallIcon] Should the icon be smaller?
 * @property {GrabExtensionReplacement[]} [replacements] Allows replacing extensions in the extension list.
 */

/**
 * @typedef {Object} GrabConfig
 * @property {GrabGallery[]} galleries
 */

/**
 * @typedef {Object} GrabExtensionReplacement
 * @property {"removal" | "addition"} type The type of replacement
 * @property {string | PenguinModExtension} replacement
 */

/**
 * @typedef {"local" | "turbowarp" | "penguinmod"} GalleryType
 */

/**
 * @typedef {Object} ExtensionGallery
 * @property {GalleryType} type The type of gallery.
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
 * @param {GalleryType} type The type of gallery.
 * @param {string} [location] The gallery location.
 */
function getGalleryTypeText(type, location) {
	switch (type) {
		case 'local':
			return `(${type})`;
		case 'turbowarp':
		case 'penguinmod':
		case 'ruby':
			return `(${type}@${location})`;
	}
}

class GalleryHelper {
	/**
	 * Gets the gallery's extensions
	 * @param {GrabGallery} gallery The gallery's grab information
	 * @returns {Promise<Extension[]>} A promise that resolves to a list of extensions
	 */
	getExtensions(gallery) {
		throw new Error('');
	}
}

/**
 * @type {{[key: string]: GalleryHelper}}
 */
const galleryTypes = {};

galleryTypes['local'] = new (class extends GalleryHelper {
	/**
	 * Gets the gallery's extensions
	 * @param {GrabGallery} gallery The gallery's grab information
	 * @returns {Promise<Extension[]>} A promise that resolves to a list of extensions
	 */
	getExtensions(gallery) {
		return new Promise(async (resolve, reject) => {
			/** @type {string[]} */
			const extensions = ExtendedJSON.parse(
				await fs.readFile(
					path.resolve(
						process.cwd(),
						gallery.location,
						'extensions.json'
					),
					'utf-8'
				)
			);
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
						)} ${chalk.gray('for')} ${chalk.green(gallery.name)}`
					);
					return extension;
				})
			);
		});
	}
})();

galleryTypes['turbowarp'] = new (class extends GalleryHelper {
	/**
	 * Gets the gallery's extensions
	 * @param {GrabGallery} gallery The gallery's grab information
	 * @returns {Promise<Extension[]>} A promise that resolves to a list of extensions
	 */
	getExtensions(gallery) {
		return new Promise(async (resolve, reject) => {
			try {
				/** @type {string[]} */
				const extensions = ExtendedJSON.parse(
					await (
						await fetch(
							`${gallery.location}extensions/extensions.json`
						)
					).text()
				);
				if (gallery.replacements)
					gallery.replacements.forEach((replacement) => {
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
							)} ${chalk.gray('for')} ${chalk.green(
								gallery.name
							)}`
						);
						return extension;
					})
				);
			} catch (e) {
				reject(e);
			}
		});
	}
})();

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

galleryTypes['penguinmod'] = new (class extends GalleryHelper {
	/**
	 * Gets the gallery's extensions
	 * @param {GrabGallery} gallery The gallery's grab information
	 * @returns {Promise<Extension[]>} A promise that resolves to a list of extensions
	 */
	getExtensions(gallery) {
		return new Promise(async (resolve, reject) => {
			try {
				/** @type {PenguinModExtension[]} */
				const extensions = await extractPmJsonExport(
					await (
						await fetch(`${gallery.location}src/lib/extensions.js`)
					).text()
				);
				if (gallery.replacements)
					gallery.replacements.forEach((replacement) => {
						switch (replacement.type) {
							case 'removal': {
								extensions.splice(
									extensions.findIndex(
										(extension) =>
											extension.code.slice(
												0,
												extension.code.lastIndexOf(
													'.js'
												)
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
						const id = ext.code.slice(
							0,
							ext.code.lastIndexOf('.js')
						);
						/** @type {Extension} */
						const extension = {
							id,
							metadata: getMetaDataForPenguinModExtension(ext),
							featured: isFeatured(id),
						};
						messages.push(
							`${chalk.gray('added')} ${chalk.blueBright(
								id
							)} ${chalk.gray('for')} ${chalk.green(
								gallery.name
							)}`
						);
						return extension;
					})
				);
			} catch (e) {
				reject(e);
			}
		});
	}
})();

/**
 * @typedef {Object} RubyExtension
 * @property {string} name
 * @property {string} description
 * @property {string} url
 * @property {string} thumb
 * @property {boolean} recommended
 * @property {boolean} legendary
 */

galleryTypes['ruby'] = new (class extends GalleryHelper {
	/**
	 * Gets the gallery's extensions
	 * @param {GrabGallery} gallery The gallery's grab information
	 * @returns {Promise<Extension[]>} A promise that resolves to a list of extensions
	 */
	getExtensions(gallery) {
		return new Promise(async (resolve, reject) => {
			try {
				/** @type {RubyExtension[]} */
				const extensions = JSON.parse(
					await (
						await fetch(`${gallery.location}data/extensions.json`)
					).text()
				);
				if (gallery.replacements)
					gallery.replacements.forEach((replacement) => {
						switch (replacement.type) {
							case 'removal': {
								extensions.splice(
									extensions.findIndex((extension) => {
										const code = extension.url
											.split('/')
											.pop();
										return (
											code.slice(
												0,
												code.lastIndexOf('.js')
											) == replacement.replacement
										);
									}),
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
						const code = ext.url.split('/').pop();
						const id = code.slice(0, code.lastIndexOf('.js'));

						/** @type {Extension} */
						const extension = {
							id,
							metadata: getMetaDataForRubyExtension(ext),
							featured: isFeatured(id),
						};
						messages.push(
							`${chalk.gray('added')} ${chalk.blueBright(
								id
							)} ${chalk.gray('for')} ${chalk.green(
								gallery.name
							)}`
						);
						return extension;
					})
				);
			} catch (e) {
				reject(e);
			}
		});
	}
})();

/** @type {ExtensionGallery[]} */
let galleries;
try {
	if (config.grab == null)
		throw new Error(
			'No grab config found! Make sure it exists at build.config.mjs'
		);

	featured = ExtendedJSON.parse(
		await fs.readFile(
			path.resolve(process.cwd(), 'app/data/gallery/featured.json'),
			'utf-8'
		)
	);

	galleries = (await getGalleries(config.grab.galleries))
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
 * Returns all galleries
 * @param {GrabGallery[]} galleries
 * @returns {Promise<ExtensionGallery[]>}
 */
async function getGalleries(galleries) {
	return new Promise(async (resolve, reject) => {
		/**
		 * @type {ExtensionGallery[]}
		 */
		const resolved = [];

		for (const i in galleries) {
			const gallery = galleries[i];
			if (!getGalleryTypeText(gallery.type, ''))
				reject(`Invalid gallery type ${gallery.type}`);

			resolved.push(await getGallery(gallery));
		}

		resolve(resolved);
	});
}

/**
 * Returns the extension gallery
 * @param {GrabGallery} gallery The gallery's grab information
 * @returns {Promise<ExtensionGallery>}
 */
async function getGallery(gallery) {
	return new Promise(async (resolve, reject) => {
		try {
			/** @type {ExtensionGallery} */
			const Gallery = {
				type: gallery.type,
				id: gallery.name.toLowerCase().replaceAll(' ', '_'),
				name: gallery.name,
				priority: gallery.priority,
				icon: gallery.icon,
				smallIcon: gallery.smallIcon,
				location: gallery.location,
				viewLocation: gallery.viewLocation,
				extensions: await galleryTypes[gallery.type].getExtensions(
					gallery
				),
			};
			resolve(Gallery);
		} catch (e) {
			reject(e);
		}
	});
}

/**
 *
 * @param {PenguinModExtension} extension Extension data
 * @returns {ExtensionMetaData}
 */
function getMetaDataForPenguinModExtension(extension) {
	/** @type {ExtensionAuthor | undefined} */
	const creator =
		extension.creator != undefined
			? {
					type: 'creator',
					name:
						extension.creatorAlias != null
							? extension.creatorAlias
							: extension.creator,
					link:
						extension.isGitHub === true
							? `https://github.com/${extension.creator}`
							: `https://scratch.mit.edu/users/${extension.creator}`,
			  }
			: undefined;
	/** @type {ExtensionMetaData} */
	const metadata = {
		id: extension.code.slice(0, extension.code.lastIndexOf('.js')),
		name: extension.name,
		description: extension.description,
		credits: [creator],
		banner: extension.banner,
		badges: extension.unstable
			? [
					{
						name: 'Unstable',
						tooltip: extension.unstableReason,
					},
			  ]
			: [],
	};
	return metadata;
}

/**
 * Extracts JSON from a files exports (pm)
 * @param {string} fileContent The content of the file to extract exports from
 * @returns {Promise<PenguinModExtension[]>}
 */
async function extractPmJsonExport(fileContent) {
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

/**
 *
 * @param {RubyExtension} extension Extension data
 * @returns {ExtensionMetaData}
 */
function getMetaDataForRubyExtension(extension) {
	/** @type {ExtensionAuthor | undefined} */

	const code = extension.url.split('/').pop();

	/** @type {ExtensionMetaData} */
	const metadata = {
		id: code.slice(0, code.lastIndexOf('.js')),
		name: extension.name,
		description: extension.description,
		credits: [],
		banner: extension.thumb.split('/').pop(),
		badges: extension.legendary
			? [
					{
						name: 'Joke',
						tooltip:
							"This extension was made as a joke, please don't take it seriously",
					},
			  ]
			: [],
	};
	return metadata;
}
