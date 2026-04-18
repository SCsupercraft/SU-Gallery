export type Extension = {
  gallery: string;
  featured: boolean;
} & JsonSchemaExtension;

export type ExtensionGallery = {
  extensions: Extension[];
} & Omit<JsonSchemaExtensionGallery, 'extensions'>;

export type JsonSchema = {
  lastUpdated: number;
  mods: Record<string, JsonSchemaSupportedMod>;
  featured: [
    JsonSchemaFeaturedExtension,
    JsonSchemaFeaturedExtension,
    JsonSchemaFeaturedExtension,
    JsonSchemaFeaturedExtension,
  ];
  galleries: JsonSchemaExtensionGallery[];
};

export type JsonSchemaSupportedMod = {
  name: string;
  viewLocation: string;
  iconLocation: string;
  smallIcon: boolean;
};

export type JsonSchemaFeaturedExtension = {
  gallery: string;
  extension: string;
};

export type JsonSchemaExtensionGallery = {
  id: string;
  name: string;
  viewLocation?: string;
  iconLocation: string;
  smallIcon: boolean;
  extensions: JsonSchemaExtension[];
};

export type JsonSchemaExtension = {
  id: string;
  name: string;
  description: string;
  license?: string;
  authors: Author[];
  originalAuthors: Author[];
  badges: Badge[];
  supports: string[];
  maySupport: string[];
  duplicate: boolean;
  files: Files;
  banner?: string;
};

export type Files =
  | {
      versioned: true;
      versions: Version[];
      mainVersion: string;
    }
  | {
      versioned: false;
      location: string;
    };

export type Version = {
  name: string;
  location: string;
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
