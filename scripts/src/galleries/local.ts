import path from 'path';
import {
	ExtensionGallery,
	type GalleryData,
	type GalleryJSON_Extension,
	type GalleryJSON_Extension_Author,
	type GalleryJSON_Extension_Badge,
	type GalleryJSON_Gallery,
	type GalleryJSON_Version,
	type GalleryModification_AddSupportedMod,
	type GalleryModification_RemoveExtension,
	type RemoteDownloads,
} from '../extension-gallery.js';
import { BuildHelper } from '../helper.js';
import { readFile } from 'fs/promises';
import chalk from 'chalk';

export type GalleryModification =
	| GalleryModification_RemoveExtension
	| GalleryModification_AddSupportedMod;

export class LocalExtensionGallery extends ExtensionGallery<
	GalleryData,
	GalleryModification
> {
	private extensions: LocalExtension[] = [];
	private icon?: string;

	public constructor(
		data: GalleryData,
		modifications: GalleryModification[]
	) {
		super(data, modifications, 'local');
	}

	public isRemote(): boolean {
		return false;
	}

	public extensionCount(): number {
		return this.extensions.length;
	}

	getGalleryDirectory(): string {
		return path.resolve('./app/data/gallery/', this.galleryId);
	}

	public async refresh(logger: (message: string) => void): Promise<void> {
		const directory = this.getGalleryDirectory();
		if (!(await BuildHelper.exists(directory)))
			throw `Failed to find gallery. The directory '${directory}' does not exist.`;

		const extensionJson = path.resolve(directory, 'extensions.json');
		if (!(await BuildHelper.exists(extensionJson)))
			throw `Failed to find gallery data. The file '${extensionJson}' does not exist.`;

		const data: string[] = BuildHelper.parse(
			await readFile(extensionJson, {
				encoding: 'utf-8',
			}),
			extensionJson
		);
		if (!Array.isArray(data))
			throw `Failed to load gallery data. Expected an array, but found an object.`;

		const removedExtensions =
			this.getModifications<GalleryModification_RemoveExtension>(
				'remove'
			).map((v) => v.extensionId);

		for (const extensionId of data) {
			if (removedExtensions.includes(extensionId)) continue;

			const extension = new LocalExtension(this, extensionId);
			await extension.readExtensionMetadata();
			this.extensions.push(extension);
		}

		logger(`found ${this.extensionCount()} extension(s)`);
	}

	public async downloadRemote(downloads: RemoteDownloads): Promise<void> {}

	public async validateAssets(
		logger: (message: string) => void
	): Promise<void> {
		const extensions = ['svg', 'png', 'jpg', 'gif'];
		for (let extension of extensions) {
			const exists = await BuildHelper.exists(
				path.resolve(this.getGalleryDirectory(), `icon.${extension}`)
			);
			if (exists) {
				this.icon = extension;
				break;
			}
		}
		if (!this.icon) logger(chalk.yellow('missing icon'));
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
		};
	}

	public async copyFiles(): Promise<void> {
		if (this.icon != undefined)
			await BuildHelper.copy(
				path.resolve(
					'./app/data/gallery',
					`${this.galleryId}/icon.${this.icon}`
				),
				path.resolve(
					BuildHelper.publicDirectory,
					`gallery/galleries/${this.galleryId}.${this.icon}`
				)
			);
		for (const extension of this.extensions) {
			await extension.copyFiles();
		}
	}
}

type LocalExtensionMetadata = {
	name: string;
	description: string;

	license?: string;
	authors?: GalleryJSON_Extension_Author[];
	originalAuthors?: GalleryJSON_Extension_Author[];
	badges?: GalleryJSON_Extension_Badge[];
	supports: string[];
	maySupport: string[];
	versions?: (GalleryJSON_Version | string)[];
};

class LocalExtension {
	protected bannerExtension?: string;
	protected name: string = '';
	protected description: string = '';
	protected badges?: GalleryJSON_Extension_Badge[];
	protected supports?: string[];
	protected maySupport?: string[];
	protected license?: string;
	protected authors?: GalleryJSON_Extension_Author[];
	protected originalAuthors?: GalleryJSON_Extension_Author[];
	protected versions?: GalleryJSON_Version[];

	public constructor(
		protected readonly gallery: LocalExtensionGallery,
		protected readonly extensionId: string
	) {}

	public id(): string {
		return this.extensionId;
	}

	public async validateAssets(
		logger: (message: string) => void
	): Promise<void> {
		const extensionDirectory = path.resolve(
			this.gallery.getGalleryDirectory(),
			this.extensionId
		);

		if (this.versions) {
			for (const version of this.versions) {
				const codeFile = path.resolve(
					extensionDirectory,
					version.foldername,
					this.extensionId.substring(
						this.extensionId.lastIndexOf('/') + 1
					) + '.js'
				);
				if (!(await BuildHelper.exists(codeFile)))
					throw `Failed to find extension code for version '${version}'! Expected the file '${codeFile}' to exist.`;
			}
		} else {
			const codeFile = path.resolve(
				extensionDirectory,
				this.extensionId.substring(
					this.extensionId.lastIndexOf('/') + 1
				) + '.js'
			);
			if (!(await BuildHelper.exists(codeFile)))
				throw `Failed to find extension code! Expected the file '${codeFile}' to exist.`;
		}

		if (!this.bannerExtension) {
			logger(chalk.yellow(`missing banner for ${this.extensionId}`));
		}
	}

