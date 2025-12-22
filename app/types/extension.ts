export type Extension = {
	gallery: string;
	featured: boolean;
} & JsonSchemaExtension;

export type ExtensionGallery = {
	extensions: Extension[];
} & Omit<JsonSchemaExtensionGallery, 'extensions'>;

export type JsonSchema = {
	lastUpdated: number;
	supportedMods: JsonSchemaSupportedMod[];
	featured: [
		JsonSchemaFeaturedExtension,
		JsonSchemaFeaturedExtension,
		JsonSchemaFeaturedExtension,
		JsonSchemaFeaturedExtension,
	];
	galleries: JsonSchemaExtensionGallery[];
};

export type JsonSchemaSupportedMod = {
	id: string;
	name: string;
	link: string;
	iconExtension: string;
	smallIcon: boolean;
};

export type JsonSchemaFeaturedExtension = {
	galleryId: string;
	extensionId: string;
};

export type JsonSchemaExtensionGallery = {
	id: string;
	name: string;
	iconExtension?: string;
	smallIcon: boolean;
	extensions: JsonSchemaExtension[];
	viewLocation?: string;
};

export type JsonSchemaExtension = {
	id: string;
	name: string;
	description: string;
	authors: Author[];
	originalAuthors: Author[];
	badges: Badge[];
	supports: string[];
	maySupport: string[];
	duplicate: boolean;
	versions?: Version[];
	license?: string;
	bannerExtension?: string;
};

export type Version = {
	name: string;
	foldername: string;
};

export type Author = {
	name: string;
	link?: string;
};

export type Badge = {
	name: string;
	tooltip?: string;
	link?: string;
};
