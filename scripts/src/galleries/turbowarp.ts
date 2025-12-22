import {
	ExtensionGallery,
	type GalleryJSON_Extension,
	type GalleryJSON_Gallery,
	type GalleryModification_AddSupportedMod,
	type GalleryModification_RemoveExtension,
	type RemoteDownloads,
	type RemoteGalleryData,
} from '../extension-gallery.js';
import ExtendedJSON from '@turbowarp/json';
import { BuildHelper } from '../helper.js';
import path from 'path';
import chalk from 'chalk';
import { readFile } from 'fs/promises';

export type GalleryModification =
	| GalleryModification_RemoveExtension
	| GalleryModification_AddSupportedMod;

export class TurboWarpExtensionGallery extends ExtensionGallery<
	RemoteGalleryData,
	GalleryModification
> {
	private extensions: TurboWarpExtension[] = [];
	private readonly icon?: string;

	public constructor(
		data: RemoteGalleryData,
		modifications: GalleryModification[]
	) {
		super(data, modifications, 'turbowarp');
		this.icon = data.iconExtension
			? data.iconExtension
			: data.iconUrl?.substring(data.iconUrl.lastIndexOf('.') + 1);
	}

	public isRemote(): boolean {
		return true;
	}

	public extensionCount(): number {
		return this.extensions.length;
	}

	public async refresh(logger: (message: string) => void): Promise<void> {
		const extensions = ExtendedJSON.parse(
			await (
				await fetch(
					`${this.data.sourceLocation}extensions/extensions.json`
				)
			).text()
		) as string[];
		if (!Array.isArray(extensions))
			throw `Failed to load gallery data. Expected an array, but found an object.`;

		const removedExtensions =
			this.getModifications<GalleryModification_RemoveExtension>(
				'remove'
			).map((v) => v.extensionId);

		for (const extensionId of extensions) {
			if (typeof extensionId != 'string')
				throw `Failed to load extension data. Expected extension id to be a string.\nFound: ${extensionId}`;
			if (removedExtensions.includes(extensionId)) continue;

			const extension = new TurboWarpExtension(this, extensionId);
			this.extensions.push(extension);
		}

		logger(`found ${this.extensionCount()} extension(s)`);
	}

	public async downloadRemote(downloads: RemoteDownloads): Promise<void> {
		if (this.data.iconUrl)
			downloads.addDownloadTask(this.data.iconUrl, async (response) => {
				const imgContent = await response.blob();
				await BuildHelper.write(
					path.resolve(
						BuildHelper.galleryDirectory,
						`galleries/${this.galleryId}.${this.icon}`
					),
					await imgContent.bytes(),
					'utf-8'
				);
			});
		for (const extension of this.extensions) {
			await extension.fetchExtension(
				downloads.addDownloadSubTask(extension.id())
			);
		}
	}

	public async validateAssets(
		logger: (message: string) => void
	): Promise<void> {
		if (this.data.iconUrl) {
			const iconFile = path.resolve(
				BuildHelper.galleryDirectory,
				`galleries/${this.galleryId}.${this.icon}`
			);
			if (!(await BuildHelper.exists(iconFile)))
				throw `Failed to find gallery icon! Expected the file '${iconFile}' to exist.`;
		}
		for (const extension of this.extensions) {
			await extension.validateAssets(logger);
		}
	}

	public generateJson(): GalleryJSON_Gallery {
		return {
			id: this.galleryId,
			name: this.galleryName,
			iconExtension: this.icon,
			smallIcon: this.data.smallIcon,
			extensions: this.processAddSupportedMod(
				this.extensions.map((extension) => extension.generateJson())
			),
			viewLocation: this.data.viewLocation,
		};
	}

	public async copyFiles(): Promise<void> {}
}

type Author = {
	name: string;
	link?: string;
};

class TurboWarpExtension {
	protected bannerExtension?: string;
	protected name: string = '';
	protected description: string = '';
	protected license?: string;
	protected authors?: Author[];
	protected originalAuthors?: Author[];

	public constructor(
		protected readonly gallery: TurboWarpExtensionGallery,
		protected readonly extensionId: string
	) {}

	public id(): string {
		return this.extensionId;
	}