	public generateJson(): GalleryJSON_Extension {
		return {
			id: this.extensionId,
			name: this.name,
			description: this.description,
			authors: this.authors ? this.authors : [],
			originalAuthors: this.originalAuthors ? this.originalAuthors : [],
			badges: this.badges ? this.badges : [],
			supports: this.supports ? this.supports : [],
			maySupport: this.maySupport ? this.maySupport : [],
			duplicate: false,
			versions: this.versions,
			license: this.license,
			bannerExtension: this.bannerExtension,
		};
	}

	public async copyFiles(): Promise<void> {
		const extensionDirectory = path.resolve(
			this.gallery.getGalleryDirectory(),
			this.extensionId
		);

		if (this.versions) {
			for (const version of this.versions) {
				const codeFile = path.resolve(
					extensionDirectory,
					version.foldername,
					this.extensionId.substring(
						this.extensionId.lastIndexOf('/') + 1
					) + '.js'
				);
				await BuildHelper.copy(
					codeFile,
					path.resolve(
						BuildHelper.publicDirectory,
						'gallery/extensions/code',
						this.gallery.galleryId,
						this.extensionId,
						version.foldername,
						this.extensionId + '.js'
					)
				);
			}
		} else {
			const codeFile = path.resolve(
				extensionDirectory,
				this.extensionId.substring(
					this.extensionId.lastIndexOf('/') + 1
				) + '.js'
			);
			await BuildHelper.copy(
				codeFile,
				path.resolve(
					BuildHelper.publicDirectory,
					'gallery/extensions/code',
					this.gallery.galleryId,
					this.extensionId + '.js'
				)
			);
		}

		if (this.bannerExtension)
			await BuildHelper.copy(
				path.resolve(
					extensionDirectory,
					`${this.extensionId.substring(
						this.extensionId.lastIndexOf('/') + 1
					)}.${this.bannerExtension}`
				),
				path.resolve(
					BuildHelper.publicDirectory,
					`gallery/extensions/banner/${this.gallery.galleryId}/${this.extensionId}.${this.bannerExtension}`
				)
			);
	}

	public async readExtensionMetadata(): Promise<void> {
		const directory = path.resolve(
			this.gallery.getGalleryDirectory(),
			this.extensionId
		);
		if (!(await BuildHelper.exists(directory)))
			throw `Failed to find extension. The directory '${directory}' does not exist.`;
		const extensionJson = path.resolve(directory, 'extension.json');
		if (!(await BuildHelper.exists(extensionJson)))
			throw `Failed to find extension data. The file '${extensionJson}' does not exist.`;

		const data: LocalExtensionMetadata = BuildHelper.parse(
			await readFile(extensionJson, {
				encoding: 'utf-8',
			}),
			extensionJson
		);

		this.readMetadata(data);

		const extensions = ['svg', 'png', 'jpg', 'gif'];
		for (let extension of extensions) {
			const exists = await BuildHelper.exists(
				path.resolve(
					this.gallery.getGalleryDirectory(),
					`${this.extensionId}/${this.extensionId.substring(
						this.extensionId.lastIndexOf('/') + 1
					)}.${extension}`
				)
			);
			if (exists) {
				this.bannerExtension = extension;
				break;
			}
		}
	}

