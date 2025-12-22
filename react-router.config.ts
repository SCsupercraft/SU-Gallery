import type { Config } from '@react-router/dev/config';
import Environment from 'dotenv';
import process from 'node:process';
import { config } from './app/data/config';

Environment.configDotenv({ quiet: true });

export default {
	ssr: process.env.dev == 'true' ? true : false,
	basename: config.basename,
} satisfies Config;
