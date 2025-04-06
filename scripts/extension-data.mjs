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
 * @property {string} location This is the root url of the gallery, this property is only for external extension galleries.
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

/**
 * @typedef {Object} ExtensionJson
 * @property {number} lastUpdated
 * @property {ExtensionGallery[]} data
 */

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import ora from 'ora';
import { Chalk } from 'chalk';
const chalk = new Chalk();

import { BuildHelper } from './helper.mjs';

export class Globals {
	/**
	 * The current spinner
	 * @type {import('ora').Ora}
	 */
	static spinner;
	/**
	 * An array of messages to log once the spinner has stopped
	 * @type {string[]}
	 */
	static messages;
	/**
	 * Contains extended metadata for extensions.
	 */
	static extendedData = {};
}

/**
 * @type {{[key: string]: ExtensionData}}
 */
export const extensionTypes = {};

/**
 * @type {{[key: string]: ExtensionGalleryData}}
 */
export const galleryTypes = {};

/**
 * Get the text representation of the galleries type.
 * @param {GalleryType} type The type of gallery.
 * @param {string} [location] The gallery location.
 */
export function getGalleryTypeText(type, location) {
	switch (type) {
		case 'local':
			return `(${type})`;
		case 'turbowarp':
		case 'penguinmod':
		case 'ruby':
			return `(${type}@${location})`;
	}
}

/**
 * @param {string} string
 * @param {string} split
 * @returns {string[]}
 */
export function splitFirst(string, split) {
	const idx = string.indexOf(split);
	if (idx === -1) {
		return [string];
	}
	return [string.substring(0, idx), string.substring(idx + split.length)];
}

/**
 * Parses text and returns the author parsed
 * @param {string} data Data to parse
 * @param {'creator' | 'originalCreator'} type The type of author
 * @returns {ExtensionAuthor} The author parsed
 */
export function parseAuthor(data, type) {
	const parts = splitFirst(data, '<');
	if (parts.length === 1) {
		/** @type {ExtensionAuthor} */
		const author = {
			type,
			name: data,
		};
		return author;
	}

	const name = parts[0].trim();
	const link = parts[1].replace('>', '');

	/** @type {ExtensionAuthor} */
	const author = {
		type,
		name,
		link,
	};

	return author;
}

/**
 * Parses text and returns the badge parsed
 * @param {string} data Data to parse
 * @returns {ExtensionBadge} The badge parsed
 */
export function parseBadge(data) {
	const parts = splitFirst(data, '-');
	if (parts.length === 1) {
		/** @type {ExtensionBadge} */
		const badge = {
			name: data,
		};
		return badge;
	}

	const name = parts[0].trim();
	const tooltip = parts[1].trim();

	/** @type {ExtensionBadge} */
	const badge = {
		name,
		tooltip,
	};

	return badge;
}

/**
 * Parses an extensions meta code from it's code
 * @param {string} extensionId The id of the extension to parse
 * @param {string} galleryId The id of the gallery the extension is part of
 */
export async function parseMetaData(extensionId, galleryId) {
	const code = await fs.readFile(
		path.resolve(
			BuildHelper.prebuildDirectory,
			`extension-data/code/${galleryId}/${extensionId}.js`
		),
		'utf-8'
	);

	/** @type {ExtensionMetaData} */
	const metadata = {
		id: extensionId,
		name: '',
		description: '',
		credits: [],
		badges: [],
		license: '',
		banner: '',
		featured: false,
	};

	for (const line of code.split('\n')) {
		if (!line.startsWith('//')) {
			// End of header.
			break;
		}

		const withoutComment = line.substring(2).trim();
		const parts = splitFirst(withoutComment, ':');
		if (parts.length === 1) {
			// Invalid.
			continue;
		}

		const key = parts[0].toLowerCase().trim();
		const value = parts[1].trim();

		switch (key) {
			case 'name':
				metadata.name = value;
				break;
			case 'description':
				metadata.description = value;
				break;
			case 'license':
				metadata.license = value;
				break;
			case 'by':
				metadata.credits.push(parseAuthor(value, 'creator'));
				break;
			case 'original':
				metadata.credits.push(parseAuthor(value, 'originalCreator'));
				break;
			case 'badge':
				metadata.badges.push(parseBadge(value));
				break;
			default:
				break;
		}
	}
	return metadata;
}

