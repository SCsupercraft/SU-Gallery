import type {
	Extension,
	ExtensionAuthor,
	ExtensionGallery,
} from '~/gallery/extensions/extension';

export class ExtensionManager {
	private galleries: ExtensionGallery[] = [];
	private extensions: Extension[] = [];
	private authors: string[] = [];

	constructor(data: ExtensionGallery[]) {
		try {
			const knownExtensions: Set<string> = new Set();
			data.forEach((gallery) => {
				const extensions = gallery.extensions.map((extension) => {
					const ext = { ...extension, gallery: gallery.name };
					if (knownExtensions.has(extension.id)) {
						ext.dupe = true;
					} else {
						ext.dupe = false;
						knownExtensions.add(extension.id);
					}
					return ext;
				});
				this.extensions = [...this.extensions, ...extensions];
			});

			this.extensions.forEach((extension) => {
				extension.credits.forEach((author) => {
					if (!this.authors.includes(author.name))
						this.authors.push(author.name);
				});
			});

			const sortedGalleries = data.sort((a, b) =>
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
		} catch (e) {}
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
}
