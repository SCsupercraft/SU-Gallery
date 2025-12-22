import type {
	Extension,
	ExtensionGallery,
	JsonSchema,
	JsonSchemaFeaturedExtension,
	JsonSchemaSupportedMod,
} from '~/types/extension';

export class ExtensionManager {
	private galleries: ExtensionGallery[] = [];
	private extensions: Extension[] = [];
	private featured: Extension[] = [];
	private authors: string[] = [];
	private badges: string[] = [];
	private supportedMods: { [key: string]: JsonSchemaSupportedMod } = {};
	public readonly lastUpdated;

	constructor(data: JsonSchema) {
		this.lastUpdated = data.lastUpdated;

		const isFeatured = (galleryId: string, extensionId: string) => {
			for (const featured of data.featured) {
				if (
					featured.galleryId == galleryId &&
					featured.extensionId == extensionId
				)
					return true;
			}
			return false;
		};

		try {
			for (const mod of data.supportedMods) {
				this.supportedMods[mod.id] = mod;
			}

			const galleries = data.galleries.map((gallery) => {
				const extensions = gallery.extensions.map((extension) => {
					return {
						...extension,
						gallery: gallery.name,
						featured: isFeatured(gallery.id, extension.id),
					};
				});
				this.extensions = this.extensions.concat(extensions);

				return {
					...gallery,
					extensions,
				} satisfies ExtensionGallery;
			});

			this.extensions.forEach((extension) => {
				extension.authors.forEach((author) => {
					if (!this.authors.includes(author.name))
						this.authors.push(author.name);
				});
				extension.originalAuthors.forEach((author) => {
					if (!this.authors.includes(author.name))
						this.authors.push(author.name);
				});
				extension.badges.forEach((badge) => {
					if (!this.badges.includes(badge.name))
						this.badges.push(badge.name);
				});
			});

			const sortedGalleries = galleries.sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const sortedExtensions = this.extensions.sort((a, b) =>
				a.name.localeCompare(b.name)
			);
			const sortedAuthors = this.authors.sort((a, b) =>
				a.localeCompare(b)
			);

			const authors: string[] = [];
			const filteredAuthors = sortedAuthors.filter((author) => {
				if (!authors.includes(author.toLowerCase())) {
					authors.push(author.toLowerCase());
					return true;
				}
				return false;
			});

			this.galleries = sortedGalleries;
			this.extensions = sortedExtensions;
			this.authors = filteredAuthors;

			const get = (featured: JsonSchemaFeaturedExtension) => {
				const gallery = this.getGalleryFromId(featured.galleryId);

				if (!gallery)
					throw `Failed to find gallery with id '${featured.galleryId}'`;

				const extension = this.getExtensionFromId(
					gallery,
					featured.extensionId
				);

				if (!extension)
					throw `Failed to find extension with id '${featured.extensionId}' in gallery with id '${featured.galleryId}'`;

				return extension;
			};

			this.featured[0] = get(data.featured[0]);
			this.featured[1] = get(data.featured[1]);
			this.featured[2] = get(data.featured[2]);
			this.featured[3] = get(data.featured[3]);
		} catch (e) {}
	}

	public getExtensionFromId(
		gallery: ExtensionGallery,
		id: string
	): Extension | undefined {
		return gallery.extensions.find((extension) => {
			return extension.id === id;
		});
	}

	public getGalleryFromId(id: string): ExtensionGallery | undefined {
		return this.galleries.find((gallery) => {
			return gallery.id === id;
		});
	}

	public getGallery(name: string): ExtensionGallery | undefined {
		return this.galleries.find((gallery) => {
			return gallery.name === name;
		});
	}

	public getGalleries(): ExtensionGallery[] {
		return this.galleries;
	}

	public getExtensions(): Extension[] {
		return this.extensions;
	}

	public getAuthors(): string[] {
		return this.authors;
	}

	public getBadges(): string[] {
		return this.badges;
	}

	public getFeaturedExtensions(): Extension[] {
		return this.featured;
	}

	public getSupportedMod(id: string): JsonSchemaSupportedMod | undefined {
		return this.supportedMods[id];
	}

	public getSupportedMods(): string[] {
		return Object.keys(this.supportedMods);
	}
}
