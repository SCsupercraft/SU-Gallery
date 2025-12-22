import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';
import { BuildHelper } from './helper.js';

async function spawnProcess(command: string) {
	return new Promise((resolve) => {
		const newProcess = spawn(command, [], {
			shell: true,
			cwd: process.cwd(),
			env: process.env,
			stdio: 'inherit',
		});
		newProcess.once('exit', resolve);
	});
}

const lock = path.resolve(process.cwd(), 'package-lock.json');

if (await BuildHelper.exists(lock)) await fs.rm(lock);

await spawnProcess('npm i --force');
await spawnProcess('npm audit fix --legacy-peer-deps');
