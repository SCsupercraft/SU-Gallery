import z from 'zod';
import type { GeneratedExtension, GeneratedGallery } from './build.js';

export type Mod = {
  name: string;
  viewLocation: string;
  iconLocation: string;
  smallIcon: boolean;
};

export type Feature = {
  gallery: string;
  extension: string;
};

export type AuthorAlias = {
  name: string;
  link: string;
  otherNames: string[];
};

export type SiteConfig = {
  viewLocation: string;
  basename: string;
  static: boolean;
  featured: [Feature, Feature, Feature, Feature];
  mods: Record<string, Mod>;
  alias: {
    authors: AuthorAlias[];
  };
};

export interface ProgressReporter {
  increment(amount: number): void;
  decrement(amount: number): void;

  setProgress(progress: number): void;
  setMaxProgress(progress: number): void;

  getProgress(): number;
  getMaxProgress(): number;
}

export abstract class GalleryExtensionSource {
  abstract name(): string;

  abstract gatherExtensions(
    submit: (extension: GeneratedExtension) => void,
    reporter: ProgressReporter,
    gallery: GalleryConfig,
    galleryDir: string,
  ): Promise<void>;
}

export abstract class GalleryModification {
  abstract name(): string;

  abstract modify(gallery: GalleryConfig, galleryData: GeneratedGallery): void;
}

export type GallerySourcesConfig = {
  /**
   * A location to redirect users to.
   */
  viewLocation?: string;

  /**
   * Whether the icon should be scaled down to fit within GUIs.
   */
  smallIcon: boolean;

  /**
   * A location for the gallery icon
   */
  iconLocation:
    | {
        type: 'local';
        extension: string;
      }
    | { type: 'remote'; url: string };
};

export type GalleryConfig = {
  /**
   * The name of the gallery.
   */
  name: string;

  /**
   * The short id for this gallery,
   * used in URLs and for locating extensions.
   */
  id: string;

  /**
   * The priority of this gallery,
   * which determines what extensions are marked as duplicates.
   */
  priority: number;

  /**
   * The gallery sources.
   */
  sources: GallerySourcesConfig;

  /**
   * The gallery's extensions.
   */
  extensions: GalleryExtensionSource[];

  /**
   * The gallery's modifications.
   */
  modifications: GalleryModification[];
};

export const GallerySourcesConfigSchema = z.object({
  viewLocation: z.httpUrl().optional(),
  smallIcon: z.boolean(),
  iconLocation: z.union([
    z.object({
      type: z.literal('local'),
      extension: z.string(),
    }),
    z.object({
      type: z.literal('remote'),
      url: z.httpUrl(),
    }),
  ]),
});

export const GalleryConfigSchema = z.object({
  name: z.string().trim(),
  id: z
    .string()
    .trim()
    .regex(/^[a-z0-9_]+$/),
  priority: z.int(),
  sources: GallerySourcesConfigSchema,
  extensions: z.array(z.instanceof(GalleryExtensionSource)),
  modifications: z.array(z.instanceof(GalleryModification)),
});
