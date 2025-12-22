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
import { Label } from '~/components/ui/label';
import { Toaster } from 'sonner';
import { config } from './data/config';

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
				<link
					rel="icon"
					href={config.basename + 'favicon.png'}
				/>
				<Meta />
				<Links />
			</head>
			<body className="text-gray-700 dark:text-gray-200">
				{children}
				<ScrollRestoration />
				<Scripts />
				<Toaster
					richColors
					theme="system"
				/>
			</body>
		</html>
	);
}

export default function App() {
	return (
		<div className="relative flex flex-col min-h-full w-full">
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
				<p className="text-center">
					Copyright &#169; {new Date().getFullYear()} SCsupercraft.
					Website licensed under the{' '}
					<a
						href="https://github.com/SCsupercraft/SU-Gallery/blob/main/LICENSE"
						target="_blank"
						rel="noreferrer noopener nofollow"
					>
						MIT
					</a>{' '}
					license.
					<br />
					Images & individual extensions may have separate licenses.
				</p>
			</footer>
		</div>
	);
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
	let message = 'Oops!';
	let details = 'An unexpected error occurred.';
	let stack: string | undefined;
	let causes: string[] = [];

	if (isRouteErrorResponse(error)) {
		message = error.status === 404 ? '404' : 'Error';
		details =
			error.status === 404
				? 'The requested page could not be found.'
				: error.statusText || details;
	} else if (import.meta.env.DEV && error && error instanceof Error) {
		details = error.message;
		stack = error.stack;

		let current: unknown = (error as any).cause;
		while (current) {
			if (current instanceof Error) {
				causes.push(current.message);
				current = (current as any).cause;
			} else {
				causes.push(String(current));
				break;
			}
		}
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
			{causes.length > 0 && (
				<div>
					<h2>Caused by:</h2>
					<ul className="pl-4 list-none list-inside">
						{causes.map((c, i) => (
							<p key={i}>{c}</p>
						))}
					</ul>
				</div>
			)}
		</main>
	);
}
