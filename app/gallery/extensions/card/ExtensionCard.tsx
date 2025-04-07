import { ExtensionManager } from '~/data/extensions';
import {
	AuthorTypeUtil,
	type Extension,
	type ExtensionCredits as ExtensionCreditsType,
	type ExtensionAuthor as ExtensionAuthorType,
	type ExtensionBadge,
} from '~/data/types/extension';
import { config } from '~/data/config';
import { TriangleAlert } from 'lucide-react';

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ExtensionGrid({
	extensionManager,
	className = '',
	featured = false,
	showDupes = false,
}: {
	extensionManager: ExtensionManager;
	className: string;
	featured: boolean;
	showDupes: boolean;
}) {
	const extensions = extensionManager
		.getExtensions()
		.filter(
			(extension) =>
				(!featured || extension.featured) &&
				(showDupes || !extension.dupe)
		);
	let key = 0;

	return extensions.length == 0 ? (
		<div className="flex rounded-3xl p-4 border border-gray-200 dark:border-gray-700 justify-center">
			<p className="text-sm">
				<TriangleAlert
					className="ms-2 me-2 -mt-0.5 inline-flex text-amber-500"
					size={18}
					aria-hidden="true"
				/>
				This feature is currently unavailable!
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

export function ExtensionCard({
	extension,
	extensionManager,
}: {
	extension: Extension;
	extensionManager: ExtensionManager;
}) {
	return (
		<div className="extension border-3 dark:border-gray-800 border-gray-300 rounded-3xl shadow-xl dark:shadow-gray-900 shadow-gray-200 overflow-hidden relative">
			<ExtensionBanner
				id={extension.id}
				banner={extension.banner}
				gallery={extension.gallery}
				extensionManager={extensionManager}
			/>
			<ExtensionPopup
				id={extension.id}
				gallery={extension.gallery}
				extensionManager={extensionManager}
			/>
			<ExtensionSecondaryInfo
				badges={extension.badges}
				gallery={extension.gallery}
				extensionManager={extensionManager}
			/>
			<ExtensionInfo
				name={extension.name}
				description={extension.description}
				license={extension.license}
			/>
			<ExtensionCredits credits={extension.credits} />
		</div>
	);
}

function ExtensionBanner({
	id,
	banner,
	gallery,
	extensionManager,
}: {
	id: string;
	banner?: string;
	gallery: string;
	extensionManager: ExtensionManager;
}) {
	const Gallery = extensionManager.getGallery(gallery as string);

	return (
		<div className="w-full aspect-[2/1] overflow-clip extension-img">
			<img
				src={
					banner == undefined || Gallery == undefined
						? `${config.basename}gallery/extensions/banner/unknown.svg`
						: `${config.basename}gallery/extensions/banner/${Gallery.id}/${id}.${banner}`
				}
				className="w-full h-full object-cover opacity-100"
			></img>
		</div>
	);
}

function ExtensionGallery({
	gallery,
	extensionManager,
}: {
	gallery: string;
	extensionManager: ExtensionManager;
}) {
	const Gallery = extensionManager.getGallery(gallery as string);
	if (Gallery == undefined) return <></>;

	const Img = () => (
		<img
			src={
				Gallery == undefined || Gallery.icon == undefined
					? `${config.basename}gallery/galleries/unknown.svg`
					: `${config.basename}gallery/galleries/${Gallery.id}.${Gallery.icon}`
			}
			className="w-full aspect-[1/1] block"
		></img>
	);

	return (
		<div className="absolute w-full top-1 right-1 flex justify-end pointer-events-none">
			<div
				className={`w-[15%] aspect-[1/1] flex ${
					Gallery.smallIcon ? 'px-1' : ''
				} rounded-full overflow-clip pointer-events-auto bg-gray-900 border border-gray-700`}
			>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							{Gallery.viewLocation != undefined ? (
								<a
									target="_blank"
									rel="noreferrer noopener nofollow"
									href={Gallery.viewLocation}
								>
									<Img />
								</a>
							) : (
								<Img />
							)}
						</TooltipTrigger>
						<TooltipContent>{Gallery.name}</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			</div>
		</div>
	);
}

function ExtensionPopup({
	id,
	gallery,
	extensionManager,
}: {
	id: string;
	gallery: string;
	extensionManager: ExtensionManager;
}) {
	const copyURL = async () => {
		const Gallery = extensionManager.getGallery(gallery);
		if (!Gallery) return;

		const clipboard = navigator.clipboard;
		await clipboard.writeText(
			`${window.location.origin}${config.basename}gallery/extensions/code/${Gallery?.id}/${id}.js`
		);
	};
	const copyCode = async () => {
		const Gallery = extensionManager.getGallery(gallery);
		if (!Gallery) return;

		const code = await (
			await fetch(
				`${config.basename}gallery/extensions/code/${Gallery.id}/${id}.js`
			)
		).text();

		const clipboard = navigator.clipboard;
		await clipboard.writeText(code);
	};
	const saveAs = async () => {
		const Gallery = extensionManager.getGallery(gallery);
		if (!Gallery) return;

		const code = await (
			await fetch(
				`${config.basename}gallery/extensions/code/${Gallery.id}/${id}.js`
			)
		).text();

		const split = id.split('/');
		const fileName = split[split.length - 1] + '.js';

		try {
			/* @ts-ignore */
			const fileHandle = await window.showSaveFilePicker({
				id: 'save-extension',
				startIn: 'downloads',
				suggestedName: fileName,
				types: [
					{
						description: 'Javascript file',
						accept: {
							'text/javascript': ['.js'],
						},
					},
				],
			});

			const writable = await fileHandle.createWritable();
			await writable.write(code);
			await writable.close();
		} catch (e) {
			if (e instanceof Error && e.name === 'AbortError') return;
			console.error('Error saving file: ', e);
		}
	};
	return (
		<div className="absolute content-center justify-center w-full h-auto top-0 right-0 aspect-[2/1] pointer-events-none">
			<div className="flex flex-wrap gap-2 pointer-events-auto w-full h-full ml-0 mr-0 overflow-clip object-cover content-center items-center justify-center">
				<Button
					onClick={copyURL}
					className="w-fit extension-button"
				>
					Copy URL
				</Button>

				<Button
					onClick={copyCode}
					className="w-fit extension-button"
				>
					Copy Code
				</Button>

				{'showSaveFilePicker' in window && (
					<Button
						onClick={saveAs}
						className="w-fit extension-button"
					>
						Save As
					</Button>
				)}
			</div>
		</div>
	);
}

function ExtensionSecondaryInfo({
	badges,
	gallery,
	extensionManager,
}: {
	badges?: ExtensionBadge[];
	gallery: string;
	extensionManager: ExtensionManager;
}) {
	return (
		<>
			<div className="absolute w-full h-auto top-0 right-0 aspect-[2/1] pointer-events-none">
				<div className="absolute w-full bottom-1 right-1 pointer-events-none">
					<ExtensionBadges badges={badges} />
				</div>
			</div>
			<ExtensionGallery
				gallery={gallery}
				extensionManager={extensionManager}
			/>
		</>
	);
}

function ExtensionInfo({
	name,
	description,
	license,
}: {
	name: string;
	description: string;
	license?: string;
}) {
	return (
		<div className="p-5">
			<p className="pb-1 text-2xl">{name}</p>
			<p className="pb-1 text-1xl">{description}</p>
			{license && (
				<p className="pb-1 text-1xl">
					Licensed under the {license} license.
				</p>
			)}
		</div>
	);
}

function ExtensionBadges({ badges }: { badges?: ExtensionBadge[] }) {
	return (
		<div className="w-full flex gap-1.5 justify-end align-bottom pointer-events-auto">
			{badges &&
				badges.map((badge) => (
					<ExtensionSingleBadge
						name={badge.name}
						tooltip={badge.tooltip}
					/>
				))}
		</div>
	);
}

function ExtensionSingleBadge({
	name,
	tooltip,
}: {
	name: string;
	tooltip?: string;
}) {
	return (
		<div className="align-middle">
			{tooltip == null ? (
				<Badge>{name}</Badge>
			) : (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>
							<Badge>{name}</Badge>
						</TooltipTrigger>
						<TooltipContent>{tooltip}</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
		</div>
	);
}

function ExtensionCredits({ credits }: { credits: ExtensionCreditsType }) {
	return (
		<p className="p-5 pt-0">
			{credits.map((author) => {
				return (
					<ExtensionAuthor
						author={author}
						key={author.name}
					/>
				);
			})}
		</p>
	);
}

function ExtensionAuthor({ author }: { author: ExtensionAuthorType }) {
	return (
		<>
			{AuthorTypeUtil.asString(author.type)}{' '}
			{author.link != undefined ? (
				<a
					className="text-blue-400"
					href={author.link}
					target="_blank"
					rel="noreferrer noopener nofollow"
				>
					{author.name}
				</a>
			) : (
				author.name
			)}{' '}
		</>
	);
}
