import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import * as path from 'node:path';

export class BuildHelper {
	/**
	 * The path of the `.build` directory, used to store temporary files used in the final build.
	 * @type {string}
	 */
	static prebuildDirectory;
	/**
	 * The path of the `build` directory used in production.
	 * @type {string}
	 */
	static buildDirectory;

	/**
	 *
	 * @param {import("node:fs").PathLike | import("node:fs/promises").FileHandle} filepath
	 * @param {string} data
	 * @param {*} options
	 */
	static async write(filepath, data, options) {
		await fs.mkdir(path.dirname(filepath), {
			recursive: true,
		});
		fsSync.closeSync(fsSync.openSync(filepath, 'w'));
		await fs.writeFile(filepath, data, options);
	}
	/**
	 *
	 * @param {import("node:fs").PathLike | import("node:fs/promises").FileHandle} src
	 * @param {import("node:fs").PathLike | import("node:fs/promises").FileHandle} dest
	 */
	static async copy(src, dest) {
		await fs.mkdir(path.dirname(dest), {
			recursive: true,
		});
		fsSync.closeSync(fsSync.openSync(dest, 'w'));
		await fs.copyFile(src, dest);
	}

	/**
	 * Gets the client build directory.
	 * @returns {string} The client build directory.
	 */
	static getClientBuildDir() {
		return path.resolve(this.buildDirectory, 'client');
	}

	/**
	 * Runs before build plugins are initialized
	 */
	static async preInitialization() {
		const exists = await BuildHelper.exists(this.prebuildDirectory);
		if (exists) {
			await fs.rm(this.prebuildDirectory, {
				recursive: true,
				force: true,
			});
			await fs.mkdir(this.prebuildDirectory, {
				recursive: true,
			});
		} else {
			await fs.mkdir(this.prebuildDirectory);
		}
	}

	/**
	 * Checks if a file or directory exists at the specified path
	 * @param {import("node:fs").PathLike | import("node:fs/promises").FileHandle} path The path to check
	 * @returns {Promise<boolean>} True if the path exists, false otherwise
	 */
	static async exists(path) {
		return new Promise(async (resolve, reject) => {
			await fs
				.stat(path)
				.then(async (stat) => {
					resolve(true);
				})
				.catch(async (e) => {
					if (e.code === 'ENOENT') {
						resolve(false);
					} else {
						reject(e);
					}
				});
		});
	}
}
