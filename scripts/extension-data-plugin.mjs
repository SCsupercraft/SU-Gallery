import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as process from 'node:process';

import ExtendedJSON from '@turbowarp/json';

import logSymbols from 'log-symbols';
import ora from 'ora';
import { Chalk } from 'chalk';
const chalk = new Chalk();

import { BuildHelper } from './helper.mjs';
import { Globals, galleryTypes } from './extension-data.mjs';
import './extension-data-types.mjs';

/**
 * @type {import('./build.config.mjs').Plugin}
 */
export class ExtensionDataPlugin {
	/**
	 * @type {(import('./extension-data.mjs').ExtensionGalleryData)[]}
	 */
	static galleries = [];

	/**
	 * Initializes this plugin
	 * @returns {Promise<void>}
	 */
	static async initialize() {
		return new Promise(async (resolve, reject) => {
			Globals.spinner = ora(
				chalk.yellowBright('Grabbing galleries...')
			).start();
			Globals.spinner.color = 'yellow';

			let galleries;
			try {
				const data = await fs.readFile(
					path.resolve(process.cwd(), 'scripts/.galleries.json'),
					'utf-8'
				);
				galleries = JSON.parse(data);
				Globals.spinner.succeed(chalk.greenBright('Galleries grabbed'));
			} catch (e) {
				Globals.spinner.fail(
					chalk.redBright('Failed to grab galleries')
				);
				reject(`Failed to grab galleries. ${e}`);
			}
			let totalExtensions = 0;
			/**
			 * Loads an extension gallery.
			 * @param {import('./extension-data.mjs').ExtensionGallery} gallery The extension gallery.
			 */
			const createGallery = (gallery) => {
				totalExtensions += gallery.extensions.length;
				this.galleries.push(new galleryTypes[gallery.type](gallery));
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
						`app/data/gallery/unknown-extension.svg`
					),
					path.resolve(
						BuildHelper.prebuildDirectory,
						`extension-data/banner/unknown.svg`
					)
				);
				await BuildHelper.copy(
					path.resolve(
						process.cwd(),
						`app/data/gallery/unknown-gallery.svg`
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
				ExtensionDataPlugin.extendedData = ExtendedJSON.parse(
					await fs.readFile(
						path.resolve(
							process.cwd(),
							'app/data/gallery/extend.json'
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
					JSON.stringify({
						lastUpdated: Date.now(),
						data: [],
					}),
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
