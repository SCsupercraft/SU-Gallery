import { Listr, PRESET_TIMER, type ListrTask } from 'listr2';
import { execaCommand as command } from 'execa';
import Environment from 'dotenv';
import chalk from 'chalk';

import path from 'node:path';
import { fs } from './fs.js';
import {
  GalleryConfigSchema,
  type GalleryConfig,
  type ProgressReporter,
} from './config.js';
import { config } from './site.js';
Environment.configDotenv({ quiet: true });

export type Author = {
  /**
   * The name of the author.
   */
  name: string;

  /**
   * A link to one of the author's profiles.
   */
  link?: string;
};

export type Badge = {
  /**
   * The name of the badge.
   */
  name: string;

  /**
   * The text to show when the badge is hovered over.
   */
  tooltip?: string;

  /**
   * A link to redirect users to when the badge is clicked.
   */
  link?: string;
};

export type Version = {
  /**
   * This version's display name.
   */
  name: string;

  /**
   * The location of the extension's code for this version.
   */
  location: string;
};

export type Files =
  | {
      /**
       * Whether the extension is versioned.
       */
      versioned: true;

      /**
       * A list of available versions.
       */
      versions: Version[];

      /**
       * The main version, selected by default.
       */
      mainVersion: string;
    }
  | {
      /**
       * Whether the extension is versioned.
       */
      versioned: false;

      /**
       * The location of the extension's code.
       */
      location: string;
    };

export type GeneratedExtension = {
  /**
   * The name of the extension.
   */
  name: string;

  /**
   * The short id for this extension,
   * used in URLs and for locating extensions.
   */
  id: string;

  /**
   * The description of the extension.
   */
  description: string;

  /**
   * The extension's license.
   */
  license?: string;

  /**
   * The authors of the extension.
   */
  authors: Author[];

  /**
   * The original authors of the extension.
   */
  originalAuthors: Author[];

  /**
   * The badges to display for the extension.
   */
  badges: Badge[];

  /**
   * An array of Scratch mods that this extension will work on.
   */
  supports: string[];

  /**
   * An array of Scratch mods that this extension might work on.
   */
  maySupport: string[];

  /**
   * Whether the extension is a duplicate.
   */
  duplicate: boolean;

  /**
   * The extension's files.
   */
  files: Files;

  /**
   * The location of the extension's banner.
   */
  banner?: string;
};

export type GeneratedGallery = {
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
   * A location to redirect users to.
   */
  viewLocation?: string;

  /**
   * The location of the gallery's icon.
   */
  iconLocation: string;

  /**
   * Whether the icon should be scaled down to fit within GUIs.
   */
  smallIcon: boolean;

  /**
   * The extensions in this gallery.
   */
  extensions: GeneratedExtension[];
};

interface BuildContext {
  galleries: GalleryConfig[];
  generated: GeneratedGallery[];
}

