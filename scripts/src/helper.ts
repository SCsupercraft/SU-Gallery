import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';
import * as path from 'node:path';
import type { Abortable } from 'node:events';
import type Stream from 'node:stream';

export class BuildHelper {
	/**
	 * The path of the `public` directory.
	 */
	static publicDirectory: string;
	/**
	 * The path of the `public/gallery` directory.
	 */
	static galleryDirectory: string;

	static async write(
		filepath: string,
		data:
			| string
			| NodeJS.ArrayBufferView
			| Iterable<string | NodeJS.ArrayBufferView>
			| AsyncIterable<string | NodeJS.ArrayBufferView>
			| Stream,
		options?:
			| (fsSync.ObjectEncodingOptions & {
					mode?: fsSync.Mode | undefined;
					flag?: fsSync.OpenMode | undefined;
					flush?: boolean | undefined;
			  } & Abortable)
			| BufferEncoding
			| null
	) {
		await fs.mkdir(path.dirname(filepath), {
			recursive: true,
		});
		fsSync.closeSync(fsSync.openSync(filepath, 'w'));
		await fs.writeFile(filepath, data, options);
	}

	static async copy(src: string, dest: string) {
		await fs.mkdir(path.dirname(dest), {
			recursive: true,
		});
		fsSync.closeSync(fsSync.openSync(dest, 'w'));
		await fs.copyFile(src, dest);
	}

	static async preInitialization() {
		if (!(await BuildHelper.exists(this.publicDirectory))) {
			await fs.mkdir(this.publicDirectory);
		}

		if (await BuildHelper.exists(this.galleryDirectory)) {
			await fs.rm(this.galleryDirectory, {
				recursive: true,
				force: true,
			});
		}
		await fs.mkdir(this.galleryDirectory);
	}

	static async deleteDirectory(path: string) {
		let exists = await BuildHelper.exists(path);
		if (exists) {
			await fs.rm(path, {
				recursive: true,
				force: true,
			});
		}
	}

	static async exists(path: string): Promise<boolean> {
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

	static parse(input: string, path: string): any {
		try {
			return JSON.parse(input);
		} catch (e) {
			throw `Failed to parse json file '${path}'. ${e}`;
		}
	}
}