	private readMetadata(data: LocalExtensionMetadata) {
		if (Array.isArray(data))
			throw `Failed to load extension data for extension '${this.extensionId}'. Expected an object, but found an array.`;

		if (!data.name)
			throw `Failed to load extension data for extension '${this.extensionId}'. Missing required field 'name'.`;
		this.name = data.name;
		if (!data.description)
			throw `Failed to load extension data for extension '${this.extensionId}'. Missing required field 'description'.`;
		this.description = data.description;

		if (data.license) {
			if (typeof data.license != 'string')
				throw `Failed to load extension data for extension '${this.extensionId}'. Expected license to be a string.\nFound: ${data.license}`;
			this.license = data.license;
		}

		if (data.authors) {
			if (!Array.isArray(data.authors))
				throw `Failed to load extension data for extension '${this.extensionId}'. Expected authors to be an array.\nFound: ${data.authors}`;
			this.authors = [];
			for (const author of data.authors) {
				if (
					(typeof author != 'string' && typeof author != 'object') ||
					Array.isArray(author)
				)
					throw `Failed to load extension data for extension '${this.extensionId}'. Expected author to be an object or string.\nFound: ${author}`;

				if (typeof author == 'string') {
					this.authors.push({
						name: author,
					});
					continue;
				}

				if (!author.name)
					throw `Failed to load extension data for extension '${this.extensionId}'. Missing required field 'name' for author.\nFound: ${author}`;

				const newAuthor: GalleryJSON_Extension_Author = {
					name: author.name,
				};
				if (author.link) {
					if (typeof author.link != 'string')
						throw `Failed to load extension data for extension '${this.extensionId}'. Expected field 'link' for author to be a string.\nFound: ${author.link}`;
					newAuthor.link = author.link;
				}
				this.authors.push(newAuthor);
			}
		}

		if (data.originalAuthors) {
			if (!Array.isArray(data.originalAuthors))
				throw `Failed to load extension data for extension '${this.extensionId}'. Expected originalAuthors to be an array.\nFound: ${data.originalAuthors}`;
			this.originalAuthors = [];
			for (const author of data.originalAuthors) {
				if (
					(typeof author != 'string' && typeof author != 'object') ||
					Array.isArray(author)
				)
					throw `Failed to load extension data for extension '${this.extensionId}'. Expected original author to be an object or string.\nFound: ${author}`;

				if (typeof author == 'string') {
					this.originalAuthors.push({
						name: author,
					});
					continue;
				}

				if (!author.name)
					throw `Failed to load extension data for extension '${this.extensionId}'. Missing required field 'name' for original author.\nFound: ${author}`;

				const newAuthor: GalleryJSON_Extension_Author = {
					name: author.name,
				};
				if (author.link) {
					if (typeof author.link != 'string')
						throw `Failed to load extension data for extension '${this.extensionId}'. Expected field 'link' for original author to be a string.\nFound: ${author.link}`;
					newAuthor.link = author.link;
				}
				this.originalAuthors.push(newAuthor);
			}
		}

		if (data.badges) {
			if (!Array.isArray(data.badges))
				throw `Failed to load extension data for extension '${this.extensionId}'. Expected badges to be an array.\nFound: ${data.badges}`;
			this.badges = [];
			for (const badge of data.badges) {
				if (
					(typeof badge != 'string' && typeof badge != 'object') ||
					Array.isArray(badge)
				)
					throw `Failed to load extension data for extension '${this.extensionId}'. Expected badge to be an object or string.\nFound: ${badge}`;

				if (typeof badge == 'string') {
					this.badges.push({
						name: badge,
					});
					continue;
				}

				if (!badge.name)
					throw `Failed to load extension data for extension '${this.extensionId}'. Missing required field 'name' for badge.\nFound: ${badge}`;

				const newBadge: GalleryJSON_Extension_Badge = {
					name: badge.name,
				};
				if (badge.tooltip) {
					if (typeof badge.tooltip != 'string')
						throw `Failed to load extension data for extension '${this.extensionId}'. Expected field 'tooltip' for badge to be a string.\nFound: ${badge.tooltip}`;
					newBadge.tooltip = badge.tooltip;
				}
				if (badge.link) {
					if (typeof badge.link != 'string')
						throw `Failed to load extension data for extension '${this.extensionId}'. Expected field 'link' for badge to be a string.\nFound: ${badge.tooltip}`;
					newBadge.link = badge.link;
				}
				this.badges.push(newBadge);
			}
		}

		if (data.versions) {
			if (!Array.isArray(data.versions))
				throw `Failed to load extension data for extension '${this.extensionId}'. Expected versions to be an array.\nFound: ${data.versions}`;
			this.versions = [];
			for (const version of data.versions) {
				if (
					typeof version != 'string' &&
					(typeof version != 'object' || Array.isArray(version))
				)
					throw `Failed to load extension data for extension '${this.extensionId}'. Expected version to be a string or an object.\nFound: ${version}`;

				if (typeof version == 'string') {
					this.versions.push({
						name: version,
						foldername: version,
					});
					continue;
				}

				if (!version.name)
					throw `Failed to load extension data for extension '${this.extensionId}'. Missing required field 'name' for version.\nFound: ${version}`;
				if (!version.foldername)
					throw `Failed to load extension data for extension '${this.extensionId}'. Missing required field 'foldername' for version.\nFound: ${version}`;

				this.versions.push(version);
			}
		}

		if (data.supports) {
			if (!Array.isArray(data.supports))
				throw `Failed to load extension data for extension '${this.extensionId}'. Expected supports to be an array.\nFound: ${data.supports}`;
			this.supports = [];
			for (const mod of data.supports) {
				if (typeof mod != 'string')
					throw `Failed to load extension data for extension '${this.extensionId}'. Expected mod to be a string.\nFound: ${mod}`;
			}
		}

		if (data.maySupport) {
			if (!Array.isArray(data.maySupport))
				throw `Failed to load extension data for extension '${this.extensionId}'. Expected maySupport to be an array.\nFound: ${data.maySupport}`;
			this.maySupport = [];
			for (const mod of data.maySupport) {
				if (typeof mod != 'string')
					throw `Failed to load extension data for extension '${this.extensionId}'. Expected mod to be a string.\nFound: ${mod}`;
			}
		}
	}
}
