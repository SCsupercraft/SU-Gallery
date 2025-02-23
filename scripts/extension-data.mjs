import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import * as path from 'node:path';
import * as process from 'node:process';

import ExtendedJSON from '@turbowarp/json';

import logSymbols from 'log-symbols';
import ora from 'ora';
import { Chalk } from 'chalk';
const chalk = new Chalk();

import { BuildHelper } from './helper.mjs';

/**
 * @typedef {Object} ExtensionGallery
 * @property {'local' | 'turbowarp-gallery' | 'penguin-mod-gallery'} type The type of gallery.
 * @property {string} id The gallery id. (Used to find files)
 * @property {string} name The gallery name. (Displayed in gallery)
 * @property {string} icon This is the url of the gallery's icon (Displayed in gallery)
 * @property {boolean} smallIcon Should the icon be smaller?
 * @property {string} [location] This is the root url of the gallery, this property is only for external extension galleries.
 * @property {string} [viewLocation] This is the url of the gallery's website, where the user would normally find the gallery's extension. (Displayed in gallery)
 * @property {Extension[]} extensions A list of extensions in this gallery. (Displayed in gallery)
 */

/**
 * @typedef {Object} ExtensionGalleryMetaData
 * @property {string} id The gallery id. (Used to find files)
 * @property {string} name The gallery name. (Displayed in gallery)
 * @property {string} icon The file extension of the gallery's icon. (Used to find the correct file)
 * @property {string} [viewLocation] This is the url of the gallery's website, where the user would normally find the gallery's extension.
 * @property {ExtensionMetaData[]} extensions A list of extensions in this gallery. (Displayed in gallery)
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
 * @type {import('./build.config.mjs').Plugin}
 */
export class ExtensionData {
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
	 * @type {(LocalGallery | TurbowarpGallery | PenguinModGallery)[]}
	 */
	static galleries = [];
	/**
	 * Contains extended metadata for extensions.
	 */
	static extendedData = {};

	/**
	 * Initializes this plugin
	 * @returns {Promise<void>}
	 */
	static async initialize() {
		return new Promise(async (resolve, reject) => {
			ExtensionData.spinner = ora(
				chalk.yellowBright('Grabbing galleries...')
			).start();
			ExtensionData.spinner.color = 'yellow';

			let galleries;
			try {
				const data = await fs.readFile(
					path.resolve(process.cwd(), 'scripts/.galleries.json'),
					'utf-8'
				);
				galleries = JSON.parse(data);
				ExtensionData.spinner.succeed(
					chalk.greenBright('Galleries grabbed')
				);
			} catch (e) {
				ExtensionData.spinner.fail(
					chalk.redBright('Failed to grab galleries')
				);
				reject(`Failed to grab galleries. ${e}`);
			}
			let totalExtensions = 0;
			/**
			 * Loads an extension gallery.
			 * @param {ExtensionGallery} gallery The extension gallery.
			 */
			const createGallery = (gallery) => {
				totalExtensions += gallery.extensions.length;
				switch (gallery.type) {
					case 'local': {
						this.galleries.push(new LocalGallery(gallery));
						break;
					}
					case 'turbowarp-gallery': {
						this.galleries.push(new TurbowarpGallery(gallery));
						break;
					}
					case 'penguin-mod-gallery': {
						this.galleries.push(new PenguinModGallery(gallery));
						break;
					}
				}
			};
			galleries.forEach(createGallery);

			try {
				for (const i in this.galleries) {
					const gallery = this.galleries[i];
					await gallery.initialize();
				}
				console.log(
					chalk.green(
						`${logSymbols.success} Loaded ${totalExtensions} extensions from ${this.galleries.length} galleries\n`
					)
				);
			} catch (e) {
				reject(
					`Failed to load ${this.galleries.length} galleries. ${e}`
				);
			}
			try {
				await BuildHelper.copy(
					path.resolve(
						process.cwd(),
						`app/data/gallery/extensions/banner/unknown.svg`
					),
					path.resolve(
						BuildHelper.prebuildDirectory,
						`extension-data/banner/unknown.svg`
					)
				);
				await BuildHelper.copy(
					path.resolve(
						process.cwd(),
						`app/data/gallery/galleries/unknown.svg`
					),
					path.resolve(
						BuildHelper.prebuildDirectory,
						`extension-data/galleries/unknown.svg`
					)
				);

				for (const i in this.galleries) {
					const gallery = this.galleries[i];
					await gallery.prebuildAddExtensions();
				}
				console.log(
					chalk.green(
						`${logSymbols.success} Added ${totalExtensions} extensions from ${this.galleries.length} galleries`
					)
				);
			} catch (e) {
				reject(
					`Failed to add ${this.galleries.length} galleries. ${e}`
				);
			}

			resolve();
		});
	}