	public async fetchExtension(downloads: RemoteDownloads): Promise<void> {
		downloads.addDownloadTask(
			`${this.gallery.data.sourceLocation}extensions/${this.extensionId}.js`,
			async (response) => {
				if (response.status != 200)
					throw `Failed to fetch code for '${this.extensionId}'. Tried to fetch '${this.gallery.data.sourceLocation}extensions/${this.extensionId}.js'`;

				await BuildHelper.write(
					path.resolve(
						BuildHelper.galleryDirectory,
						'extensions/code',
						this.gallery.id(),
						this.extensionId + '.js'
					),
					await response.text(),
					'utf-8'
				);
				await this.parseMetaData();
			}
		);

		const extensions = ['svg', 'png', 'jpg', 'gif'];
		for (let extension of extensions) {
			try {
				if (
					await this.remoteFileExists(
						`${this.gallery.data.sourceLocation}images/${this.extensionId}.${extension}`
					)
				) {
					this.bannerExtension = extension;
					downloads.addDownloadTask(
						`${this.gallery.data.sourceLocation}images/${this.extensionId}.${extension}`,
						async (response) => {
							if (response.status != 200)
								throw `Failed to fetch banner for '${this.extensionId}'. Tried to fetch '${this.gallery.data.sourceLocation}images/${this.extensionId}.${extension}'`;
							const imgContent: Blob = await response.blob();
							await BuildHelper.write(
								path.resolve(
									BuildHelper.galleryDirectory,
									'extensions/banner',
									this.gallery.id(),
									`${this.extensionId}.${this.bannerExtension}`
								),
								await imgContent.bytes(),
								'utf-8'
							);
						}
					);
					break;
				}
			} catch (e) {}
		}
	}

	public async validateAssets(
		logger: (message: string) => void
	): Promise<void> {
		const codeFile = path.resolve(
			BuildHelper.galleryDirectory,
			'extensions/code',
			this.gallery.id(),
			this.extensionId + '.js'
		);
		if (!(await BuildHelper.exists(codeFile)))
			throw `Failed to find extension code! Expected the file '${codeFile}' to exist.`;
		if (!this.bannerExtension) {
			logger(chalk.yellow(`missing banner for ${this.extensionId}`));
		} else {
			const bannerFile = path.resolve(
				BuildHelper.galleryDirectory,
				'extensions/banner',
				this.gallery.id(),
				`${this.extensionId}.${this.bannerExtension}`
			);
			if (!(await BuildHelper.exists(bannerFile)))
				throw `Failed to find extension banner! Expected the file '${codeFile}' to exist.`;
		}
	}

	public generateJson(): GalleryJSON_Extension {
		return {
			id: this.extensionId,
			name: this.name,
			description: this.description,
			authors: this.authors ? this.authors : [],
			originalAuthors: this.originalAuthors ? this.originalAuthors : [],
			badges: [],
			supports: [],
			maySupport: [],
			duplicate: false,
			license: this.license,
			bannerExtension: this.bannerExtension,
		};
	}

	async remoteFileExists(url: string): Promise<boolean> {
		try {
			const response = await fetch(url, { method: 'HEAD' });
			return response.status === 200;
		} catch (error) {
			return false;
		}
	}

	async parseMetaData() {
		const code = await readFile(
			path.resolve(
				BuildHelper.galleryDirectory,
				'extensions/code',
				this.gallery.id(),
				this.extensionId + '.js'
			),
			'utf-8'
		);

		for (const line of code.split('\n')) {
			if (!line.startsWith('//')) {
				// End of header.
				break;
			}

			const withoutComment = line.substring(2).trim();
			const parts = this.splitFirst(withoutComment, ':');
			if (parts.length === 1) {
				// Invalid.
				continue;
			}

			const key = parts[0]!.toLowerCase().trim();
			const value = parts[1]!.trim();

			switch (key) {
				case 'name':
					this.name = value;
					break;
				case 'description':
					this.description = value;
					break;
				case 'license':
					this.license = value;
					break;
				case 'by':
					if (!this.authors) this.authors = [];
					this.authors.push(this.parseAuthor(value));
					break;
				case 'original':
					if (!this.originalAuthors) this.originalAuthors = [];
					this.originalAuthors.push(this.parseAuthor(value));
					break;
				default:
					break;
			}
		}
	}

	splitFirst(string: string, split: string): string[] {
		const idx = string.indexOf(split);
		if (idx === -1) {
			return [string];
		}
		return [string.substring(0, idx), string.substring(idx + split.length)];
	}

	parseAuthor(data: string) {
		const parts = this.splitFirst(data, '<');
		if (parts.length === 1) {
			const author: Author = {
				name: data,
			};
			return author;
		}

		const name = parts[0]!.trim();
		const link = parts[1]!.replace('>', '');

		const author: Author = {
			name,
			link,
		};

		return author;
	}
}
