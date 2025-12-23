import {
	DefaultRenderer,
	delay,
	Listr,
	PRESET_TIMER,
	SimpleRenderer,
	type ListrTaskWrapper,
} from 'listr2';
import { execaCommand as command } from 'execa';
import chalk from 'chalk';

import Environment from 'dotenv';
import {
	RemoteDownloadTaskCollection,
	type ExtensionGallery,
	type GalleryJSON,
} from './extension-gallery.js';
import { data } from './data.js';
import path from 'node:path';
import { BuildHelper } from './helper.js';
Environment.configDotenv({ quiet: true });

interface BuildContext {
	galleries: ExtensionGallery<any, any>[];
	json: GalleryJSON;
}

BuildHelper.publicDirectory = path.resolve('./public/');
BuildHelper.galleryDirectory = path.resolve('./public/gallery');

const tasks = new Listr(
	[
		{
			title: 'Refresh Extension List',
			task: (ctx: BuildContext, task): Listr => {
				ctx.json.lastUpdated = Date.now();
				return task.newListr(
					[
						...ctx.galleries.map((gallery) => {
							return {
								title: gallery.name(),
								task: async (ctx: BuildContext, task: any) => {
									await gallery.refresh(
										(message: string) =>
											(task.output = message)
									);
								},
								rendererOptions: {
									outputBar: Infinity,
									persistentOutput: true,
								},
							};
						}),
					],
					{}
				);
			},
			rendererOptions: {
				bottomBar: Infinity,
			},
		},
		{
			title: 'Download Assets',
			task: (ctx: BuildContext, task): Listr => {
				return task.newListr(
					[
						{
							title: 'Supported Mod Icons',
							task: async (
								ctx: BuildContext,
								task: ListrTaskWrapper<
									BuildContext,
									typeof DefaultRenderer,
									typeof SimpleRenderer
								>
							): Promise<void> => {
								task.title = `Supported Mod Icons - Configuring`;
								const collection =
									new RemoteDownloadTaskCollection();

								for (const mod of data.supportedMods) {
									const extension = mod.iconExtension
										? mod.iconExtension
										: mod.iconUrl.substring(
												mod.iconUrl.lastIndexOf('.') + 1
											);

									collection.addDownloadTask(
										mod.iconUrl,
										async (response) => {
											const imgContent =
												await response.blob();
											await BuildHelper.write(
												path.resolve(
													BuildHelper.galleryDirectory,
													`mods/${mod.id}.${extension}`
												),
												await imgContent.bytes(),
												'utf-8'
											);
										}
									);
								}
								task.title = 'Supported Mod Icons';
								await collection.start(
									(title) => (task.output = title)
								);
							},
							rendererOptions: {
								outputBar: 5,
								persistentOutput: false,
							},
						},
						...ctx.galleries
							.filter((gallery) => gallery.isRemote())
							.map((gallery) => {
								return {
									title: gallery.name(),
									task: async (
										ctx: BuildContext,
										task: ListrTaskWrapper<
											BuildContext,
											typeof DefaultRenderer,
											typeof SimpleRenderer
										>
									): Promise<void> => {
										task.title = `${gallery.name()} - Configuring`;
										const collection =
											new RemoteDownloadTaskCollection();
										await gallery.downloadRemote(
											collection
										);
										task.title = gallery.name();
										await collection.start(
											(title) => (task.output = title)
										);
									},
									rendererOptions: {
										outputBar: 5,
										persistentOutput: false,
									},
									retry: 3,
								};
							}),
					],
					{}
				);
			},
			rendererOptions: {
				bottomBar: Infinity,
			},
		},
		{
			title: 'Validate Assets',
			task: (ctx: BuildContext, task): Listr => {
				return task.newListr(
					[
						{
							title: 'Supported Mod Icons',
							task: async (ctx: BuildContext, task) => {
								for (const mod of ctx.json.supportedMods) {
									const iconFile = path.resolve(
										BuildHelper.galleryDirectory,
										`mods/${mod.id}.${mod.iconExtension}`
									);
									if (!(await BuildHelper.exists(iconFile)))
										throw `Failed to find mod icon! Expected the file '${iconFile}' to exist.`;
								}
							},
							rendererOptions: {
								outputBar: Infinity,
								persistentOutput: true,
							},
						},
						...ctx.galleries.map((gallery) => {
							return {
								title: gallery.name(),
								task: async (ctx: BuildContext, task: any) => {
									await gallery.validateAssets(
										(message: string) =>
											(task.output = message)
									);
								},
								rendererOptions: {
									outputBar: Infinity,
									persistentOutput: true,
								},
							};
						}),
					],
					{}
				);
			},
			rendererOptions: {
				outputBar: Infinity,
				persistentOutput: true,
			},
		},
		{
			title: 'Copy Assets',
			task: async (ctx: BuildContext, task): Promise<Listr> => {
				await BuildHelper.copy(
					path.resolve(
						'./app/data/gallery/',
						'unknown-extension.svg'
					),
					path.resolve(
						BuildHelper.galleryDirectory,
						'extensions/banner/unknown.svg'
					)
				);
				await BuildHelper.copy(
					path.resolve('./app/data/gallery/', 'unknown-gallery.svg'),
					path.resolve(
						BuildHelper.galleryDirectory,
						'galleries/unknown.svg'
					)
				);
				return task.newListr(
					[
						...ctx.galleries
							.filter((gallery) => !gallery.isRemote())
							.map((gallery) => {
								return {
									title: gallery.name(),
									task: async (
										ctx: BuildContext,
										task: any
									) => {
										await gallery.copyFiles();
									},
									rendererOptions: {
										outputBar: Infinity,
										persistentOutput: true,
									},
								};
							}),
					],
					{}
				);
			},
			rendererOptions: {
				outputBar: Infinity,
				persistentOutput: true,
			},
		},
		{
			title: 'Generate Gallery JSON File',
			task: async (ctx: BuildContext, task): Promise<void> => {
				for (const gallery of ctx.galleries) {
					ctx.json.galleries.push(gallery.generateJson());
				}

				const knownExtensions: Set<string> = new Set();
				for (const gallery of ctx.json.galleries) {
					for (const extension of gallery.extensions) {
						if (
							knownExtensions.has(extension.id) ||
							data.duplicates.find(
								(loc) =>
									loc.galleryId === gallery.id &&
									loc.extensionId === extension.id
							) != undefined
						)
							extension.duplicate = true;
						knownExtensions.add(extension.id);

						for (const author of extension.authors) {
							const alias = data.authorsAlias.find(
								(alias) =>
									alias.name === author.name ||
									alias.alias.includes(author.name)
							);

							if (alias) {
								author.name = alias.name;
								if (alias.link) author.link = alias.link;
							}
						}

						for (const author of extension.originalAuthors) {
							const alias = data.authorsAlias.find(
								(alias) =>
									alias.name === author.name ||
									alias.alias.includes(author.name)
							);

							if (alias) {
								author.name = alias.name;
								if (alias.link) author.link = alias.link;
							}
						}
					}
				}

				await BuildHelper.write(
					path.resolve(
						BuildHelper.publicDirectory,
						'gallery',
						'data.json'
					),
					JSON.stringify(ctx.json),
					{
						encoding: 'utf-8',
					}
				);
			},
		},
		{
			title: 'Build Site',
			task: async (ctx, task): Promise<void> => {
				const buildProcess = command('react-router build');

				buildProcess.stdout.pipe(task.stdout());
				buildProcess.stderr.pipe(task.stdout());

				await buildProcess;
			},
			rendererOptions: {
				bottomBar: Infinity,
			},
		},
		{
			title: 'Create 404 Page (GitHub Pages)',
			task: async (ctx, task): Promise<void> => {
				const dir = path.resolve('./build/client');
				await BuildHelper.copy(
					path.resolve(dir, 'index.html'),
					path.resolve(dir, '404.html')
				);
				await delay(2000);
			},
			enabled: data.githubPages,
			skip:
				process.env.dev == 'true'
					? `Create 404 Page (GitHub Pages) ${chalk.dim('[skipped for dev environments]')}`
					: false,
		},
	],
	{
		concurrent: false,
		rendererOptions: {
			timer: PRESET_TIMER,
			collapseSubtasks: false,
			showErrorMessage: false,
		},
	}
);

const ctx: BuildContext = {
	galleries: data.galleries,
	json: {
		lastUpdated: -1,
		supportedMods: data.supportedMods.map((mod) => {
			const extension = mod.iconExtension
				? mod.iconExtension
				: mod.iconUrl.substring(mod.iconUrl.lastIndexOf('.') + 1);
			return {
				id: mod.id,
				name: mod.name,
				link: mod.link,
				iconExtension: extension,
				smallIcon: mod.smallIcon,
			};
		}),
		featured: data.featured,
		galleries: [],
	},
};

try {
	await BuildHelper.preInitialization();
	await tasks.run(ctx);
} catch (e) {
	console.error(chalk.red('\nFailed to build extension gallery!\n'), e);
}
