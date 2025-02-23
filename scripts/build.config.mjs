import { ExtensionData } from './extension-data.mjs';

/**
 * @typedef {Object} Plugin
 * @property {(prebuildDirectory: string) => Promise<void>} initialize
 * @property {(prebuildDirectory: string, buildDirectory: string) => Promise<void>} finalize
 */

/**
 * @typedef {Object} Config
 * @property {Plugin[]} plugins
 */

/**
 * @type {Config}
 */
export default {
	plugins: [ExtensionData],
};
