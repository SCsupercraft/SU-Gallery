// Name: Placeholder
// ID: placeholder
// Description: Uhh, a placeholder?
// License: MIT

((Scratch) => {
	'use strict';

	if (!Scratch.extensions.unsandboxed) {
		throw new Error('Schedules must be run unsandboxed to work properly!');
	}

	const BlockType = Scratch.BlockType;

	class Extension {
		getInfo() {
			return {
				id: 'placeholder',
				name: 'Placeholder',

				blocks: [
					{
						blockType: BlockType.BUTTON,
						text: 'Help',
						func: 'helpButton',
					},
				],
			};
		}

		helpButton() {
			window.alert(
				"This a placeholder extension, it doesn't actually do anything!"
			);
		}
	}

	Scratch.extensions.register(new Extension());
})(Scratch);
