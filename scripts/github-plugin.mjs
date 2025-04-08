import * as path from 'node:path';
import * as process from 'node:process';

import logSymbols from 'log-symbols';

import { Chalk } from 'chalk';
const chalk = new Chalk();

import { BuildHelper } from './helper.mjs';

/**
 * @type {import('./build.config.mjs').Plugin}
 */
export class GithubPlugin {
	/**
	 * Initializes this plugin
	 * @returns {Promise<void>}
	 */
	static async initialize() {
		return new Promise(async (resolve, reject) => {
			resolve();
		});
	}

	/**
	 * Finalizes this plugin
	 * @returns {Promise<void>}
	 */
	static async finalize() {
		return new Promise(async (resolve, reject) => {
			if (process.env.dev == 'true') return;
			try {
				BuildHelper.copy(
					path.resolve(BuildHelper.getClientBuildDir(), 'index.html'),
					path.resolve(BuildHelper.getClientBuildDir(), '404.html')
				);
				console.log(
					chalk.green(
						`${logSymbols.success} Successfully added 404 page\n`
					)
				);
			} catch (e) {
				reject(`Failed to add 404 page. ${e}`);
			}
			resolve();
		});
	}
}
