import type { Route } from './+types/licenses';
import { Suspense } from 'react';
import { LicensePage } from '~/pages/license/license-page';

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

export default function Licenses({ loaderData }: Route.ComponentProps) {
	return (
		<Suspense fallback={<Fallback />}>
			<LicensePage license={loaderData.license} />
		</Suspense>
	);
}

function Fallback() {
	return <p className="text-2xl">Loading...</p>;
}
