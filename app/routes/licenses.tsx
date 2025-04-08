import type { Route } from './+types/licenses';
import { Suspense } from 'react';
import { MarkdownPage } from '~/pages/markdown/MarkdownPage';
import { getLicenseText } from '~/data/licenses';

export function meta({}: Route.MetaArgs): Route.MetaDescriptors {
	return [
		{ title: 'Licenses' },
		{
			name: 'description',
			content: 'Welcome to the Scratch Ultimate Extension Gallery!',
		},
	];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	return params;
}

export default function Gallery({ loaderData }: Route.ComponentProps) {
	let text = getLicenseText(loaderData.license);
	const params = new URLSearchParams(window.location.search);

	if (!text)
		return (
			<p className="text-4xl font-bold">
				Failed to find {loaderData.license} License
			</p>
		);

	if (params.has('year'))
		text = text?.replaceAll('[YEAR]', params.get('year')!);

	if (params.has('credits'))
		text = text?.replaceAll('[CREDITS]', params.get('credits')!);

	if (params.has('name'))
		text = text?.replaceAll('[NAME]', params.get('name')!);

	if (params.has('description'))
		text = text?.replaceAll('[DESCRIPTION]', params.get('description')!);

	return (
		<Suspense fallback={<Fallback />}>
			<p className="text-4xl font-bold">{loaderData.license} License</p>
			<MarkdownPage md={text} />
		</Suspense>
	);
}

function Fallback() {
	return <p className="text-2xl">Loading...</p>;
}
