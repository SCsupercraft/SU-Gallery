import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { config } from './app/data/config';

export default defineConfig({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './app/ui'),
		},
	},
	base: config.basename,
});
