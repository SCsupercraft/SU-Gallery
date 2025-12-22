import {
	ExtensionGallery,
	type GalleryJSON_Extension,
	type GalleryJSON_Extension_Author,
	type GalleryJSON_Gallery,
	type GalleryModification_AddSupportedMod,
	type GalleryModification_RemoveExtension,
	type RemoteDownloads,
	type RemoteGalleryData,
} from '../extension-gallery.js';

import JSON5 from 'json5';
import { BuildHelper } from '../helper.js';
import path from 'node:path';

export type GalleryModification =
	| GalleryModification_RemoveExtension
	| GalleryModification_AddSupportedMod;

export class PenguinModExtensionGallery extends ExtensionGallery<
	RemoteGalleryData,
	GalleryModification
> {
	private extensions: PenguinModExtension[] = [];
	private readonly icon?: string;

	public constructor(
		data: RemoteGalleryData,
		modifications: GalleryModification[]
	) {
		super(data, modifications, 'penguinmod');
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
		const extensions = (await extractJsonExport(
			await (
				await fetch(`${this.data.sourceLocation}src/lib/extensions.js`)
			).text()
		)) as PenguinModExtensionMetadata[];

		const removedExtensions =
			this.getModifications<GalleryModification_RemoveExtension>(
				'remove'
			).map((v) => v.extensionId);

		for (const metadata of extensions) {
			const id = metadata.code.slice(0, metadata.code.lastIndexOf('.'));
			if (removedExtensions.includes(id)) continue;

			const extension = new PenguinModExtension(this, id);
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

type PenguinModExtensionMetadata = {
	name: string;
	description: string;
	code: string;
	banner: string;
	creator: string;
	creatorAlias?: string;
	isGitHub: boolean;
	unstable?: boolean;
	unstableReason?: string;
};

class PenguinModExtension {
	protected readonly extensionId;
	protected bannerExtension: string = '';
	protected metadata: PenguinModExtensionMetadata = {
		name: '',
		description: '',
		code: '',
		banner: '',
		creator: '',
		isGitHub: true,
	};

	public constructor(
		protected readonly gallery: PenguinModExtensionGallery,
		extensionId: string
	) {
		this.extensionId = extensionId;
	}

	public setMetadata(metadata: PenguinModExtensionMetadata) {
		this.metadata = metadata;
		if (this.metadata.isGitHub == undefined) this.metadata.isGitHub = false;
		this.bannerExtension = metadata.banner.substring(
			metadata.banner.lastIndexOf('.') + 1
		);
	}

	public id(): string {
		return this.extensionId;
	}

	public async fetchExtension(downloads: RemoteDownloads): Promise<void> {
		downloads.addDownloadTask(
			`${this.gallery.data.sourceLocation}static/extensions/${this.metadata.code}`,
			async (response) => {
				if (response.status != 200)
					throw `Failed to fetch code for '${this.extensionId}'. Tried to fetch '${this.gallery.data.sourceLocation}static/extensions/${this.metadata.code}'`;

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

		downloads.addDownloadTask(
			`${this.gallery.data.sourceLocation}static/images/${this.metadata.banner}`,
			async (response) => {
				if (response.status != 200)
					throw `Failed to fetch banner for '${this.extensionId}'. Tried to fetch '${this.gallery.data.sourceLocation}static/images/${this.metadata.banner}'`;

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
		const author: GalleryJSON_Extension_Author | undefined =
			this.metadata.creator != undefined
				? {
						name:
							this.metadata.creatorAlias != null
								? this.metadata.creatorAlias
								: this.metadata.creator,
						link:
							this.metadata.isGitHub === true
								? `https://github.com/${this.metadata.creator}`
								: `https://scratch.mit.edu/users/${this.metadata.creator}`,
					}
				: undefined;
		return {
			id: this.extensionId,
			name: this.metadata.name,
			description: this.metadata.description,
			authors: author ? [author] : [],
			originalAuthors: [],
			badges: this.metadata.unstable
				? [
						{
							name: 'Unstable',
							tooltip: this.metadata.unstableReason,
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

async function extractJsonExport(fileContent: string) {
	try {
		// Search for the export statement and extract all exported objects.
		const exportsIndex = fileContent.indexOf('export default [') + 15;

		if (exportsIndex > -1) {
			const exportedObjects: string = fileContent.slice(
				exportsIndex,
				fileContent.indexOf(';', exportsIndex)
			);

			return JSON5.parse(exportedObjects);
		}

		throw 'No export found in the file.';
	} catch (error) {
		throw `Failed to process file: ${error}`;
	}
}