	/**
	 * Finalizes this plugin
	 * @returns {Promise<void>}
	 */
	static async finalize() {
		return new Promise(async (resolve, reject) => {
			try {
				ExtensionData.extendedData = ExtendedJSON.parse(
					await fs.readFile(
						path.resolve(
							process.cwd(),
							'app/data/gallery/extensions/extend.json'
						),
						'utf-8'
					)
				);
				console.log(
					chalk.green(
						`${logSymbols.success} Successfully read extended metadata\n`
					)
				);
			} catch (e) {
				reject(`Failed to read extended metadata. ${e}`);
			}
			try {
				await BuildHelper.copy(
					path.resolve(
						BuildHelper.prebuildDirectory,
						'extension-data/banner/unknown.svg'
					),
					path.resolve(
						BuildHelper.getClientBuildDir(),
						'gallery/extensions/banner/unknown.svg'
					)
				);
				await BuildHelper.copy(
					path.resolve(
						BuildHelper.prebuildDirectory,
						'extension-data/galleries/unknown.svg'
					),
					path.resolve(
						BuildHelper.getClientBuildDir(),
						'gallery/galleries/unknown.svg'
					)
				);
				await BuildHelper.write(
					path.resolve(
						BuildHelper.getClientBuildDir(),
						'gallery/extensions/galleries.json'
					),
					'[]',
					'utf-8'
				);
				for (const i in this.galleries) {
					const gallery = this.galleries[i];
					await gallery.finalize();
				}
				const totalExtensions = this.galleries.reduce(
					(total, gallery) => {
						return total + gallery.extensions.length;
					},
					0
				);
				console.log(
					chalk.green(
						`${logSymbols.success} Added ${totalExtensions} extensions from ${this.galleries.length} galleries`
					)
				);
			} catch (e) {
				reject(
					`Failed to add ${this.galleries.length} galleries. ${e}`
				);
			}
			resolve();
		});
	}
}

class LocalGallery {
	/**
	 * The id of this gallery
	 * @type {string}
	 */
	id;
	/**
	 * The name of this gallery
	 * @type {string}
	 */
	name = '';
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
	 * @type {LocalExtensionData[]}
	 */
	extensions = [];

	/**
	 * Takes in a gallery object.
	 * The provided gallery type must be `local`
	 * @param {ExtensionGallery} gallery
	 */
	constructor(gallery) {
		if (gallery.type != 'local') throw new Error('Invalid gallery type!');

		this.id = gallery.id;
		this.name = gallery.name;
		this.smallIcon = gallery.smallIcon;
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
		return '(local)';
	}