export class ExtensionData {
	/**
	 * The extension id
	 * @type {string}
	 */
	id;
	/**
	 * The file extension of this extensions banner
	 * @type {string}
	 */
	banner;
	/**
	 * Is the extension featured
	 * @type {boolean}
	 */
	featured;
	/**
	 * The gallery this extension is in
	 * @type {ExtensionGallery}
	 */
	gallery;

	/**
	 * Takes in an extension object.
	 * @param {Extension} extension
	 * @param {ExtensionGallery} gallery
	 */
	constructor(extension, gallery) {
		this.id = extension.id;
		this.featured = extension.featured != null ? extension.featured : false;
		this.gallery = gallery;

		Globals.messages.push(
			`${chalk.gray('loaded')} ${chalk.blueBright(this.id)}`
		);
	}

	/**
	 * Adds this extension. (Runs before initial build)
	 * @returns {Promise<void>}
	 */
	async addExtension() {
		return new Promise(async (resolve, reject) => {
			try {
				await this.addCode();
				await this.addBanner();
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * Finalizes this extension. (Runs after initial build)
	 * @returns {Promise<void>}
	 */
	async finalize() {
		return new Promise(async (resolve, reject) => {
			try {
				await this.moveFilesToBuild();
				await this.addToGalleryJson();
			} catch (e) {
				reject(`Failed to finalize extension ${this.id}. ${e}`);
			}
			resolve();
		});
	}

	/**
	 * Adds the code to the `prebuildDirectory`
	 * @returns {Promise<void>}
	 */
	async addCode() {
		return new Promise(async (resolve, reject) => {
			reject('Method not implemented!');
		});
	}

	/**
	 * Adds the banner to the `prebuildDirectory`
	 * @returns {Promise<void>}
	 */
	async addBanner() {
		return new Promise(async (resolve, reject) => {
			reject('Method not implemented!');
		});
	}

	/**
	 * Adds the extension metadata to the `galleries.json` file
	 * @returns {Promise<void>}
	 */
	async addToGalleryJson() {
		return new Promise(async (resolve, reject) => {
			reject('Method not implemented!');
		});
	}

	/**
	 * Move the extensions files from the `prebuild` directory to the `build` directory
	 * @returns {Promise<void>}
	 */
	async moveFilesToBuild() {
		return new Promise(async (resolve, reject) => {
			try {
				await BuildHelper.copy(
					path.resolve(
						BuildHelper.prebuildDirectory,
						`extension-data/code/${this.gallery.id}/${this.id}.js`
					),
					path.resolve(
						BuildHelper.getClientBuildDir(),
						`gallery/extensions/code/${this.gallery.id}/${this.id}.js`
					)
				);
				if (this.banner != undefined)
					await BuildHelper.copy(
						path.resolve(
							BuildHelper.prebuildDirectory,
							`extension-data/banner/${this.gallery.id}/${this.id}.${this.banner}`
						),
						path.resolve(
							BuildHelper.getClientBuildDir(),
							`gallery/extensions/banner/${this.gallery.id}/${this.id}.${this.banner}`
						)
					);
			} catch (e) {
				reject(e);
			}
			resolve();
		});
	}
}

export class ExtensionGalleryData {
	/**
	 * The id of this gallery
	 * @type {string}
	 */
	id;
	/**
	 * The name of this gallery
	 * @type {string}
	 */
	name;
	/**
	 * The file extension of this gallery's icon
	 * @type {string}
	 */
	icon;
	/**
	 * Should the icon be smaller?
	 * @type {boolean}
	 */
	smallIcon;
	/**
	 * The location of this gallery
	 * @type {string}
	 */
	location;
	/**
	 * This is the url of the gallery's website, where the user would normally find the gallery's extension.
	 * @type {string?}
	 */
	viewLocation;
	/**
	 * This is the url of the gallery's icon
	 * @type {string}
	 */
	iconLocation;
	/**
	 * The data of this gallery (Used for loading extensions in the initialization phase)
	 * @type {ExtensionGallery}
	 */
	galleryData = {};
	/**
	 * The data of this gallery's extensions (Used for loading extensions in the initialization phase)
	 * @type {Extension[]}
	 */
	extensionData = [];
	/**
	 * The extensions loaded by this gallery during initialization
	 * @type {ExtensionData[]}
	 */
	extensions = [];

	/**
	 * Takes in a gallery object.
	 * @param {ExtensionGallery} gallery
	 */
	constructor(gallery) {
		this.id = gallery.id;
		this.name = gallery.name;
		this.smallIcon = gallery.smallIcon;
		this.location = gallery.location;
		this.viewLocation = gallery.viewLocation;
		this.iconLocation = gallery.icon;
		this.galleryData = gallery;
		this.extensionData = gallery.extensions;

		console.log(
			`${chalk.gray('found')} ${chalk.blueBright(this.name)} ${chalk.grey(
				this.getGalleryTypeText()
			)}`
		);
	}

	/**
	 * Gets the text representation of the gallery type
	 * @returns {string} The text representation of the gallery type;
	 */
	getGalleryTypeText() {
		return getGalleryTypeText(
			this.galleryData.type,
			this.galleryData.viewLocation || this.galleryData.location
		);
	}

	/**
	 * Initializes this gallery. (Runs before initial build)
	 * @returns {Promise<void>}
	 */
	async initialize() {
		return new Promise(async (resolve, reject) => {
			try {
				await this.addIcon();
				await this.loadExtensions();
				resolve();
			} catch (e) {
				reject(e);
			}
		});
	}

	/**
	 * Finalizes this gallery. (Runs after initial build)
	 * @returns {Promise<void>}
	 */
	async finalize() {
		return new Promise(async (resolve, reject) => {
			try {
				await this.moveFilesToBuild();
				await this.addToGalleryJson();
				await this.postbuildAddExtensions();
			} catch (e) {
				reject(`Failed to finalize gallery ${this.id}. ${e}`);
			}
			resolve();
		});
	}

	/**
	 * Adds the icon to the `prebuildDirectory`
	 * @returns {Promise<void>}
	 */
	async addIcon() {
		return new Promise(async (resolve, reject) => {
			reject('Method not implemented!');
		});
	}

	/**
	 * Loads all of the extensions under this gallery.
	 * @returns {Promise<void>}
	 */
	async loadExtensions() {
		return new Promise(async (resolve, reject) => {
			(async () => {
				Globals.spinner = ora({
					text: `${chalk.yellowBright(
						'Loading extensions from'
					)} ${chalk.blueBright(this.name + '...')} ${chalk.gray(
						this.getGalleryTypeText()
					)}`,
					color: 'yellow',
				}).start();
			})();

			try {
				Globals.messages = [];

				for (const i in this.extensionData) {
					const extension = this.extensionData[i];
					Globals.spinner.suffixText = chalk.gray(
						`(${Number.parseInt(i) + 1}/${
							this.extensionData.length
						} - ${extension.id})`
					);
					this.extensions.push(
						new extensionTypes[this.galleryData.type](
							extension,
							this.galleryData
						)
					);
				}
				Globals.spinner.suffixText = '';
				Globals.spinner.succeed(
					`${chalk.green(
						`Loaded ${this.extensionData.length} extensions from`
					)} ${chalk.blueBright(this.name)} ${chalk.gray(
						this.getGalleryTypeText()
					)}`
				);
				Globals.messages.forEach((message) => {
					console.log(`${message}`);
				});
			} catch (e) {
				Globals.spinner.suffixText = '';
				Globals.spinner.fail(
					chalk.redBright(
						`Failed to load ${
							this.extensionData.length
						} extensions from ${this.name} ${chalk.gray(
							this.getGalleryTypeText()
						)}`
					)
				);
				Globals.messages.forEach((message) => {
					console.log(`${message}`);
				});
				reject(
					`Failed to load ${this.extensionData.length} extensions from ${this.name}. ${e}`
				);
			}
			resolve();
		});
	}

	/**
	 * Adds all of the extensions under this gallery.
	 * @returns {Promise<void>}
	 */
	async prebuildAddExtensions() {
		return new Promise(async (resolve, reject) => {
			(async () => {
				Globals.spinner = ora({
					text: `${chalk.yellowBright(
						'Adding extensions from'
					)} ${chalk.blueBright(this.name + '...')} ${chalk.gray(
						this.getGalleryTypeText()
					)}`,
					color: 'yellow',
				}).start();
			})();

			try {
				Globals.messages = [];

				for (const i in this.extensions) {
					const extension = this.extensions[i];
					Globals.spinner.suffixText = chalk.gray(
						`(${Number.parseInt(i) + 1}/${
							this.extensions.length
						} - ${extension.id})`
					);
					await extension.addExtension();
				}
				Globals.spinner.suffixText = '';
				Globals.spinner.succeed(
					`${chalk.green(
						`Added ${this.extensions.length} extensions from`
					)} ${chalk.blueBright(this.name)} ${chalk.gray(
						this.getGalleryTypeText()
					)}`
				);
				Globals.messages.forEach((message) => {
					console.log(`${message}`);
				});
			} catch (e) {
				Globals.spinner.suffixText = '';
				Globals.spinner.fail(
					chalk.redBright(
						`Failed to add ${
							this.extensions.length
						} extensions from ${this.name} ${chalk.gray(
							this.getGalleryTypeText()
						)}`
					)
				);
				Globals.messages.forEach((message) => {
					console.log(`${message}`);
				});
				reject(
					`Failed to add ${this.extensions.length} extensions from ${this.name}. ${e}`
				);
			}
			resolve();
		});
	}

	/**
	 * Adds all of the extensions under this gallery.
	 * @returns {Promise<void>}
	 */
	async postbuildAddExtensions() {
		return new Promise(async (resolve, reject) => {
			(async () => {
				Globals.spinner = ora({
					text: `${chalk.yellowBright(
						'Adding extensions from'
					)} ${chalk.blueBright(this.name + '...')} ${chalk.gray(
						this.getGalleryTypeText()
					)}`,
					color: 'yellow',
				}).start();
			})();

			try {
				Globals.messages = [];

				for (const i in this.extensions) {
					const extension = this.extensions[i];
					Globals.spinner.suffixText = chalk.gray(
						`(${Number.parseInt(i) + 1}/${
							this.extensions.length
						} - ${extension.id})`
					);
					await extension.finalize();
				}
				Globals.spinner.suffixText = '';
				Globals.spinner.succeed(
					`${chalk.green(
						`Added ${this.extensions.length} extensions from`
					)} ${chalk.blueBright(this.name)} ${chalk.gray(
						this.getGalleryTypeText()
					)}`
				);
				Globals.messages.forEach((message) => {
					console.log(`${message}`);
				});
			} catch (e) {
				Globals.spinner.suffixText = '';
				Globals.spinner.fail(
					chalk.redBright(
						`Failed to add ${
							this.extensions.length
						} extensions from ${this.name} ${chalk.gray(
							this.getGalleryTypeText()
						)}`
					)
				);
				Globals.messages.forEach((message) => {
					console.log(`${message}`);
				});
				reject(
					`Failed to add ${this.extensions.length} extensions from ${this.name}. ${e}`
				);
			}
			resolve();
		});
	}

	/**
	 * Adds the gallery metadata to the `galleries.json` file
	 * @returns {Promise<void>}
	 */
	async addToGalleryJson() {
		const extensionsJson = path.resolve(
			BuildHelper.getClientBuildDir(),
			'gallery/extensions/galleries.json'
		);
		return new Promise(async (resolve, reject) => {
			/** @type {ExtensionJson} */
			const json = JSON.parse(await fs.readFile(extensionsJson, 'utf-8'));
			json.data.push({
				id: this.id,
				name: this.name,
				icon: this.icon,
				smallIcon: this.smallIcon,
				viewLocation: this.viewLocation,
				extensions: [],
			});
			await BuildHelper.write(
				extensionsJson,
				JSON.stringify(json),
				'utf-8'
			);
			Globals.messages.push(
				`${chalk.gray('added metadata for')} ${chalk.blueBright(
					this.name
				)}`
			);
			resolve();
		});
	}

	/**
	 * Move the extensions files from the `prebuild` directory to the `build` directory
	 * @returns {Promise<void>}
	 */
	async moveFilesToBuild() {
		return new Promise(async (resolve, reject) => {
			try {
				if (this.icon != undefined)
					await BuildHelper.copy(
						path.resolve(
							BuildHelper.prebuildDirectory,
							`extension-data/galleries/${this.id}.${this.icon}`
						),
						path.resolve(
							BuildHelper.getClientBuildDir(),
							`gallery/galleries/${this.id}.${this.icon}`
						)
					);
			} catch (e) {
				reject(e);
			}
			resolve();
		});
	}
}
