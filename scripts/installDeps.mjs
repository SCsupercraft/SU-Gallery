import { spawn } from 'node:child_process';

async function spawn(command) {
	return new Promise((resolve) => {
		const process = spawn(command, [], {
			shell: true,
			cwd: process.cwd(),
			env: process.env,
			stdio: 'inherit',
			encoding: 'utf-8',
		});
		process.once('exit', resolve);
	});
}

await spawn('npm i --force');
await spawn('npm audit fix --legacy-peer-deps');
