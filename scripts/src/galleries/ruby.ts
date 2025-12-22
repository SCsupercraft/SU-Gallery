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
import path from 'node:path';

export type GalleryModification =
	| GalleryModification_RemoveExtension
	| GalleryModification_AddSupportedMod;

export class RubyExtensionGallery extends ExtensionGallery<
	RemoteGalleryData,
	GalleryModification
> {
	private extensions: RubyExtension[] = [];
	private readonly icon?: string;

	public constructor(
		data: RemoteGalleryData,
		modifications: GalleryModification[]
	) {
		super(data, modifications, 'ruby');
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
				await fetch(`${this.data.sourceLocation}data/extensions.json`)
			).text()
		) as RubyExtensionMetadata[];

		const removedExtensions =
			this.getModifications<GalleryModification_RemoveExtension>(
				'remove'
			).map((v) => v.extensionId);

		for (const metadata of extensions) {
			const code: string = metadata.url.split('/').pop()!;
			const id = code.slice(0, code.lastIndexOf('.js'));
			if (removedExtensions.includes(id)) continue;

			const extension = new RubyExtension(this, id);
			extension.setMetadata(metadata);
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

type RubyExtensionMetadata = {
	name: string;
	description: string;
	url: string;
	thumb: string;
	recommended: boolean;
	legendary: boolean;
};

class RubyExtension {
	protected readonly extensionId;
	protected bannerExtension: string = '';
	protected metadata: RubyExtensionMetadata = {
		name: '',
		description: '',
		url: '',
		thumb: '',
		recommended: false,
		legendary: false,
	};

	public constructor(
		protected readonly gallery: RubyExtensionGallery,
		extensionId: string
	) {
		this.extensionId = extensionId;
	}

	public setMetadata(metadata: RubyExtensionMetadata) {
		this.metadata = metadata;
		this.bannerExtension = metadata.thumb.substring(
			metadata.thumb.lastIndexOf('.') + 1
		);
	}

	public id(): string {
		return this.extensionId;
	}

	public async fetchExtension(downloads: RemoteDownloads): Promise<void> {
		downloads.addDownloadTask(this.metadata.url, async (response) => {
			if (response.status != 200)
				throw `Failed to fetch code for '${this.extensionId}'. Tried to fetch '${this.metadata.url}'`;

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
		});

		downloads.addDownloadTask(this.metadata.thumb, async (response) => {
			if (response.status != 200)
				throw `Failed to fetch banner for '${this.extensionId}'. Tried to fetch '${this.metadata.thumb}'`;

			const imgContent = await response.blob();
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
		});
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
		const bannerFile = path.resolve(
			BuildHelper.galleryDirectory,
			'extensions/banner',
			this.gallery.id(),
			`${this.extensionId}.${this.bannerExtension}`
		);
		if (!(await BuildHelper.exists(bannerFile)))
			throw `Failed to find extension banner! Expected the file '${bannerFile}' to exist.`;
	}

	public generateJson(): GalleryJSON_Extension {
		return {
			id: this.extensionId,
			name: this.metadata.name,
			description: this.metadata.description,
			authors: [],
			originalAuthors: [],
			badges: this.metadata.legendary
				? [
						{
							name: 'Joke',
							tooltip:
								"This extension was made as a joke, please don't take it seriously",
						},
					]
				: [],
			supports: [],
			maySupport: [],
			duplicate: false,
			bannerExtension: this.bannerExtension,
		};
	}
}
