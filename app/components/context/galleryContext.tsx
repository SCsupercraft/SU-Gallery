import React, { createContext, useState, useEffect } from 'react';
import { config } from '~/data/config';
import { ExtensionManager } from '~/data/gallery';
import { createBlankResource } from '~/lib/resource';

const galleryResource = createBlankResource(async () => {
	return await fetch(`${config.basename}gallery/data.json`)
		.then((res) => {
			if (!res.ok)
				throw new Error(`Unexpected status code: ${res.status}`);
			return res.json();
		})
		.then((data) => new ExtensionManager(data));
});

export const GalleryContext = createContext<ExtensionManager | null>(null);

export const GalleryProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const data = galleryResource.get();

	return (
		<GalleryContext.Provider value={data}>
			{children}
		</GalleryContext.Provider>
	);
};