const tasks = new Listr<BuildContext>(
  [
    {
      title: 'Clean Directories',
      task: async (ctx, task): Promise<void> => {
        await fs.cleanDir(path.resolve('./public/gallery'));
      },
    },
    {
      title: 'Discover Galleries',
      task: async (ctx, task): Promise<void> => {
        const galleries = path.resolve('./scripts/scripts-build/galleries');
        const files = await fs.readDir(galleries);

        for (const file of files) {
          if (!file.endsWith('.js')) continue;

          const module = await import('./galleries/' + file);
          const res = GalleryConfigSchema.safeParse(module.default);

          if (res.success) {
            ctx.galleries.push(res.data as GalleryConfig);

            task.output =
              'Discovered: ' +
              chalk.green(res.data.name) +
              chalk.gray(` (${res.data.id})`);
            task.title = `Discover Galleries (${ctx.galleries.length})`;
          } else
            throw (
              'Failed to load gallery from: ' + file + ': ' + res.error.message
            );
        }

        ctx.galleries = ctx.galleries.sort((a, b) => {
          if (a.priority < b.priority) return -1;
          if (b.priority < a.priority) return 1;
          return 0;
        });
      },
      rendererOptions: {
        outputBar: Infinity,
        persistentOutput: true,
      },
    },
    {
      title: 'Validate',
      task: async (ctx, task): Promise<void> => {
        task.title = 'Validate (Mods)';
        for (const mod of Object.entries(config.mods)) {
          mod[1].name = mod[1].name.trim();
          mod[1].viewLocation = mod[1].viewLocation.trim();
          mod[1].iconLocation = mod[1].iconLocation.trim();

          const res = await fetch(mod[1].iconLocation);
          if (!res.ok) throw 'Failed to fetch: ' + mod[1].iconLocation;

          if (mod[0].match(/^[a-z_-]+$/) === null)
            throw `Mod id must match the regex /^[a-z_-]+$/: ${mod[0]}`;
        }

        task.title = 'Validate (Galleries)';
        const galleryIcons = path.resolve(process.cwd(), 'public/galleries/');
        for (const gallery of ctx.galleries) {
          const sources = gallery.sources;

          if (sources.iconLocation.type == 'remote') {
            const res = await fetch(sources.iconLocation.url);
            if (!res.ok) throw 'Failed to fetch: ' + sources.iconLocation.url;
          } else {
            const iconFile = path.resolve(
              galleryIcons,
              gallery.id + '.' + sources.iconLocation.extension,
            );
            if (!(await fs.exists(iconFile)))
              throw 'Expected a file to exist at: ' + iconFile;
          }
        }

        task.title = 'Validate';
      },
    },
    {
      title: 'Discover Extensions',
      task: (ctx, rootTask): Listr => {
        const galleryDir = path.resolve('./public/gallery/');
        const tasks: ListrTask<BuildContext>[] = [];
        let knownExtensions: string[] = [];
        let count = 0;

        for (const gallery of ctx.galleries) {
          const title = `${gallery.name} ${chalk.gray(`(${gallery.id})`)}`;
          tasks.push({
            title,
            task: async (ctx, task): Promise<void> => {
              rootTask.title = `Discover Extensions (${count})`;

              const _knownExtensions: string[] = [...knownExtensions];
              const extensions: GeneratedExtension[] = [];
              let _count = 0;

              const createReporter: () => ProgressReporter = () => {
                task.title = title;

                let progress = 0;
                let maxProgress = 0;

                const setTitle = () => {
                  const percentage = ((progress / maxProgress) * 100).toFixed(
                    2,
                  );
                  task.title =
                    title +
                    chalk.yellow(
                      ` [${percentage}% - ${progress}/${maxProgress}]`,
                    );
                };

                return {
                  increment(amount) {
                    progress += amount;
                    setTitle();
                  },
                  decrement(amount) {
                    progress -= amount;
                    setTitle();
                  },
                  setProgress(_progress) {
                    progress = _progress;
                    setTitle();
                  },
                  setMaxProgress(_progress) {
                    maxProgress = _progress;
                    setTitle();
                  },
                  getProgress() {
                    return progress;
                  },
                  getMaxProgress() {
                    return maxProgress;
                  },
                };
              };

              for (const source of gallery.extensions) {
                task.output = chalk.cyan('Using: ') + chalk.gray(source.name());
                await source.gatherExtensions(
                  (ext) => {
                    if (extensions.find((v) => v.id === ext.id) === undefined) {
                      if (_knownExtensions.includes(ext.id))
                        ext.duplicate = true;
                      else _knownExtensions.push(ext.id);

                      for (const author of [
                        ...ext.authors,
                        ...ext.originalAuthors,
                      ]) {
                        const alias = config.alias.authors.find(
                          (alias) =>
                            alias.name === author.name ||
                            alias.otherNames.includes(author.name),
                        );

                        if (alias !== undefined) {
                          author.name = alias.name;
                          author.link = alias.link;
                        }
                      }

                      for (const badge of ext.badges) {
                        const alias = config.alias.badges.find(
                          (alias) =>
                            alias.name == badge.name ||
                            alias.otherNames.includes(badge.name.toLowerCase()),
                        );

                        if (alias !== undefined) {
                          badge.name = alias.name;
                          badge.tooltip ??= alias.tooltip;
                          badge.link ??= alias.link;
                        }
                      }

                      extensions.push(ext);
                      _count++;

                      rootTask.title = `Discover Extensions (${count + _count})`;
                    } else throw `Duplicate extension id: ${ext.id}`;
                  },
                  createReporter(),
                  gallery,
                  galleryDir,
                );
              }

              task.title = title;
              task.output = chalk.cyan(`Added ${extensions.length} extensions`);

              ctx.generated.push({
                name: gallery.name,
                id: gallery.id,
                viewLocation: gallery.sources.viewLocation,
                iconLocation:
                  gallery.sources.iconLocation.type == 'remote'
                    ? gallery.sources.iconLocation.url
                    : config.basename +
                      'galleries/' +
                      gallery.id +
                      '.' +
                      gallery.sources.iconLocation.extension,
                smallIcon: gallery.sources.smallIcon,
                extensions,
              });

              count += _count;
              knownExtensions = _knownExtensions;
            },
            rendererOptions: {
              outputBar: Infinity,
              persistentOutput: true,
            },
            retry: {
              tries: 5,
              delay: 2000,
            },
          });
        }

        return rootTask.newListr(tasks, {});
      },
    },
    {
      title: 'Apply Modifications',
      task: (ctx, rootTask): Listr => {
        const tasks: ListrTask<BuildContext>[] = [];

        for (const gallery of ctx.galleries) {
          if (gallery.modifications.length === 0) continue;

          const title = gallery.name;
          tasks.push({
            title,
            task: async (ctx, task): Promise<void> => {
              const generated = ctx.generated.find((g) => g.id === gallery.id)!;

              for (const modification of gallery.modifications) {
                task.output =
                  chalk.cyan('Applying: ') + chalk.gray(modification.name());
                modification.modify(gallery, generated);
              }
              task.output = chalk.cyan(
                `Applied ${gallery.modifications.length} modification(s)`,
              );
            },
            rendererOptions: {
              outputBar: Infinity,
              persistentOutput: true,
            },
          });
        }

        return rootTask.newListr(tasks, {});
      },
    },
    {
      title: 'Save Gallery JSON',
      task: async (ctx, task): Promise<void> => {
        const timestamp = Date.now();
        const file = path.resolve('./public/gallery/data.json');
        await fs.write(
          file,
          JSON.stringify({
            lastUpdated: timestamp,
            mods: config.mods,
            galleries: ctx.generated,
            featured: config.featured,
          }),
        );

        task.output = chalk.green('Saved gallery JSON to: ' + file);
        task.output = chalk.cyan('Timestamp: ') + chalk.gray(timestamp);
        task.output =
          chalk.cyan('Mods: ') + chalk.gray(Object.keys(config.mods).length);
        task.output =
          chalk.cyan('Galleries: ') + chalk.gray(ctx.generated.length);
        task.output =
          chalk.cyan('Extensions: ') +
          chalk.gray(
            ctx.generated
              .map((g) => g.extensions.length)
              .reduce((p, c) => p + c, 0),
          );
      },
      rendererOptions: {
        outputBar: Infinity,
        persistentOutput: true,
      },
    },
    {
      title: 'Build Site',
      task: async (ctx, task): Promise<void> => {
        const buildProcess = command('react-router build');

        buildProcess.stdout.pipe(task.stdout());
        buildProcess.stderr.pipe(task.stdout());

        await buildProcess;

        if (config.static && process.env.dev != 'true') {
          const dir = path.resolve('./build/client');
          await fs.copy(
            path.resolve(dir, 'index.html'),
            path.resolve(dir, '404.html'),
          );
        }
      },
      rendererOptions: {
        bottomBar: Infinity,
      },
    },
  ],
  {
    concurrent: false,
    rendererOptions: {
      timer: PRESET_TIMER,
      collapseSubtasks: false,
      showErrorMessage: false,
    },
  },
);

try {
  await tasks.run({
    galleries: [],
    generated: [],
  });

  console.log(chalk.green('\nSuccessfully built extension gallery!\n'));
} catch (e) {
  console.error(chalk.red('\nFailed to build extension gallery!\n'), e);
}
