import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
	index('routes/gallery.tsx'),
	route('licenses/:license', 'routes/licenses.tsx'),
] satisfies RouteConfig;
