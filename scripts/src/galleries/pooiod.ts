import chalk from 'chalk';
import {
	ExtensionGallery,
	type GalleryJSON_Extension,
	type GalleryJSON_Extension_Badge,
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

export class PooiodExtensionGallery extends ExtensionGallery<
	RemoteGalleryData,
	GalleryModification
> {
	private extensions: PooiodExtension[] = [];
	private readonly icon?: string;

	public constructor(
		data: RemoteGalleryData,
		modifications: GalleryModification[]
	) {
		super(data, modifications, 'pooiod');
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
				await fetch(`${this.data.sourceLocation}extensions.json`)
			).text()
		) as PooiodExtensionMetadata[];
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

			const extension = new PooiodExtension(this, metadata.id, metadata);
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

type PooiodExtensionMetadata = {
	id: string;
	image: string;
	title: string;
	description: string;
	subtext: string;
	icon: string;
	iconText: string;
	buttons: Button[];
	tags: string[];
	type: string[];
	hidden: boolean;
};

type Button = {
	text: string;
	color: string;
	link: string;
};

type Version = {
	name: string;
	filename: string;
	foldername: string;
};

class PooiodExtension {
	protected readonly bannerExtension?: string;
	protected readonly versions?: Version[];
	protected readonly version: Version;

	public constructor(
		protected readonly gallery: PooiodExtensionGallery,
		protected readonly extensionId: string,
		protected readonly metadata: PooiodExtensionMetadata
	) {
		this.bannerExtension = metadata.image
			? metadata.image.substring(metadata.image.lastIndexOf('.') + 1)
			: undefined;

		const versions: Version[] = this.metadata.buttons
			.filter((button) => button.link.startsWith('/view/#/[id]/'))
			.map((button) => {
				const filename = button.link.replace('/view/#/[id]/', '');
				return {
					filename,
					foldername: filename.substring(
						0,
						filename.lastIndexOf('.')
					),
					name: button.text.replace('View ', ''),
				};
			});
		if (
			this.metadata.buttons.find(
				(button) => button.link === '/view/#/[id]'
			) != undefined
		) {
			versions.push({
				filename: 'main.js',
				foldername: 'main',
				name: 'Main',
			});
		}

		if (versions.length > 1) {
			this.versions = versions;
		}
		this.version = versions[0]!;
	}

	public id(): string {
		return this.extensionId;
	}

	public async fetchExtension(downloads: RemoteDownloads): Promise<void> {
		if (this.versions) {
			for (const version of this.versions) {
				downloads.addDownloadTask(
					`${this.gallery.data.sourceLocation}ext/${this.metadata.id}/${version.filename}`,
					async (response) => {
						if (response.status != 200)
							throw `Failed to fetch code for '${this.extensionId}'. Tried to fetch '${this.gallery.data.sourceLocation}ext/${this.metadata.id}/${version.filename}'`;

						await BuildHelper.write(
							path.resolve(
								BuildHelper.galleryDirectory,
								'extensions/code',
								this.gallery.id(),
								this.extensionId,
								version.foldername,
								this.extensionId + '.js'
							),
							await response.text(),
							'utf-8'
						);
					}
				);
			}
		} else {
			downloads.addDownloadTask(
				`${this.gallery.data.sourceLocation}ext/${this.metadata.id}/${this.version.filename}`,
				async (response) => {
					if (response.status != 200)
						throw `Failed to fetch code for '${this.extensionId}'. Tried to fetch '${this.gallery.data.sourceLocation}ext/${this.metadata.id}/${this.version.filename}'`;

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

		if (this.bannerExtension) {
			downloads.addDownloadTask(
				`${this.gallery.data.sourceLocation}${this.metadata.image.substring(1).replaceAll('[id]', this.metadata.id)}`,
				async (response) => {
					if (response.status != 200) {
						throw `Failed to fetch banner for '${this.extensionId}'. Tried to fetch '${this.gallery.data.sourceLocation}${this.metadata.image.substring(1).replaceAll('[id]', this.metadata.id)}'`;
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
		if (this.versions) {
			for (const version of this.versions) {
				const codeFile = path.resolve(
					BuildHelper.galleryDirectory,
					'extensions/code',
					this.gallery.id(),
					this.extensionId,
					version.foldername,
					this.extensionId + '.js'
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
		const badges: GalleryJSON_Extension_Badge[] = [];
		if (this.metadata.hidden)
			badges.push({
				name: 'Hidden',
				tooltip:
					'This extension was hidden from the original gallery. Use with caution!',
			});
		if (this.metadata.tags.includes('unfinished'))
			badges.push({
				name: 'Unfinished',
				tooltip: 'This extension is unfinished. Use with caution!',
			});
		if (this.metadata.iconText || this.metadata.subtext) {
			let text = '';
			const flag1 = this.metadata.iconText != this.metadata.subtext;
			if (this.metadata.subtext) {
				text += this.metadata.subtext;
				if (this.metadata.iconText && flag1) text += ' - ';
			}
			if (this.metadata.iconText && flag1) text += this.metadata.iconText;

			badges.push({
				name: 'Note',
				tooltip: text,
			});
		}

		return {
			id: this.extensionId,
			name: this.metadata.title,
			description: this.metadata.description,
			authors: [],
			originalAuthors: [],
			badges: badges,
			supports: [],
			maySupport: [],
			duplicate: false,
			bannerExtension: this.bannerExtension,
			versions: this.versions
				? this.versions.map((version) => {
						return {
							name: version.name,
							foldername: version.foldername,
						};
					})
				: undefined,
		};
	}
}
