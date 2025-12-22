import type { ExtensionManager } from '~/data/gallery';
import { TriangleAlert } from 'lucide-react';
import { ExtensionCard } from './extension-card';
import type { Extension } from '~/types/extension';

export function ExtensionGrid({
	extensionManager: extensionManager,
	extensions,
	className = '',
}: {
	extensionManager: ExtensionManager;
	extensions: Extension[];
	className: string;
}) {
	let key = 0;

	return extensions.length == 0 ? (
		<div className="flex rounded-3xl p-4 border border-gray-200 dark:border-gray-700 justify-center">
			<p className="text-sm">
				<TriangleAlert
					className="ms-2 me-2 -mt-0.5 inline-flex text-amber-500"
					size={18}
					aria-hidden="true"
				/>
				No extensions available!
				<TriangleAlert
					className="ms-2 me-2 -mt-0.5 inline-flex text-amber-500"
					size={18}
					aria-hidden="true"
				/>
			</p>
		</div>
	) : (
		<div className={className}>
			{extensions.map((extension) => {
				key++;
				return (
					<ExtensionCard
						extension={extension}
						extensionManager={extensionManager}
						key={key}
					/>
				);
			})}
		</div>
	);
}
