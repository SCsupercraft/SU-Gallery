import type { Route } from './+types/gallery';
import { Gallery as GalleryPage } from '../gallery/gallery';
import { ExtensionManager } from '~/data/extensions';
import { Suspense } from 'react';

export function meta({}: Route.MetaArgs): Route.MetaDescriptors {
	return [
		{ title: 'Gallery' },
		{
			name: 'description',
			content: 'Welcome to the Scratch Ultimate Gallery!',
		},
	];
}

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
	try {
		const response = await fetch('/gallery/extensions/galleries.json');
		if (!response.ok) {
			return new ExtensionManager([]);
		}
		const data = await response.json();
		return new ExtensionManager(data);
	} catch (error) {
		console.error(error);
		return new ExtensionManager([]);
	}
}

export default function Gallery({ loaderData }: Route.ComponentProps) {
	return (
		<Suspense fallback={<Fallback />}>
			<GalleryPage extensionManager={loaderData} />
		</Suspense>
	);
}

function Fallback() {
	return <p className="text-2xl">Loading...</p>;
}
