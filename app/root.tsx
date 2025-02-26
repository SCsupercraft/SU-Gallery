import {
	isRouteErrorResponse,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
} from 'react-router';

import type { Route } from './+types/root';
import './app.css';
import { Label } from './ui/components/ui/label';

export const links: Route.LinksFunction = () => [
	{ rel: 'preconnect', href: 'https://fonts.googleapis.com' },
	{
		rel: 'preconnect',
		href: 'https://fonts.gstatic.com',
		crossOrigin: 'anonymous',
	},
	{
		rel: 'stylesheet',
		href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
	},
];

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>
				<Meta />
				<Links />
			</head>
			<body className="text-gray-700 dark:text-gray-200">
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return (
		<div className="relative flex flex-col min-h-[100%] w-full">
			<main
				className="flex items-center justify-center"
				style={{ paddingBottom: 'calc(var(--spacing) * 4 + 60px)' }}
			>
				<div className="flex-1 flex flex-col items-center gap-10 h-full">
					<header className="flex flex-col items-center gap-9 h-[60px] w-full dark:bg-gray-900 bg-gray-100 dark:shadow-black shadow-gray-300 drop-shadow-xl justify-center">
						<Label className="text-2xl">
							Scratch Ultimate Extension Gallery
						</Label>
					</header>
					<Outlet />
				</div>
			</main>
			<footer className="absolute bottom-0 flex flex-col items-center gap-9 h-[60px] w-full dark:bg-gray-900 bg-gray-100 justify-center">
				<p>
					Copyright &#169; {new Date().getFullYear()} SCsupercraft.
					Licensed under the{' '}
					<a
						className="text-blue-400"
						href="https://github.com/SCsupercraft/SU-Gallery/blob/main/LICENSE"
						target="_blank"
						rel="noreferrer noopener nofollow"
					>
						MIT
					</a>{' '}
					license.
				</p>
			</footer>
		</div>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = 'Oops!';
	let details = 'An unexpected error occurred.';
	let stack: string | undefined;

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? '404' : 'Error';
		details =
			error.status === 404
				? 'The requested page could not be found.'
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;
	}

	return (
		<main className="pt-16 p-4 container mx-auto">
			<h1>{message}</h1>
			<p>{details}</p>
			{stack && (
				<pre className="w-full p-4 overflow-x-auto">
					<code>{stack}</code>
				</pre>
			)}
		</main>
	);
}
