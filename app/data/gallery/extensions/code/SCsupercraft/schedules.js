// Name: Schedules
// ID: scSchedules
// Description: Schedule code to run at a later date. Might be useful if two operations can't be run at the same time.
// By: SCsupercraft <https://github.com/SCsupercraft>
// License: MIT
// Badge: Alpha - This extension is a work in progress! You may encounter bugs.

/*
	Note: This extension is not functional and is still in development, do not use.
*/

((Scratch) => {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('Schedules must be run unsandboxed to work properly!');
	}

	const vm = Scratch.vm;
	const runtime = vm.runtime;

	const BlockType = Scratch.BlockType;
	const ArgumentType = Scratch.ArgumentType;
	const Cast = Scratch.Cast;

	/**
	 * Legal characters for the unique ID.
	 * Should be all on a US keyboard.  No XML special characters or control codes.
	 * Removed $ due to issue 251.
	 * @private
	 */
	const soup_ =
		'!#%()*+,-./:;=?@[]^_`{|}~' +
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	/**
	 * Generate a unique ID, from Blockly.  This should be globally unique.
	 * 87 characters ^ 20 length > 128 bits (better than a UUID).
	 * @return {string} A globally unique ID string.
	 */
	const uid = function () {
		const length = 20;
		const soupLength = soup_.length;
		const id = [];
		for (let i = 0; i < length; i++) {
			id[i] = soup_.charAt(Math.random() * soupLength);
		}
		return id.join('');
	};

	class Extension {
		constructor() {
			this.schedules = [];
		}
		getInfo() {
			return {
				id: 'scSchedules',
				name: 'Schedules',
				color1: '#e3685f',
				blocks: [
					{
						opcode: 'schedule',
						blockType: BlockType.CONDITIONAL,
						text: 'schedule',
						branchCount: 1,
					},
				],
			};
		}

		removeSchedule(id) {
			this.schedules.splice(this.schedules.indexOf(id), 1);
		}

		async waitUntilScheduled(id) {
			return new Promise((resolve) => {
				const n = setInterval(() => {
					if (this.schedules[0] === id) {
						console.log(this.schedules, id);
						clearInterval(n);
						resolve();
					}
				}, 5);
			});
		}

		async schedule(args, util) {
			const id = uid();
			this.schedules.push(id);

			await this.waitUntilScheduled(id);
			// FIXME: This starts the branch, but doesn't wait until it's finished.
			// 	We need to somehow wait until the branch has finished before declaring the schedule as finished.
			util.startBranch(1, false);
			this.removeSchedule(id);
		}
	}

	Scratch.extensions.register(new Extension());
})(Scratch);
