import chalk from 'chalk';
import {
	ExtensionGallery,
	type GalleryJSON_Extension,
	type GalleryJSON_Gallery,
	type GalleryModification_AddSupportedMod,
	type GalleryModification_RemoveExtension,
	type RemoteDownloads,
	type RemoteGalleryData,
} from '../extension-gallery.js';
import { BuildHelper } from '../helper.js';
import path from 'path';

export type GalleryModification =
	| GalleryModification_RemoveExtension
	| GalleryModification_AddSupportedMod;

export class MistiumExtensionGallery extends ExtensionGallery<
	RemoteGalleryData,
	GalleryModification
> {
	private extensions: MistiumExtension[] = [];
	private readonly icon?: string;

	public constructor(
		data: RemoteGalleryData,
		modifications: GalleryModification[]
	) {
		super(data, modifications, 'mistium');
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
		const extensions = JSON.parse(
			await (
				await fetch(
					`${this.data.sourceLocation}generated-metadata/extensions-v0.json`
				)
			).text()
		).extensions as MistiumExtensionMetadata[];
		if (!Array.isArray(extensions))
			throw `Failed to load gallery data. Expected an array, but found an object.`;

		const removedExtensions =
			this.getModifications<GalleryModification_RemoveExtension>(
				'remove'
			).map((v) => v.extensionId);

		for (const metadata of extensions) {
			if (typeof metadata.id != 'string')
				throw `Failed to load extension data. Expected extension id to be a string.\nFound: ${metadata.id}`;
			if (removedExtensions.includes(metadata.id)) continue;

			const extensionId = metadata.id
				.replace(/[^a-zA-Z0-9]+/g, '')
				.trim()
				.replace(/\s+/g, '-');

			const extension = new MistiumExtension(this, extensionId, metadata);
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

type MistiumExtensionMetadata = {
	slug: string;
	id: string;
	name: string;
	description: string;
	image: string;
	by: Author[];
	featured: boolean;
	filename: string;
};

type Author = {
	name: string;
	link?: string;
};

class MistiumExtension {
	protected readonly bannerExtension?: string;

	public constructor(
		protected readonly gallery: MistiumExtensionGallery,
		protected readonly extensionId: string,
		protected readonly metadata: MistiumExtensionMetadata
	) {
		this.bannerExtension = metadata.featured
			? metadata.image.substring(metadata.image.lastIndexOf('.') + 1)
			: undefined;
	}

	public id(): string {
		return this.extensionId;
	}

	public async fetchExtension(downloads: RemoteDownloads): Promise<void> {
		downloads.addDownloadTask(
			`${this.gallery.data.sourceLocation}${this.metadata.featured ? 'featured' : 'files'}/${this.metadata.filename.replaceAll(' ', '%20')}`,
			async (response) => {
				if (response.status != 200)
					throw `Failed to fetch code for '${this.extensionId}'. Tried to fetch '${this.gallery.data.sourceLocation}files/${this.metadata.filename}'`;

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
			}
		);

		if (this.bannerExtension) {
			downloads.addDownloadTask(
				`${this.gallery.data.sourceLocation}${this.metadata.image}`,
				async (response) => {
					if (response.status != 200) {
						throw `Failed to fetch banner for '${this.extensionId}'. Tried to fetch '${this.gallery.data.sourceLocation}${this.metadata.image}'`;
					}
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

		if (this.bannerExtension) {
			const bannerFile = path.resolve(
				BuildHelper.galleryDirectory,
				'extensions/banner',
				this.gallery.id(),
				`${this.extensionId}.${this.bannerExtension}`
			);
			if (!(await BuildHelper.exists(bannerFile)))
				throw `Failed to find extension banner! Expected the file '${bannerFile}' to exist.`;
		} else logger(chalk.yellow(`missing banner for ${this.extensionId}`));
	}

	public generateJson(): GalleryJSON_Extension {
		return {
			id: this.extensionId,
			name: this.metadata.name,
			description: this.metadata.description,
			authors: this.metadata.by,
			originalAuthors: [],
			badges: [],
			supports: [],
			maySupport: [],
			duplicate: false,
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
}
