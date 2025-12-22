import { TriangleAlert } from 'lucide-react';
import { useContext } from 'react';
import { GalleryContext } from '~/components/context/galleryContext';
import { ExtensionGrid } from './extension-grid';
import { SearchableExtensionGrid } from './searchable-extension-grid';

export function GalleryPage() {
	const gallery = useContext(GalleryContext);
	if (gallery == null) throw 'Failed to get gallery data!';

	const featuredExtensions = gallery.getFeaturedExtensions();

	return (
		<div className="w-full space-y-6 px-4 pl-8 pr-8">
			<div className="flex rounded-3xl p-4 border border-gray-200 dark:border-gray-700 justify-center">
				<p className="text-sm text-center">
					<TriangleAlert
						className="ms-2 me-2 -mt-0.5 inline-flex text-amber-500"
						size={18}
						aria-hidden="true"
					/>
					This is an experimental gallery! Some features may break.
					<TriangleAlert
						className="ms-2 me-2 -mt-0.5 inline-flex text-amber-500"
						size={18}
						aria-hidden="true"
					/>
					{gallery.lastUpdated != -1 && (
						<>
							<br />
							{`Last updated ${new Date(
								gallery.lastUpdated
							).toLocaleDateString()}`}
						</>
					)}
				</p>
			</div>
			<nav className="rounded-3xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
				<p className="text-2xl leading-6 text-center">
					Featured Extensions
				</p>
				<ExtensionGrid
					extensionManager={gallery}
					extensions={featuredExtensions}
					className="dynamic-grid gap-x-12 gap-y-12"
				/>
				<p className="pt-2 text-2xl leading-6 text-center">
					All Extensions ({gallery.getExtensions().length})
				</p>
				<SearchableExtensionGrid
					useUrlSearchParams={true}
					extensionManager={gallery}
					extensions={gallery.getExtensions()}
					className="dynamic-grid gap-x-12 gap-y-12"
				/>
			</nav>
		</div>
	);
}
