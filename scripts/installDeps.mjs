import { spawn } from 'node:child_process';
import path from 'node:path';
import { BuildHelper } from './helper.mjs';
import fs from 'node:fs/promises';

async function spawnProcess(command) {
	return new Promise((resolve) => {
		const newProcess = spawn(command, [], {
			shell: true,
			cwd: process.cwd(),
			env: process.env,
			stdio: 'inherit',
			encoding: 'utf-8',
		});
		newProcess.once('exit', resolve);
	});
}

const lock = path.resolve(process.cwd(), 'package-lock.json');
if (await BuildHelper.exists(lock)) await fs.rm(path);

await spawnProcess('npm i --force');
await spawnProcess('npm audit fix --legacy-peer-deps');
