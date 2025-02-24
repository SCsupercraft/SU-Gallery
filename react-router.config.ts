import type { Config } from '@react-router/dev/config';
import Environment from 'dotenv';
import process from 'node:process';
import { config } from './app/data/config';

Environment.configDotenv();

const rrConfig: Config = {};
rrConfig.ssr = process.env.dev == 'true' ? true : false;
rrConfig.basename = config.basename;

export default rrConfig;
