import type { GeneratedExtension } from '../build.js';
import {
  GalleryExtensionSource,
  type GalleryConfig,
  type ProgressReporter,
} from '../config.js';
import path from 'path';
import { fs } from '../fs.js';
import z from 'zod';
import { config } from '../site.js';

const dataDir = path.resolve('./data');

const AuthorSchema = z.object({
  name: z.string().trim(),
  link: z.httpUrl(),
});

const BadgeSchema = z
  .object({
    name: z.string().trim(),
    tooltip: z.string().trim().optional(),
    link: z.httpUrl().optional(),
  })
  .or(
    z
      .string()
      .trim()
      .transform((name, ctx) => {
        return { name };
      }),
  );

const VersionSchema = z
  .object({
    name: z.string().trim(),
    foldername: z.string().trim(),
  })
  .or(
    z
      .string()
      .trim()
      .transform((name, ctx) => {
        return { name, foldername: name };
      }),
  );

const ModsSchema = z
  .array(
    z
      .string()
      .trim()
      .check((ctx) => {
        if (!(ctx.value in config.mods))
          ctx.issues.push({
            code: 'invalid_value',
            input: ctx.value,
            values: [ctx.value],
            message: 'Invalid scratch mod.',
          });
      }),
  )
  .default([]);

const ExtensionSchema = z.object({
  name: z.string().trim(),
  description: z.string().trim(),
  license: z.string().trim().optional(),
  bannerExtension: z.string().optional(),
  authors: z.array(AuthorSchema).default([]),
  originalAuthors: z.array(AuthorSchema).default([]),
  badges: z.array(BadgeSchema).default([]),
  supports: ModsSchema,
  maySupport: ModsSchema,
  versions: z.array(VersionSchema).optional(),
  mainVersion: z.string().trim().optional(),
});

const ExtensionsSchema = z.array(
  z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9/_-]+$/),
);

class LocalExtensionGallerySource extends GalleryExtensionSource {
  name(): string {
    return 'LocalExtensionGallerySource';
  }

  async gatherExtensions(
    submit: (extension: GeneratedExtension) => void,
    reporter: ProgressReporter,
    gallery: GalleryConfig,
    galleryDir: string,
  ): Promise<void> {
    const dir = path.resolve(dataDir, gallery.id);
    const extensionsFile = path.resolve(dir, 'extensions.json');

    if (!(await fs.exists(extensionsFile)))
      throw 'Expected a file to exist at: ' + extensionsFile;
    const extensions = ExtensionsSchema.parse(
      JSON.parse(await fs.readFile(extensionsFile, 'utf-8')),
    );

    reporter.setMaxProgress(extensions.length);
    for (const id of extensions) {
      const extPath = path.resolve(dir, id);
      const extJsonPath = path.resolve(extPath, 'extension.json');
      const extShortId = id.substring(id.lastIndexOf('/') + 1);

      if (!(await fs.exists(extJsonPath)))
        throw 'Expected a file to exist at: ' + extJsonPath;

      const extension = ExtensionSchema.parse(
        JSON.parse(await fs.readFile(extJsonPath, 'utf-8')),
      );

      const ext: GeneratedExtension = {
        name: extension.name,
        id,
        description: extension.description,
        license: extension.license,
        authors: extension.authors,
        originalAuthors: extension.originalAuthors,
        badges: extension.badges,
        supports: extension.supports,
        maySupport: extension.maySupport,
        duplicate: false,
        files:
          extension.versions !== undefined && extension.versions.length > 0
            ? {
                versioned: true,
                versions: extension.versions!.map((v) => {
                  return {
                    name: v.name,
                    location: `${config.viewLocation}gallery/${gallery.id}/${id}/${v.foldername}/${extShortId}.js`,
                  };
                }),
                mainVersion:
                  extension.mainVersion !== undefined
                    ? extension.mainVersion
                    : extension.versions[0]!.foldername,
              }
            : {
                versioned: false,
                location: `${config.viewLocation}gallery/${gallery.id}/${id}.js`,
              },
      };

      const extCodeDir = path.resolve(galleryDir, gallery.id, id);

      if (ext.files.versioned) {
        for (const version of extension.versions!) {
          await fs.copy(
            path.resolve(extPath, version.foldername, extShortId + '.js'),
            path.resolve(extCodeDir, version.foldername, extShortId + '.js'),
          );
        }
      } else {
        await fs.copy(
          path.resolve(extPath, extShortId + '.js'),
          extCodeDir + '.js',
        );
      }

      if (extension.bannerExtension !== undefined) {
        const extBannerPath = path.resolve(
          extPath,
          extShortId + '.' + extension.bannerExtension,
        );

        if (!(await fs.exists(extBannerPath)))
          throw 'Expected a file to exist at: ' + extBannerPath;

        const buf = await fs.readFileBuf(extBannerPath);
        await fs.write(
          path.resolve(
            galleryDir,
            gallery.id,
            id + '.' + extension.bannerExtension,
          ),
          buf,
        );

        ext.banner =
          config.basename +
          'gallery/' +
          gallery.id +
          '/' +
          id +
          '.' +
          extension.bannerExtension;
      }

      submit(ext);
      reporter.increment(1);
    }
  }
}

export function localExtensionGallery(): GalleryExtensionSource {
  return new LocalExtensionGallerySource();
}