	/**
	 * Initializes this gallery. (Runs before initial build)
	 * @returns {Promise<void>}
	 */
	async initialize() {
		return new Promise(async (resolve, reject) => {
			try {
				await this.findIconExtension();
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
			try {
				await BuildHelper.copy(
					path.resolve(
						process.cwd(),
						`app/data/gallery/galleries/${this.id}.${this.icon}`
					),
					path.resolve(
						BuildHelper.prebuildDirectory,
						`extension-data/galleries/${this.id}.${this.icon}`
					)
				);
			} catch (e) {}
			resolve();
		});
	}

	/**
	 * Finds the file extension of the icon and updates `this.icon`
	 */
	async findIconExtension() {
		const extensions = ['svg', 'png', 'jpg'];
		for (let i in extensions) {
			const extension = extensions[i];
			const exists = await BuildHelper.exists(
				path.resolve(
					process.cwd(),
					`app/data/gallery/galleries/${this.id}.${extension}`
				)
			);
			if (exists) {
				this.icon = extension;
				break;
			}
		}
	}

	/**
	 * Loads all of the extensions under this gallery.
	 * @returns {Promise<void>}
	 */
	async loadExtensions() {
		return new Promise(async (resolve, reject) => {
			(async () => {
				ExtensionData.spinner = ora({
					text: `${chalk.yellowBright(
						'Loading extensions from'
					)} ${chalk.blueBright(this.name + '...')} ${chalk.gray(
						this.getGalleryTypeText()
					)}`,
					color: 'yellow',
				}).start();
			})();

			try {
				ExtensionData.messages = [];

				for (const i in this.extensionData) {
					const extension = this.extensionData[i];
					ExtensionData.spinner.suffixText = chalk.gray(
						`(${Number.parseInt(i) + 1}/${
							this.extensionData.length
						} - ${extension.id})`
					);
					this.extensions.push(
						new LocalExtensionData(extension, this.galleryData)
					);
				}
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.succeed(
					`${chalk.green(
						`Loaded ${this.extensionData.length} extensions from`
					)} ${chalk.blueBright(this.name)} ${chalk.gray(
						this.getGalleryTypeText()
					)}`
				);
				ExtensionData.messages.forEach((message) => {
					console.log(`${message}`);
				});
			} catch (e) {
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.fail(
					chalk.redBright(
						`Failed to load ${
							this.extensionData.length
						} extensions from ${this.name} ${chalk.gray(
							this.getGalleryTypeText()
						)}`
					)
				);
				ExtensionData.messages.forEach((message) => {
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
				ExtensionData.spinner = ora({
					text: `${chalk.yellowBright(
						'Adding extensions from'
					)} ${chalk.blueBright(this.name + '...')} ${chalk.gray(
						this.getGalleryTypeText()
					)}`,
					color: 'yellow',
				}).start();
			})();

			try {
				ExtensionData.messages = [];

				for (const i in this.extensions) {
					const extension = this.extensions[i];
					ExtensionData.spinner.suffixText = chalk.gray(
						`(${Number.parseInt(i) + 1}/${
							this.extensions.length
						} - ${extension.id})`
					);
					await extension.addExtension();
				}
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.succeed(
					`${chalk.green(
						`Added ${this.extensions.length} extensions from`
					)} ${chalk.blueBright(this.name)} ${chalk.gray(
						this.getGalleryTypeText()
					)}`
				);
				ExtensionData.messages.forEach((message) => {
					console.log(`${message}`);
				});
			} catch (e) {
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.fail(
					chalk.redBright(
						`Failed to add ${
							this.extensions.length
						} extensions from ${this.name} ${chalk.gray(
							this.getGalleryTypeText()
						)}`
					)
				);
				ExtensionData.messages.forEach((message) => {
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
				ExtensionData.spinner = ora({
					text: `${chalk.yellowBright(
						'Adding extensions from'
					)} ${chalk.blueBright(this.name + '...')} ${chalk.gray(
						this.getGalleryTypeText()
					)}`,
					color: 'yellow',
				}).start();
			})();

			try {
				ExtensionData.messages = [];

				for (const i in this.extensions) {
					const extension = this.extensions[i];
					ExtensionData.spinner.suffixText = chalk.gray(
						`(${Number.parseInt(i) + 1}/${
							this.extensions.length
						} - ${extension.id})`
					);
					await extension.finalize();
				}
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.succeed(
					`${chalk.green(
						`Added ${this.extensions.length} extensions from`
					)} ${chalk.blueBright(this.name)} ${chalk.gray(
						this.getGalleryTypeText()
					)}`
				);
				ExtensionData.messages.forEach((message) => {
					console.log(`${message}`);
				});
			} catch (e) {
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.fail(
					chalk.redBright(
						`Failed to add ${
							this.extensions.length
						} extensions from ${this.name} ${chalk.gray(
							this.getGalleryTypeText()
						)}`
					)
				);
				ExtensionData.messages.forEach((message) => {
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
			/** @type {ExtensionGalleryMetaData[]} */
			const json = JSON.parse(await fs.readFile(extensionsJson, 'utf-8'));
			json.push({
				id: this.id,
				name: this.name,
				icon: this.icon,
				smallIcon: this.smallIcon,
				extensions: [],
			});
			await BuildHelper.write(
				extensionsJson,
				JSON.stringify(json),
				'utf-8'
			);
			ExtensionData.messages.push(
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

class TurbowarpGallery {
	/**
	 * The id of this gallery
	 * @type {string}
	 */
	id;
	/**
	 * The name of this gallery
	 * @type {string}
	 */
	name = '';
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
	location = '';
	/**
	 * This is the url of the gallery's website, where the user would normally find the gallery's extension.
	 * @type {string}
	 */
	viewLocation = '';
	/**
	 * This is the url of the gallery's icon
	 * @type {string}
	 */
	iconLocation = '';
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
	 * @type {TurbowarpGalleryExtensionData[]}
	 */
	extensions = [];

	/**
	 * Takes in a gallery object.
	 * The provided gallery type must be `turbowarp-gallery`
	 * @param {ExtensionGallery} gallery
	 */
	constructor(gallery) {
		if (gallery.type != 'turbowarp-gallery')
			throw new Error('Invalid gallery type!');

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
		return `(turbowarp-gallery@${this.viewLocation})`;
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
			try {
				if (!this.iconLocation) throw new Error();
				this.icon = this.iconLocation.split('.').pop();
				const banner = await fetch(this.iconLocation);
				/** @type {Blob} */
				const imgContent = await banner.blob();
				await BuildHelper.write(
					path.resolve(
						BuildHelper.prebuildDirectory,
						`extension-data/galleries/${this.id}.${this.icon}`
					),
					await imgContent.bytes(),
					'utf-8'
				);
			} catch (e) {}
			resolve();
		});
	}

	/**
	 * Loads all of the extensions under this gallery.
	 * @returns {Promise<void>}
	 */
	async loadExtensions() {
		return new Promise(async (resolve, reject) => {
			(async () => {
				ExtensionData.spinner = ora({
					text: `${chalk.yellowBright(
						'Loading extensions from'
					)} ${chalk.blueBright(this.name + '...')} ${chalk.gray(
						this.getGalleryTypeText()
					)}`,
					color: 'yellow',
				}).start();
			})();

			try {
				ExtensionData.messages = [];

				for (const i in this.extensionData) {
					const extension = this.extensionData[i];
					ExtensionData.spinner.suffixText = chalk.gray(
						`(${Number.parseInt(i) + 1}/${
							this.extensionData.length
						} - ${extension.id})`
					);
					this.extensions.push(
						new TurbowarpGalleryExtensionData(
							extension,
							this.galleryData
						)
					);
				}
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.succeed(
					`${chalk.green(
						`Loaded ${this.extensionData.length} extensions from`
					)} ${chalk.blueBright(this.name)} ${chalk.gray(
						this.getGalleryTypeText()
					)}`
				);
				ExtensionData.messages.forEach((message) => {
					console.log(`${message}`);
				});
			} catch (e) {
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.fail(
					chalk.redBright(
						`Failed to load ${
							this.extensionData.length
						} extensions from ${this.name} ${chalk.gray(
							this.getGalleryTypeText()
						)}`
					)
				);
				ExtensionData.messages.forEach((message) => {
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
				ExtensionData.spinner = ora({
					text: `${chalk.yellowBright(
						'Adding extensions from'
					)} ${chalk.blueBright(this.name + '...')} ${chalk.gray(
						this.getGalleryTypeText()
					)}`,
					color: 'yellow',
				}).start();
			})();

			try {
				ExtensionData.messages = [];

				for (const i in this.extensions) {
					const extension = this.extensions[i];
					ExtensionData.spinner.suffixText = chalk.gray(
						`(${Number.parseInt(i) + 1}/${
							this.extensions.length
						} - ${extension.id})`
					);
					await extension.addExtension();
				}
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.succeed(
					`${chalk.green(
						`Added ${this.extensions.length} extensions from`
					)} ${chalk.blueBright(this.name)} ${chalk.gray(
						this.getGalleryTypeText()
					)}`
				);
				ExtensionData.messages.forEach((message) => {
					console.log(`${message}`);
				});
			} catch (e) {
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.fail(
					chalk.redBright(
						`Failed to add ${
							this.extensions.length
						} extensions from ${this.name} ${chalk.gray(
							this.getGalleryTypeText()
						)}`
					)
				);
				ExtensionData.messages.forEach((message) => {
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
				ExtensionData.spinner = ora({
					text: `${chalk.yellowBright(
						'Adding extensions from'
					)} ${chalk.blueBright(this.name + '...')} ${chalk.gray(
						this.getGalleryTypeText()
					)}`,
					color: 'yellow',
				}).start();
			})();

			try {
				ExtensionData.messages = [];

				for (const i in this.extensions) {
					const extension = this.extensions[i];
					ExtensionData.spinner.suffixText = chalk.gray(
						`(${Number.parseInt(i) + 1}/${
							this.extensions.length
						} - ${extension.id})`
					);
					await extension.finalize();
				}
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.succeed(
					`${chalk.green(
						`Added ${this.extensions.length} extensions from`
					)} ${chalk.blueBright(this.name)} ${chalk.gray(
						this.getGalleryTypeText()
					)}`
				);
				ExtensionData.messages.forEach((message) => {
					console.log(`${message}`);
				});
			} catch (e) {
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.fail(
					chalk.redBright(
						`Failed to add ${
							this.extensions.length
						} extensions from ${this.name} ${chalk.gray(
							this.getGalleryTypeText()
						)}`
					)
				);
				ExtensionData.messages.forEach((message) => {
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
			/** @type {ExtensionGalleryMetaData[]} */
			const json = JSON.parse(await fs.readFile(extensionsJson, 'utf-8'));
			json.push({
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
			ExtensionData.messages.push(
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

class PenguinModGallery {
	/**
	 * The id of this gallery
	 * @type {string}
	 */
	id;
	/**
	 * The name of this gallery
	 * @type {string}
	 */
	name = '';
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
	location = '';
	/**
	 * This is the url of the gallery's website, where the user would normally find the gallery's extension.
	 * @type {string}
	 */
	viewLocation = '';
	/**
	 * This is the url of the gallery's icon
	 * @type {string}
	 */
	iconLocation = '';
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
	 * @type {PenguinModGalleryExtensionData[]}
	 */
	extensions = [];

	/**
	 * Takes in a gallery object.
	 * The provided gallery type must be `penguin-mod-gallery`
	 * @param {ExtensionGallery} gallery
	 */
	constructor(gallery) {
		if (gallery.type != 'penguin-mod-gallery')
			throw new Error('Invalid gallery type!');

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
		return `(penguin-mod-gallery@${this.viewLocation})`;
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
			try {
				if (!this.iconLocation) throw new Error();
				this.icon = this.iconLocation.split('.').pop();
				const banner = await fetch(this.iconLocation);
				/** @type {Blob} */
				const imgContent = await banner.blob();
				await BuildHelper.write(
					path.resolve(
						BuildHelper.prebuildDirectory,
						`extension-data/galleries/${this.id}.${this.icon}`
					),
					await imgContent.bytes(),
					'utf-8'
				);
			} catch (e) {}
			resolve();
		});
	}

	/**
	 * Loads all of the extensions under this gallery.
	 * @returns {Promise<void>}
	 */
	async loadExtensions() {
		return new Promise(async (resolve, reject) => {
			(async () => {
				ExtensionData.spinner = ora({
					text: `${chalk.yellowBright(
						'Loading extensions from'
					)} ${chalk.blueBright(this.name + '...')} ${chalk.gray(
						this.getGalleryTypeText()
					)}`,
					color: 'yellow',
				}).start();
			})();

			try {
				ExtensionData.messages = [];

				for (const i in this.extensionData) {
					const extension = this.extensionData[i];
					ExtensionData.spinner.suffixText = chalk.gray(
						`(${Number.parseInt(i) + 1}/${
							this.extensionData.length
						} - ${extension.id})`
					);
					this.extensions.push(
						new PenguinModGalleryExtensionData(
							extension,
							this.galleryData
						)
					);
				}
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.succeed(
					`${chalk.green(
						`Loaded ${this.extensionData.length} extensions from`
					)} ${chalk.blueBright(this.name)} ${chalk.gray(
						this.getGalleryTypeText()
					)}`
				);
				ExtensionData.messages.forEach((message) => {
					console.log(`${message}`);
				});
			} catch (e) {
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.fail(
					chalk.redBright(
						`Failed to load ${
							this.extensionData.length
						} extensions from ${this.name} ${chalk.gray(
							this.getGalleryTypeText()
						)}`
					)
				);
				ExtensionData.messages.forEach((message) => {
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
				ExtensionData.spinner = ora({
					text: `${chalk.yellowBright(
						'Adding extensions from'
					)} ${chalk.blueBright(this.name + '...')} ${chalk.gray(
						this.getGalleryTypeText()
					)}`,
					color: 'yellow',
				}).start();
			})();

			try {
				ExtensionData.messages = [];

				for (const i in this.extensions) {
					const extension = this.extensions[i];
					ExtensionData.spinner.suffixText = chalk.gray(
						`(${Number.parseInt(i) + 1}/${
							this.extensions.length
						} - ${extension.id})`
					);
					await extension.addExtension();
				}
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.succeed(
					`${chalk.green(
						`Added ${this.extensions.length} extensions from`
					)} ${chalk.blueBright(this.name)} ${chalk.gray(
						this.getGalleryTypeText()
					)}`
				);
				ExtensionData.messages.forEach((message) => {
					console.log(`${message}`);
				});
			} catch (e) {
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.fail(
					chalk.redBright(
						`Failed to add ${
							this.extensions.length
						} extensions from ${this.name} ${chalk.gray(
							this.getGalleryTypeText()
						)}`
					)
				);
				ExtensionData.messages.forEach((message) => {
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
				ExtensionData.spinner = ora({
					text: `${chalk.yellowBright(
						'Adding extensions from'
					)} ${chalk.blueBright(this.name + '...')} ${chalk.gray(
						this.getGalleryTypeText()
					)}`,
					color: 'yellow',
				}).start();
			})();

			try {
				ExtensionData.messages = [];

				for (const i in this.extensions) {
					const extension = this.extensions[i];
					ExtensionData.spinner.suffixText = chalk.gray(
						`(${Number.parseInt(i) + 1}/${
							this.extensions.length
						} - ${extension.id})`
					);
					await extension.finalize();
				}
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.succeed(
					`${chalk.green(
						`Added ${this.extensions.length} extensions from`
					)} ${chalk.blueBright(this.name)} ${chalk.gray(
						this.getGalleryTypeText()
					)}`
				);
				ExtensionData.messages.forEach((message) => {
					console.log(`${message}`);
				});
			} catch (e) {
				ExtensionData.spinner.suffixText = '';
				ExtensionData.spinner.fail(
					chalk.redBright(
						`Failed to add ${
							this.extensions.length
						} extensions from ${this.name} ${chalk.gray(
							this.getGalleryTypeText()
						)}`
					)
				);
				ExtensionData.messages.forEach((message) => {
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
			/** @type {ExtensionGalleryMetaData[]} */
			const json = JSON.parse(await fs.readFile(extensionsJson, 'utf-8'));
			json.push({
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
			ExtensionData.messages.push(
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

/**
 * @param {string} string
 * @param {string} split
 * @returns {string[]}
 */
const splitFirst = (string, split) => {
	const idx = string.indexOf(split);
	if (idx === -1) {
		return [string];
	}
	return [string.substring(0, idx), string.substring(idx + split.length)];
};

/**
 * Parses text and returns the author parsed
 * @param {string} data Data to parse
 * @param {'creator' | 'originalCreator'} type The type of author
 * @returns {ExtensionAuthor} The author parsed
 */
function parseAuthor(data, type) {
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
function parseBadge(data) {
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
async function parseMetaData(extensionId, galleryId) {
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

class LocalExtensionData {
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
	 * The provided gallery type must be `local`
	 * @param {Extension} extension
	 * @param {ExtensionGallery} gallery
	 */
	constructor(extension, gallery) {
		if (gallery.type != 'local') throw new Error('Invalid gallery type!');

		this.id = extension.id;
		this.featured = extension.featured != null ? extension.featured : false;
		this.gallery = gallery;

		ExtensionData.messages.push(
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
			try {
				await BuildHelper.copy(
					path.resolve(
						process.cwd(),
						`app/data/gallery/extensions/code/${this.id}.js`
					),
					path.resolve(
						BuildHelper.prebuildDirectory,
						`extension-data/code/${this.gallery.id}/${this.id}.js`
					)
				);
				ExtensionData.messages.push(
					`${chalk.gray('added code for')} ${chalk.blueBright(
						this.id
					)}`
				);
			} catch (e) {
				reject(`Failed to add extension ${this.id}. ${e}`);
			}
			resolve();
		});
	}

	/**
	 * Adds the banner to the `prebuildDirectory`
	 * @returns {Promise<void>}
	 */
	async addBanner() {
		return new Promise(async (resolve, reject) => {
			try {
				await this.findBannerExtension();
				await BuildHelper.copy(
					path.resolve(
						process.cwd(),
						`app/data/gallery/extensions/banner/${this.id}.${this.banner}`
					),
					path.resolve(
						BuildHelper.prebuildDirectory,
						`extension-data/banner/${this.gallery.id}/${this.id}.${this.banner}`
					)
				);
				ExtensionData.messages.push(
					`${chalk.gray('added banner for')} ${chalk.blueBright(
						this.id
					)}`
				);
			} catch (e) {
				ExtensionData.messages.push(
					chalk.yellowBright(`${this.id} has no extension banner`)
				);
			}
			resolve();
		});
	}

	/**
	 * Finds the file extension of the banner and updates `this.banner`
	 */
	async findBannerExtension() {
		const extensions = ['svg', 'png', 'jpg'];
		for (let i in extensions) {
			const extension = extensions[i];
			const exists = await BuildHelper.exists(
				path.resolve(
					process.cwd(),
					`app/data/gallery/extensions/banner/${this.id}.${extension}`
				)
			);
			if (exists) {
				this.banner = extension;
				break;
			}
		}
		if (!this.banner) throw new Error(`${this.id} has no extension banner`);
	}

	/**
	 * Adds the extension metadata to the `galleries.json` file
	 * @returns {Promise<void>}
	 */
	async addToGalleryJson() {
		const extensionsJson = path.resolve(
			BuildHelper.getClientBuildDir(),
			'gallery/extensions/galleries.json'
		);
		return new Promise(async (resolve, reject) => {
			/** @type {ExtensionGalleryMetaData[]} */
			const json = JSON.parse(await fs.readFile(extensionsJson, 'utf-8'));
			const parsed = {
				...(await parseMetaData(this.id, this.gallery.id)),
				...ExtensionData.extendedData[this.id],
				banner: this.banner,
				featured: this.featured,
			};
			json.find((gallery) => {
				return gallery.name === this.gallery.name;
			}).extensions.push(parsed);
			await BuildHelper.write(
				extensionsJson,
				JSON.stringify(json),
				'utf-8'
			);
			ExtensionData.messages.push(
				`${chalk.gray('added metadata for')} ${chalk.blueBright(
					this.id
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

class TurbowarpGalleryExtensionData {
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
	 * The provided gallery type must be `turbowarp-gallery`
	 * @param {Extension} extension
	 * @param {ExtensionGallery} gallery
	 */
	constructor(extension, gallery) {
		if (gallery.type != 'turbowarp-gallery')
			throw new Error('Invalid gallery type!');

		this.id = extension.id;
		this.featured = extension.featured != null ? extension.featured : false;
		this.gallery = gallery;

		ExtensionData.messages.push(
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
			try {
				const code = await fetch(
					`${this.gallery.location}extensions/${this.id}.js`
				);
				if (code.status != 200)
					throw new Error(
						`Failed to fetch code for ${this.id}. Tried to fetch ${this.gallery.location}extensions/${this.id}.js`
					);
				await BuildHelper.write(
					path.resolve(
						BuildHelper.prebuildDirectory,
						`extension-data/code/${this.gallery.id}/${this.id}.js`
					),
					await code.text(),
					'utf-8'
				);
				ExtensionData.messages.push(
					`${chalk.gray('added code for')} ${chalk.blueBright(
						this.id
					)}`
				);
			} catch (e) {
				reject(`Failed to add extension ${this.id}. ${e}`);
			}
			resolve();
		});
	}
	/**
	 * Adds the banner to the `prebuildDirectory`
	 * @returns {Promise<void>}
	 */
	async addBanner() {
		return new Promise(async (resolve, reject) => {
			try {
				await this.findBannerExtension();
				const banner = await fetch(
					`${this.gallery.location}/images/${this.id}.${this.banner}`
				);
				/** @type {Blob} */
				const imgContent = await banner.blob();
				await BuildHelper.write(
					path.resolve(
						BuildHelper.prebuildDirectory,
						`extension-data/banner/${this.gallery.id}/${this.id}.${this.banner}`
					),
					await imgContent.bytes(),
					'utf-8'
				);
				ExtensionData.messages.push(
					`${chalk.gray('added banner for')} ${chalk.blueBright(
						this.id
					)}`
				);
			} catch (e) {
				ExtensionData.messages.push(
					chalk.yellowBright(`${this.id} has no extension banner`)
				);
			}
			resolve();
		});
	}

	/**
	 * Finds the file extension of the banner and updates `this.banner`
	 */
	async findBannerExtension() {
		const extensions = ['svg', 'png', 'jpg'];
		for (let i in extensions) {
			const extension = extensions[i];
			try {
				const banner = await fetch(
					`${this.gallery.location}/images/${this.id}.${extension}`
				);
				if (banner.ok) {
					this.banner = extension;
					break;
				}
			} catch (e) {}
		}
		if (!this.banner) throw new Error(`${this.id} has no extension banner`);
	}

	/**
	 * Adds the extension metadata to the `galleries.json` file
	 * @returns {Promise<void>}
	 */
	async addToGalleryJson() {
		const extensionsJson = path.resolve(
			BuildHelper.getClientBuildDir(),
			'gallery/extensions/galleries.json'
		);
		return new Promise(async (resolve, reject) => {
			/** @type {ExtensionGalleryMetaData[]} */
			const json = JSON.parse(await fs.readFile(extensionsJson, 'utf-8'));
			const parsed = {
				...(await parseMetaData(this.id, this.gallery.id)),
				...ExtensionData.extendedData[this.id],
				banner: this.banner,
				featured: this.featured,
			};
			json.find((gallery) => {
				return gallery.name === this.gallery.name;
			}).extensions.push(parsed);
			await BuildHelper.write(
				extensionsJson,
				JSON.stringify(json),
				'utf-8'
			);
			ExtensionData.messages.push(
				`${chalk.gray('added metadata for')} ${chalk.blueBright(
					this.id
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

class PenguinModGalleryExtensionData {
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
	 * @type {ExtensionMetaData}
	 */
	metadata;
	/**
	 * The gallery this extension is in
	 * @type {ExtensionGallery}
	 */
	gallery;

	/**
	 * Takes in an extension object.
	 * The provided gallery type must be `penguin-mod-gallery`
	 * @param {Extension} extension
	 * @param {ExtensionGallery} gallery
	 */
	constructor(extension, gallery) {
		if (gallery.type != 'penguin-mod-gallery')
			throw new Error('Invalid gallery type!');

		this.id = extension.id;
		this.banner = extension.metadata.banner.slice(
			extension.metadata.banner.lastIndexOf('.') + 1,
			extension.metadata.banner.length
		);
		this.featured = extension.featured != null ? extension.featured : false;
		this.metadata = extension.metadata;
		this.gallery = gallery;

		ExtensionData.messages.push(
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
			try {
				const code = await fetch(
					`${this.gallery.location}static/extensions/${this.id}.js`
				);
				if (code.status != 200)
					throw new Error(
						`Failed to fetch code for ${this.id}. Tried to fetch ${this.gallery.location}/static/extensions/${this.id}.js`
					);
				await BuildHelper.write(
					path.resolve(
						BuildHelper.prebuildDirectory,
						`extension-data/code/${this.gallery.id}/${this.id}.js`
					),
					await code.text(),
					'utf-8'
				);
				ExtensionData.messages.push(
					`${chalk.gray('added code for')} ${chalk.blueBright(
						this.id
					)}`
				);
			} catch (e) {
				reject(`Failed to add extension ${this.id}. ${e}`);
			}
			resolve();
		});
	}
	/**
	 * Adds the banner to the `prebuildDirectory`
	 * @returns {Promise<void>}
	 */
	async addBanner() {
		return new Promise(async (resolve, reject) => {
			try {
				if (!this.metadata.banner)
					throw new Error(`${this.id} has no extension banner`);
				const banner = await fetch(
					`${this.gallery.location}/static/images/${this.metadata.banner}`
				);
				/** @type {Blob} */
				const imgContent = await banner.blob();
				await BuildHelper.write(
					path.resolve(
						BuildHelper.prebuildDirectory,
						`extension-data/banner/${this.gallery.id}/${this.id}.${this.banner}`
					),
					await imgContent.bytes(),
					'utf-8'
				);
				ExtensionData.messages.push(
					`${chalk.gray('added banner for')} ${chalk.blueBright(
						this.id
					)}`
				);
			} catch (e) {
				ExtensionData.messages.push(
					chalk.yellowBright(`${this.id} has no extension banner`)
				);
			}
			resolve();
		});
	}

	/**
	 * Adds the extension metadata to the `galleries.json` file
	 * @returns {Promise<void>}
	 */
	async addToGalleryJson() {
		const extensionsJson = path.resolve(
			BuildHelper.getClientBuildDir(),
			'gallery/extensions/galleries.json'
		);
		return new Promise(async (resolve, reject) => {
			/** @type {ExtensionGalleryMetaData[]} */
			const json = JSON.parse(await fs.readFile(extensionsJson, 'utf-8'));
			json.find((gallery) => {
				return gallery.name === this.gallery.name;
			}).extensions.push({
				...this.metadata,
				...ExtensionData.extendedData[this.id],
				banner: this.banner,
				featured: this.featured,
			});
			await BuildHelper.write(
				extensionsJson,
				JSON.stringify(json),
				'utf-8'
			);
			ExtensionData.messages.push(
				`${chalk.gray('added metadata for')} ${chalk.blueBright(
					this.id
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
				if (this.metadata.banner != undefined)
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
