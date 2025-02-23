import type { Config } from '@react-router/dev/config';
import Environment from 'dotenv';
import process from 'node:process';

Environment.configDotenv();

const config: Config = {};
config.ssr = process.env.dev == 'true' ? true : false;

export default config;
