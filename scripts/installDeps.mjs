import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs/promises';

async function exists(path) {
	return new Promise(async (resolve, reject) => {
		await fs
			.stat(path)
			.then(async (stat) => {
				resolve(true);
			})
			.catch(async (e) => {
				if (e.code === 'ENOENT') {
					resolve(false);
				} else {
					reject(e);
				}
			});
	});
}

async function spawnProcess(command) {
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
if (await exists(lock)) await fs.rm(lock);

await spawnProcess('npm i --force');
await spawnProcess('npm audit fix --legacy-peer-deps');
