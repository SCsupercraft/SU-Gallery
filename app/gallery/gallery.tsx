import { ExtensionManager } from '~/data/extensions';
import { ExtensionGrid } from './extensions/card/ExtensionCard';
import { SearchableExtensionGrid } from './extensions/card/SearchableExtensionCard';
import { TriangleAlert } from 'lucide-react';

export function Gallery({
	extensionManager,
}: {
	extensionManager: ExtensionManager;
}) {
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
					<br />
					{extensionManager.lastUpdated != -1 &&
						`Last updated ${new Date(
							extensionManager.lastUpdated
						).toLocaleDateString()}`}
				</p>
			</div>
			<nav className="rounded-3xl p-6 border border-gray-200 dark:border-gray-700 space-y-4">
				<p className="text-2xl leading-6 text-center">
					Featured Extensions
				</p>
				<ExtensionGrid
					extensionManager={extensionManager}
					className="dynamic-grid gap-x-12 gap-y-12"
					featured={true}
					showDupes={false}
				/>
				<p className="pt-2 text-2xl leading-6 text-center">
					All Extensions
				</p>
				<SearchableExtensionGrid
					extensionManager={extensionManager}
					className="dynamic-grid gap-x-12 gap-y-12"
				/>
			</nav>
		</div>
	);
}
