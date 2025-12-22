import { GalleryPage } from '~/pages/gallery/gallery-page';
import type { Route } from './+types/gallery';
import { Suspense } from 'react';
import { GalleryProvider } from '~/components/context/galleryContext';

export function meta({}: Route.MetaArgs): Route.MetaDescriptors {
	return [
		{ title: 'Gallery' },
		{
			name: 'description',
			content: 'Welcome to the Scratch Ultimate Extension Gallery!',
		},
	];
}

export default function Gallery({ loaderData }: Route.ComponentProps) {
	return (
		<Suspense fallback={<Fallback />}>
			<GalleryProvider>
				<GalleryPage />
			</GalleryProvider>
		</Suspense>
	);
}

function Fallback() {
	return <p className="text-2xl">Loading...</p>;
}
