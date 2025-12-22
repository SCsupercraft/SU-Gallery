import type {
	AuthorAlias,
	ExtensionGallery,
	GalleryJSON_ExtensionLocation,
	SupportedMod,
} from './extension-gallery.js';

export type Data = {
	supportedMods: SupportedMod[];
	galleries: ExtensionGallery<any, any>[];
	featured: [
		GalleryJSON_ExtensionLocation,
		GalleryJSON_ExtensionLocation,
		GalleryJSON_ExtensionLocation,
		GalleryJSON_ExtensionLocation,
	];
	duplicates: GalleryJSON_ExtensionLocation[];
	authorsAlias: AuthorAlias[];
	githubPages: boolean;
};
