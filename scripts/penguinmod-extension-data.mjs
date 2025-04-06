import {
	ExtensionData,
	ExtensionGalleryData,
	Globals,
} from './extension-data.mjs';

import * as fs from 'node:fs/promises';
import * as path from 'node:path';

import { Chalk } from 'chalk';
const chalk = new Chalk();

import { BuildHelper } from './helper.mjs';

export class PenguinmodExtensionData extends ExtensionData {
	/**
	 * @type {import("./extension-data.mjs").ExtensionMetaData}
	 */
	metadata;

	/**
	 * Takes in an extension object.
	 * @param {import("./extension-data.mjs").Extension} extension
	 * @param {import("./extension-data.mjs").ExtensionGallery} gallery
	 */
	constructor(extension, gallery) {
		super(extension, gallery);

		this.banner = extension.metadata.banner.slice(
			extension.metadata.banner.lastIndexOf('.') + 1,
			extension.metadata.banner.length
		);
		this.metadata = extension.metadata;
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
				Globals.messages.push(
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
				Globals.messages.push(
					`${chalk.gray('added banner for')} ${chalk.blueBright(
						this.id
					)}`
				);
			} catch (e) {
				messages().push(
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
			/** @type {import("./extension-data.mjs").ExtensionJson} */
			const json = JSON.parse(await fs.readFile(extensionsJson, 'utf-8'));
			json.data
				.find((gallery) => {
					return gallery.name === this.gallery.name;
				})
				.extensions.push({
					...this.metadata,
					...Globals.extendedData[this.id],
					banner: this.banner,
					featured: this.featured,
				});
			await BuildHelper.write(
				extensionsJson,
				JSON.stringify(json),
				'utf-8'
			);
			Globals.messages.push(
				`${chalk.gray('added metadata for')} ${chalk.blueBright(
					this.id
				)}`
			);
			resolve();
		});
	}
}
export class PenguinmodExtensionGalleryData extends ExtensionGalleryData {
	/**
	 * Adds the icon to the `prebuildDirectory`
	 * @returns {Promise<void>}
	 */
	async addIcon() {
		return new Promise(async (resolve, reject) => {
			try {
				if (!this.iconLocation) {
					console.log(
						chalk.yellowBright(
							`The gallery named '${this.name.toLowerCase()}' has no icon`
						)
					);
					resolve();
					return;
				}
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
				console.log(
					`${chalk.gray('added icon for')} ${chalk.blueBright(
						this.name
					)}`
				);
			} catch (e) {}
			resolve();
		});
	}
}
