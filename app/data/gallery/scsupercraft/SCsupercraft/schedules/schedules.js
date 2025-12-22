// Name: Schedules
// ID: scSchedules
// Description: Schedule code to run at a later date. Might be useful if two operations can't be run at the same time.
// By: SCsupercraft <https://github.com/SCsupercraft>
// License: MIT

((Scratch) => {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('Schedules must be run unsandboxed to work properly!');
	}

	const BlockType = Scratch.BlockType;

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
						blockType: BlockType.BUTTON,
						text: 'Help',
						func: 'helpButton',
					},
					{
						blockType: BlockType.BUTTON,
						text: 'Reset',
						func: 'resetButton',
					},
					'---',
					{
						opcode: 'resetSchedules',
						blockType: BlockType.COMMAND,
						text: 'reset schedules',
					},
					{
						opcode: 'awaitSchedule',
						blockType: BlockType.CONDITIONAL,
						text: ['schedule', 'and wait'],
						branchCount: 1,
					},
				],
			};
		}

		helpButton() {
			window.alert(
				"The schedule block allows you to make sure that two scripts don't run at the same time." +
					'\n\nThis could be useful with extensions such as the ZIP extension by CST1229, as you can only read and write to one archive at once.' +
					'\n\nThe reset block will cancel any existing schedules and should only be used if a schedule was canceled before finishing execution. ' +
					'For example, if the project was stopped while a schedule was running.'
			);
		}

		resetButton() {
			if (
				window.confirm(
					'Are you sure? ' +
						'This will cancel any existing schedules and should only be used if a schedule was canceled before finishing execution. ' +
						'For example, if the project was stopped while a schedule was running.'
				)
			)
				this.schedules = [];
		}

		resetSchedules() {
			this.schedules = [];
		}

		awaitSchedule(_, util) {
			let currentId = util.stackFrame.id; // Get current schedule id. (possibly undefined)

			// Check if the schedules have been reset.
			if (currentId != undefined && !this.schedules.includes(currentId)) {
				throw new Error('Schedules have been reset!');
			}

			// Check if the scheduled code has been executed.
			if (util.stackFrame.hasFinished == true) {
				this.schedules.shift(); // Remove the current schedule from the queue, allowing the next schedule to run.
				return;
			}

			// Check if the schedule hasn't been initialized.
			if (currentId == undefined) {
				currentId = uid();
				util.stackFrame.id = currentId;

				this.schedules.push(currentId); // Add the schedule to the queue.
			}

			// Check if it is our turn to run. (first in queue)
			if (this.schedules[0] === currentId) {
				util.stackFrame.hasFinished = true; // Tell the next run that the schedule finished.
				util.startBranch(1, true); // Start the scheduled code, we pass true so that this function we be called again once the code has been executed.
				return;
			}

			// Cause this function to be called again as we have still not started the scheduled code.
			// util.stackFrame won't change, so we can access data from this run.
			util.yield();
		}
	}

	Scratch.extensions.register(new Extension());
})(Scratch);
