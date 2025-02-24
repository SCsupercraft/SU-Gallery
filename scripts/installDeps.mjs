import { spawn } from 'node:child_process';

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

await spawnProcess('npm i --force');
await spawnProcess('npm audit fix --legacy-peer-deps');
