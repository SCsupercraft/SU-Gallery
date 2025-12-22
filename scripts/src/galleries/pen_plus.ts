import {
	ExtensionGallery,
	type GalleryJSON_Extension,
	type GalleryJSON_Gallery,
	type GalleryJSON_Version,
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

export class PenPlusExtensionGallery extends ExtensionGallery<
	RemoteGalleryData,
	GalleryModification
> {
	private extensions: PenPlusExtension[] = [];
	private readonly icon?: string;

	public constructor(
		data: RemoteGalleryData,
		modifications: GalleryModification[]
	) {
		super(data, modifications, 'pen+');
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
		const extensions = BuildHelper.parse(
			await (
				await fetch(`${this.data.sourceLocation}extensions.json`)
			).text(),
			`${this.data.sourceLocation}extensions.json`
		) as PenPlusExtensionMetadata[];

		const removedExtensions =
			this.getModifications<GalleryModification_RemoveExtension>(
				'remove'
			).map((v) => v.extensionId);

		for (const metadata of extensions) {
			const id = metadata.id;
			if (removedExtensions.includes(id)) continue;

			const extension = new PenPlusExtension(this, metadata, id);
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

type PenPlusExtensionMetadata = {
	id: string;
	name: string;
	thumbnailFormat?: string;
	description: string;
	latestVersion: string;
	versions: { name: string; filename: string }[];
};

class PenPlusExtension {
	private readonly bannerExtension: string;
	private readonly versions?: GalleryJSON_Version[];
	protected readonly extensionId;

	public constructor(
		protected readonly gallery: PenPlusExtensionGallery,
		protected readonly metadata: PenPlusExtensionMetadata,
		extensionId: string
	) {
		this.extensionId = extensionId;
		this.bannerExtension = this.metadata.thumbnailFormat || 'svg';
		this.versions =
			this.metadata.versions.length > 1
				? this.metadata.versions.map((version) => {
						return {
							name: version.name,
							foldername: version.filename.substring(
								0,
								version.filename.lastIndexOf('.')
							),
						};
					})
				: undefined;
	}

	public id(): string {
		return this.extensionId;
	}

	public async fetchExtension(downloads: RemoteDownloads): Promise<void> {
		if (this.versions != undefined) {
			for (const version of this.metadata.versions) {
				downloads.addDownloadTask(
					`${this.gallery.data.sourceLocation}extensions/${this.metadata.id}/${version.filename}`,
					async (response) => {
						if (response.status != 200)
							throw `Failed to fetch code for '${this.extensionId}'. Tried to fetch '${this.gallery.data.sourceLocation}extensions/${this.metadata.id}/${version.filename}'`;

						await BuildHelper.write(
							path.resolve(
								BuildHelper.galleryDirectory,
								'extensions/code',
								this.gallery.id(),
								this.extensionId,
								version.filename.substring(
									0,
									version.filename.lastIndexOf('.')
								),
								this.extensionId.substring(
									this.extensionId.lastIndexOf('/') + 1
								) + '.js'
							),
							await response.text(),
							'utf-8'
						);
					}
				);
			}
		} else {
			downloads.addDownloadTask(
				`${this.gallery.data.sourceLocation}extensions/${this.metadata.id}/${this.metadata.versions[0]!.filename}`,
				async (response) => {
					if (response.status != 200)
						throw `Failed to fetch code for '${this.extensionId}'. Tried to fetch '${this.gallery.data.sourceLocation}extensions/${this.metadata.id}/${this.metadata.versions[0]!.filename}'`;

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
		}

		downloads.addDownloadTask(
			`${this.gallery.data.sourceLocation}extensions/${this.metadata.id}/thumbnail.${this.bannerExtension}`,
			async (response) => {
				if (response.status != 200)
					throw `Failed to fetch banner for '${this.extensionId}'. Tried to fetch '${this.gallery.data.sourceLocation}extensions/${this.metadata.id}/thumbnail.${this.bannerExtension}'`;

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
			}
		);
	}

	public async validateAssets(
		logger: (message: string) => void
	): Promise<void> {
		if (this.versions != undefined) {
			for (const version of this.versions) {
				const codeFile = path.resolve(
					BuildHelper.galleryDirectory,
					'extensions/code',
					this.gallery.id(),
					this.extensionId,
					version.foldername,
					this.extensionId.substring(
						this.extensionId.lastIndexOf('/') + 1
					) + '.js'
				);
				if (!(await BuildHelper.exists(codeFile)))
					throw `Failed to find extension code! Expected the file '${codeFile}' to exist.`;
			}
		} else {
			const codeFile = path.resolve(
				BuildHelper.galleryDirectory,
				'extensions/code',
				this.gallery.id(),
				this.extensionId + '.js'
			);
			if (!(await BuildHelper.exists(codeFile)))
				throw `Failed to find extension code! Expected the file '${codeFile}' to exist.`;
		}

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
			badges: [],
			supports: [],
			maySupport: [],
			duplicate: false,
			versions: this.versions,
			bannerExtension: this.bannerExtension,
		};
	}
}
