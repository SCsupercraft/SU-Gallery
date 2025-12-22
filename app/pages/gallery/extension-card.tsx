import type { ExtensionManager } from '~/data/gallery';
import {
	type Author,
	type Badge as ExtensionBadge,
	type Extension,
	type Version,
} from '~/types/extension';
import { config } from '~/data/config';

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '~/components/ui/tooltip';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { useState } from 'react';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '~/components/ui/command';
import {
	Check,
	ChevronsUpDown,
	ExternalLinkIcon,
	TriangleAlert,
} from 'lucide-react';
import { cn } from '~/lib/utils';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog';
import { ExtensionLicense } from './extension-license';

// import { supportedLicenses } from '~/data/licenses';
// import { NavLink } from 'react-router';

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
				banner={extension.bannerExtension}
				gallery={extension.gallery}
				extensionManager={extensionManager}
			/>
			<ExtensionPopup
				id={extension.id}
				versions={extension.versions}
				gallery={extension.gallery}
				extensionManager={extensionManager}
			/>
			<ExtensionSecondaryInfo
				badges={extension.badges}
				gallery={extension.gallery}
				extensionManager={extensionManager}
			/>
			<ExtensionInfo
				extension={extension}
				extensionManager={extensionManager}
			/>
			<ExtensionCredits
				authors={extension.authors}
				originalAuthors={extension.originalAuthors}
			/>
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
		<div className="w-full aspect-2/1 overflow-clip extension-img">
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
				Gallery == undefined || !Gallery.iconExtension
					? `${config.basename}gallery/galleries/unknown.svg`
					: `${config.basename}gallery/galleries/${Gallery.id}.${Gallery.iconExtension}`
			}
			className="w-full aspect-square block"
		></img>
	);

	return (
		<div className="absolute w-full top-1 right-1 flex justify-end pointer-events-none">
			<div
				className={`w-[15%] aspect-square flex ${
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

function ExtensionPopupUnversioned({
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
			`${window.location.origin}${
				config.basename
			}gallery/extensions/code/${Gallery!.id}/${id}.js`
		);

		toast.success('Copied to clipboard!', {
			description: 'Copied the extension URL to clipboard',
		});
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

		toast.success('Copied to clipboard!', {
			description: 'Copied the extension code to clipboard',
		});
	};
	const saveAs = async () => {
		const Gallery = extensionManager.getGallery(gallery);
		if (!Gallery) return;

		const split = id.split('/');
		const fileName = split[split.length - 1] + '.js';

		let errMsg = 'Failed to save file!';
		const promise = new Promise<string>(async (resolve, reject) => {
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

				const code = await (
					await fetch(
						`${config.basename}gallery/extensions/code/${Gallery.id}/${id}.js`
					)
				).text();

				const writable = await fileHandle.createWritable();
				await writable.write(code);
				await writable.close();

				resolve('Saved the extension code to file');
			} catch (e) {
				if (e instanceof Error && e.name === 'AbortError')
					reject('Cancelled by user!');
				reject(String(e));
			}
		});

		toast.promise(promise, {
			loading: 'Saving to file',
			success: 'Saved to file!',
			error: () => errMsg,
			description: (data) => String(data),
		});

		await promise;
	};
	return (
		<div className="absolute content-center justify-center w-full h-auto top-0 right-0 aspect-2/1 pointer-events-none">
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

function ExtensionPopupVersioned({
	id,
	versions,
	gallery,
	extensionManager,
}: {
	id: string;
	versions: Version[];
	gallery: string;
	extensionManager: ExtensionManager;
}) {
	const [open, setOpen] = useState<boolean>(false);
	const [currentVersion, setCurrentVersion] = useState<Version>(versions[0]);

	const copyURL = async () => {
		const Gallery = extensionManager.getGallery(gallery);
		if (!Gallery) return;

		const clipboard = navigator.clipboard;
		await clipboard.writeText(
			`${window.location.origin}${
				config.basename
			}gallery/extensions/code/${Gallery!.id}/${id}/${currentVersion.foldername}/${id.substring(
				id.lastIndexOf('/') + 1
			)}.js`
		);

		toast.success('Copied to clipboard!', {
			description: 'Copied the extension URL to clipboard',
		});
	};
	const copyCode = async () => {
		const Gallery = extensionManager.getGallery(gallery);
		if (!Gallery) return;

		const code = await (
			await fetch(
				`${config.basename}gallery/extensions/code/${Gallery.id}/${id}/${currentVersion.foldername}/${id.substring(
					id.lastIndexOf('/') + 1
				)}.js`
			)
		).text();

		const clipboard = navigator.clipboard;
		await clipboard.writeText(code);

		toast.success('Copied to clipboard!', {
			description: 'Copied the extension code to clipboard',
		});
	};
	const saveAs = async () => {
		const Gallery = extensionManager.getGallery(gallery);
		if (!Gallery) return;

		const split = id.split('/');
		const fileName = split[split.length - 1] + '.js';

		let errMsg = 'Failed to save file!';
		const promise = new Promise<string>(async (resolve, reject) => {
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

				const code = await (
					await fetch(
						`${config.basename}gallery/extensions/code/${Gallery.id}/${id}/${currentVersion.foldername}/${id.substring(
							id.lastIndexOf('/') + 1
						)}.js`
					)
				).text();

				const writable = await fileHandle.createWritable();
				await writable.write(code);
				await writable.close();

				resolve('Saved the extension code to file');
			} catch (e) {
				if (e instanceof Error && e.name === 'AbortError')
					reject('Cancelled by user!');
				reject(String(e));
			}
		});

		toast.promise(promise, {
			loading: 'Saving to file',
			success: 'Saved to file!',
			error: () => errMsg,
			description: (data) => String(data),
		});

		await promise;
	};
	return (
		<div className="absolute content-center justify-center w-full h-auto top-0 right-0 aspect-2/1 pointer-events-none">
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

				<Popover
					open={open}
					onOpenChange={setOpen}
				>
					<PopoverTrigger asChild>
						<Button
							role="combobox"
							aria-expanded={open}
							className="w-fit extension-button justify-between"
						>
							{currentVersion.name}
							<ChevronsUpDown className="opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[300px] p-0">
						<Command>
							<CommandInput
								placeholder="Search versions..."
								className="h-9"
							/>
							<CommandList>
								<CommandEmpty>No version found.</CommandEmpty>
								<CommandGroup>
									{versions.map((version) => (
										<CommandItem
											key={version.foldername}
											value={version.name}
											onSelect={(
												currentValue: string
											) => {
												setCurrentVersion(version);
												setOpen(false);
											}}
										>
											{version.name}
											<Check
												className={cn(
													'ml-auto',
													currentVersion.foldername.toLowerCase() ===
														version.foldername.toLowerCase()
														? 'opacity-100'
														: 'opacity-0'
												)}
											/>
										</CommandItem>
									))}
								</CommandGroup>
							</CommandList>
						</Command>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}

function ExtensionPopup({
	id,
	versions,
	gallery,
	extensionManager,
}: {
	id: string;
	versions?: Version[];
	gallery: string;
	extensionManager: ExtensionManager;
}) {
	return versions == undefined ? (
		<ExtensionPopupUnversioned
			id={id}
			gallery={gallery}
			extensionManager={extensionManager}
		/>
	) : (
		<ExtensionPopupVersioned
			id={id}
			versions={versions}
			gallery={gallery}
			extensionManager={extensionManager}
		/>
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
			<div className="absolute w-full h-auto top-0 right-0 aspect-2/1 pointer-events-none">
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
	extension,
	extensionManager,
}: {
	extension: Extension;
	extensionManager: ExtensionManager;
}) {
	const {
		id,
		name,
		description,
		gallery,
		authors,
		license,
		supports,
		maySupport,
	} = extension;
	const Gallery = extensionManager.getGallery(gallery);

	return (
		<div className="p-5">
			<p className="pb-1 text-2xl">
				{name}
				<ExtensionSupportedMods
					extensionManager={extensionManager}
					name={name}
					supports={supports}
					maySupport={maySupport}
				/>
			</p>
			<p className="pb-1 text-1xl">{description}</p>
			{license && <ExtensionLicense licenseString={license} />}
		</div>
	);
}

function ExtensionSupportedMods({
	extensionManager,
	name,
	supports,
	maySupport,
}: {
	extensionManager: ExtensionManager;
	name: string;
	supports: string[];
	maySupport: string[];
}) {
	const total = supports.length + maySupport.length;
	if (total == 0) return <></>;

	const firstSupported = supports[0] || maySupport[0];
	const tooltip = (
		<p className="text-center">
			{`This extension supports ${extensionManager.getSupportedMod(firstSupported)?.name}` +
				(total > 1 ? ` and ${total - 1} other scratch mod(s)` : '')}
			<br />
			{'Click for more details'}
		</p>
	);

	let z = total;

	const mapper = (id: string) => {
		const mod = extensionManager.getSupportedMod(id)!;
		const Img = () => (
			<img
				src={`${config.basename}gallery/mods/${mod.id}.${mod.iconExtension}`}
				className="w-full aspect-square block"
			></img>
		);
		return (
			<div
				key={id}
				style={{
					width: 'var(--text-2xl)',
					height: 'var(--text-2xl)',
					zIndex: z--,
				}}
				className={`aspect-square flex items-center ${
					mod.smallIcon ? 'px-0.5' : ''
				} rounded-full overflow-clip pointer-events-auto bg-gray-900 border border-gray-700`}
			>
				<Img />
			</div>
		);
	};

	return (
		<Dialog>
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>
						<DialogTrigger asChild>
							<div className="ml-2 inline-flex -space-x-3">
								{supports.map(mapper)}
								{maySupport.map(mapper)}
							</div>
						</DialogTrigger>
					</TooltipTrigger>
					<TooltipContent>{tooltip}</TooltipContent>
				</Tooltip>
			</TooltipProvider>
			<DialogContent className="sm:max-w-[600px]">
				<DialogHeader>
					<DialogTitle>Supported Mods for {name}</DialogTitle>
					<DialogDescription>
						The following mods are supported by this extension.
						<br />
						<br />
						Mods marked with a warning symbol means that the
						extension is not made for that mod, but it might still
						work.
					</DialogDescription>
				</DialogHeader>
				<div className="flex flex-col">
					{supports.map((id) => {
						const mod = extensionManager.getSupportedMod(id)!;
						return (
							<a
								key={id}
								className="text-blue-400! text-sm"
								href={mod.link}
								target="_blank"
								rel="noreferrer noopener nofollow"
							>
								{mod.name}
								<ExternalLinkIcon
									style={{
										display: 'inline-block',
										width: 'var(--text-sm)',
										height: 'var(--text-sm)',
									}}
								/>
							</a>
						);
					})}
					{maySupport.map((id) => {
						const mod = extensionManager.getSupportedMod(id)!;
						return (
							<a
								key={id}
								className="text-blue-400! text-sm"
								href={mod.link}
								target="_blank"
								rel="noreferrer noopener nofollow"
							>
								{mod.name}
								<ExternalLinkIcon
									style={{
										display: 'inline-block',
										width: 'var(--text-sm)',
										height: 'var(--text-sm)',
									}}
								/>
								<TriangleAlert
									className="inline-flex text-amber-500"
									size={14}
									aria-hidden="true"
								/>
							</a>
						);
					})}
				</div>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">Close</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

function ExtensionBadges({ badges }: { badges?: ExtensionBadge[] }) {
	return (
		<div className="w-full flex gap-1.5 justify-end align-bottom pointer-events-auto">
			{badges &&
				badges.map((badge) => (
					<ExtensionSingleBadge
						key={badge.name}
						name={badge.name}
						tooltip={badge.tooltip}
						link={badge.link}
					/>
				))}
		</div>
	);
}

function ExtensionSingleBadge({
	name,
	tooltip,
	link,
}: {
	name: string;
	tooltip?: string;
	link?: string;
}) {
	const node = link ? (
		<Badge asChild>
			<a
				className="text-blue-800!"
				href={link}
				target="_blank"
				rel="noreferrer noopener nofollow"
			>
				{name}
				<ExternalLinkIcon />
			</a>
		</Badge>
	) : (
		<Badge>{name}</Badge>
	);

	return (
		<div className="align-middle">
			{tooltip == null ? (
				node
			) : (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger>{node}</TooltipTrigger>
						<TooltipContent>{tooltip}</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			)}
		</div>
	);
}

function ExtensionCredits({
	authors,
	originalAuthors,
}: {
	authors: Author[];
	originalAuthors: Author[];
}) {
	let creators = 0;
	let originalCreators = 0;
	return (
		<>
			<p className="pl-5 pr-5">
				{authors.map((credit) => {
					const flag1 = creators == 0;
					const flag2 =
						authors[authors.length - 1].name == credit.name;
					const flag3 = !flag2;

					creators++;

					let prefix = '';
					let suffix = '';

					if (flag1) prefix = ' Created by';
					else if (flag2) prefix = ' and';
					if (flag3) suffix = ',';

					return (
						<span key={credit.name}>
							{prefix}{' '}
							{credit.link != undefined ? (
								<a
									className="text-blue-400"
									href={credit.link}
									target="_blank"
									rel="noreferrer noopener nofollow"
								>
									{credit.name + suffix}
								</a>
							) : (
								credit.name + suffix
							)}
						</span>
					);
				})}
			</p>
			<p className="p-5 pt-0">
				{originalAuthors.map((credit) => {
					const flag1 = originalCreators == 0;
					const flag2 =
						originalAuthors[originalAuthors.length - 1].name ==
						credit.name;
					const flag3 = !flag2;

					originalCreators++;

					let prefix = '';
					let suffix = '';

					if (flag1) prefix = ' Originally created by';
					else if (flag2) prefix = ' and';
					if (flag3) suffix = ',';

					return (
						<span key={credit.name}>
							{prefix}{' '}
							{credit.link != undefined ? (
								<a
									href={credit.link}
									target="_blank"
									rel="noreferrer noopener nofollow"
								>
									{credit.name + suffix}
								</a>
							) : (
								credit.name + suffix
							)}
						</span>
					);
				})}
			</p>
		</>
	);
}
