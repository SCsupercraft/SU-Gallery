import { spawn } from 'node:child_process';
import * as path from 'node:path';
import Environment from 'dotenv';
import config from './build.config.mjs';
import { BuildHelper } from './helper.mjs';

import { Chalk } from 'chalk';
const chalk = new Chalk();

/**
 * @typedef {Object} Plugin
 * @property {(prebuildDirectory: string) => Promise<void>} initialize
 * @property {(prebuildDirectory: string, buildDirectory: string) => Promise<void>} finalize
 */

/**
 * @typedef {Object} Config
 * @property {Plugin[]} plugins
 * @property {import("./grab.mjs").GrabConfig} [grab]
 */

Environment.configDotenv();

await initializeBuild();
const exitCode = await build();
if (exitCode != 0) {
	console.log(chalk.redBright('\nBuild failed'));
	process.exit(1);
}
await finalizeBuild();

async function build() {
	return new Promise((resolve) => {
		console.log('Building...\n');

		const buildProcess = spawn('react-router build', [], {
			shell: true,
			cwd: process.cwd(),
			env: process.env,
			stdio: 'inherit',
			encoding: 'utf-8',
		});
		buildProcess.once('exit', resolve);
	});
}

async function initializeBuild() {
	console.log('Initializing build...\n');
	try {
		BuildHelper.prebuildDirectory = path.resolve(
			process.cwd(),
			'scripts/.build'
		);
		BuildHelper.buildDirectory = path.resolve(process.cwd(), 'build');
		await BuildHelper.preInitialization();
		await initialize();
		console.log(chalk.greenBright('\nInitialized build!'));
	} catch (e) {
		console.log(chalk.redBright(`\nFailed to initialize build. ${e}`));
		process.exit(1);
	}
}

async function initialize() {
	return new Promise(async (resolve, reject) => {
		try {
			for (const plugin in config.plugins) {
				await config.plugins[plugin].initialize();
			}
		} catch (e) {
			reject(e);
		}
		resolve();
	});
}

async function finalizeBuild() {
	console.log('\nFinalizing build...\n');
	try {
		await finalize();
		console.log(chalk.greenBright('\nFinished build!'));
	} catch (e) {
		console.log(chalk.redBright(`\nFailed to finalize build. ${e}`));
		process.exit(1);
	}
	process.exit(0);
}

async function finalize() {
	return new Promise(async (resolve, reject) => {
		try {
			for (const plugin in config.plugins) {
				await config.plugins[plugin].finalize();
			}
		} catch (e) {
			reject(e);
		}
		resolve();
	});
}
