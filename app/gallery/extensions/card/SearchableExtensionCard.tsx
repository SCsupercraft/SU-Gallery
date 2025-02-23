import { useEffect, useState } from 'react';
import { type Extension, type ExtensionAuthor } from '../extension';
import { ExtensionCard } from './ExtensionCard';
import { TriangleAlert } from 'lucide-react';

import * as React from 'react';
import {
	AlignLeft,
	BookCopy,
	BookDashed,
	Check,
	ChevronsUpDown,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { ExtensionManager } from '~/data/extensions';

type SearchParams = {
	query: string;
	author: string;
	gallery: string;
	includeDescription: boolean;
	showDupes: boolean;
};

export function SearchableExtensionGrid({
	extensionManager,
	className,
}: {
	extensionManager: ExtensionManager;
	className: string;
}) {
	const [params, setParams] = useState<SearchParams>({
		query: '',
		author: '',
		gallery: '',
		includeDescription: false,
		showDupes: false,
	});

	const extensions = extensionManager.getExtensions();
	const filteredExtensions = extensions.filter((extension) =>
		matchesSearch(extension, params)
	);
	let key = 0;

	return extensions.length == 0 ? (
		<div className="flex rounded-3xl p-4 border border-gray-200 dark:border-gray-700 justify-center">
			<p className="text-sm">
				<TriangleAlert
					className="me-3 -mt-0.5 inline-flex text-amber-500"
					size={16}
					aria-hidden="true"
				/>
				This feature is currently unavailable!
			</p>
		</div>
	) : (
		<>
			<SearchBar
				params={params}
				setParams={setParams}
				extensionManager={extensionManager}
			></SearchBar>
			{filteredExtensions.length == 0 ? (
				<div className="flex rounded-2xl p-4 border border-gray-200 dark:border-gray-700 justify-center">
					<p className="text-sm">No extensions matched search.</p>
				</div>
			) : (
				<div className={className}>
					{filteredExtensions.map((extension) => {
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
			)}
		</>
	);
}

function SearchBar({
	params,
	setParams,
	extensionManager,
}: {
	params: SearchParams;
	setParams: React.Dispatch<SearchParams>;
	extensionManager: ExtensionManager;
}) {
	const dupeAmount = extensionManager
		.getExtensions()
		.reduce((amount, extension) => {
			return extension.dupe ? amount + 1 : amount;
		}, 0);

	return (
		<div className="min-h-[80px] rounded-2xl border border-gray-200 dark:border-gray-700 px-4 content-center">
			<div className="grid xl:grid-cols-2 xl:grid-rows-1 grid-cols-1 grid-rows-2">
				<div className="flex-col flex-auto mr-auto w-fit pt-3 xl:pb-3 justify-items-start content-center">
					<Query
						params={params}
						setParams={setParams}
					/>
					<Toggles
						params={params}
						setParams={setParams}
						dupeAmount={dupeAmount}
					/>
				</div>
				<div className="flex-col flex-auto xl:mt-0 mt-1.5 xl:ml-auto xl:mr-0 mr-auto w-fit xl:pt-3 pb-3 xl:justify-items-end justify-items-start">
					<Gallery
						params={params}
						setParams={setParams}
						galleries={extensionManager
							.getGalleries()
							.map((gallery) => {
								return gallery.name;
							})}
					/>
					<Author
						params={params}
						setParams={setParams}
						authors={extensionManager.getAuthors()}
					/>
				</div>
			</div>
		</div>
	);
}

function Query({
	params,
	setParams,
}: {
	params: SearchParams;
	setParams: React.Dispatch<SearchParams>;
}) {
	return (
		<div className="inline-block h-full align-middle">
			<Input
				value={params.query}
				autoComplete="off"
				onChange={(e) =>
					setParams({ ...params, query: e.target.value })
				}
				placeholder="Search"
			/>
		</div>
	);
}

function Toggles({
	params,
	setParams,
	dupeAmount,
}: {
	params: SearchParams;
	setParams: React.Dispatch<SearchParams>;
	dupeAmount: number;
}) {
	const value: string[] = [];
	if (params.includeDescription) value.push('includeDescription');
	if (params.showDupes) value.push('showDupes');

	return (
		<div className="inline-block ml-1 h-full align-middle">
			<ToggleGroup
				type="multiple"
				variant="outline"
				value={value}
				onValueChange={(value) => {
					setParams({
						...params,
						includeDescription:
							value.includes('includeDescription'),
						showDupes: value.includes('showDupes'),
					});
				}}
			>
				<ToggleGroupItem
					value="includeDescription"
					aria-label="Toggle include description"
				>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								<AlignLeft className="h-4 w-4" />
							</TooltipTrigger>
							<TooltipContent>
								{params.includeDescription
									? 'Click to exclude descriptions in the search'
									: 'Click to include descriptions in the search'}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</ToggleGroupItem>
				<ToggleGroupItem
					value="showDupes"
					aria-label="Toggle show dupes"
				>
					<TooltipProvider>
						<Tooltip>
							<TooltipTrigger>
								{params.showDupes ? (
									<BookCopy className="h-4 w-4" />
								) : (
									<BookDashed className="h-4 w-4" />
								)}
							</TooltipTrigger>
							<TooltipContent>
								{params.showDupes
									? `Click to exclude duplicate extensions (${dupeAmount} shown)`
									: `Click to include duplicate extensions (${dupeAmount} hidden)`}
							</TooltipContent>
						</Tooltip>
					</TooltipProvider>
				</ToggleGroupItem>
			</ToggleGroup>
		</div>
	);
}

function Author({
	params,
	setParams,
	authors,
}: {
	params: SearchParams;
	setParams: React.Dispatch<SearchParams>;
	authors: string[];
}) {
	const [open, setOpen] = React.useState(false);
	const [authorName, setAuthorName] = React.useState('');

	useEffect(() => {
		setParams({ ...params, author: authorName });
	}, [authorName]);

	return (
		<div className="inline-block ml-3 h-full align-middle">
			<Popover
				open={open}
				onOpenChange={setOpen}
			>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="w-[200px] justify-between"
					>
						{authorName ? authorName : 'All authors'}
						<ChevronsUpDown className="opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[200px] p-0">
					<Command>
						<CommandInput
							placeholder="Search author..."
							className="h-9"
						/>
						<CommandList>
							<CommandEmpty>No author found.</CommandEmpty>
							<CommandGroup>
								{authors.map((author) => (
									<CommandItem
										key={author}
										value={author}
										onSelect={(currentValue: string) => {
											setAuthorName(
												currentValue === authorName
													? ''
													: currentValue
											);
											setOpen(false);
										}}
									>
										{author}
										<Check
											className={cn(
												'ml-auto',
												authorName === author
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
	);
}

function Gallery({
	params,
	setParams,
	galleries,
}: {
	params: SearchParams;
	setParams: React.Dispatch<SearchParams>;
	galleries: string[];
}) {
	const [open, setOpen] = React.useState(false);
	const [galleryName, setGalleryName] = React.useState('');

	useEffect(() => {
		setParams({ ...params, gallery: galleryName });
	}, [galleryName]);

	return (
		<div className="inline-block h-full align-middle">
			<Popover
				open={open}
				onOpenChange={setOpen}
			>
				<PopoverTrigger asChild>
					<Button
						variant="outline"
						role="combobox"
						aria-expanded={open}
						className="w-[300px] justify-between"
					>
						{galleryName ? galleryName : 'All galleries'}
						<ChevronsUpDown className="opacity-50" />
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-[300px] p-0">
					<Command>
						<CommandInput
							placeholder="Search galleries..."
							className="h-9"
						/>
						<CommandList>
							<CommandEmpty>No gallery found.</CommandEmpty>
							<CommandGroup>
								{galleries.map((gallery) => (
									<CommandItem
										key={gallery}
										value={gallery}
										onSelect={(currentValue: string) => {
											setGalleryName(
												currentValue === galleryName
													? ''
													: currentValue
											);
											setOpen(false);
										}}
									>
										{gallery}
										<Check
											className={cn(
												'ml-auto',
												galleryName === gallery
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
	);
}

function matchesSearch(extension: Extension, searchParams: SearchParams) {
	if (!searchParams.showDupes && extension.dupe) return false;

	searchParams.query = searchParams.query.toLowerCase();
	searchParams.author = searchParams.author.toLowerCase();

	const authors: string[] = extension.credits.map((credit) => {
		return credit.name.toLowerCase();
	});

	const name = extension.name.toLowerCase();
	const description = extension.description.toLowerCase();

	if (
		searchParams.query == '' &&
		searchParams.author == '' &&
		searchParams.gallery == ''
	)
		return true;
	if (searchParams.author != '') {
		let end = true;

		authors.forEach((author) => {
			if (author == searchParams.author) end = false;
		});

		if (end) return false;
	}
	if (
		searchParams.gallery != '' &&
		searchParams.gallery != extension.gallery
	) {
		return false;
	}
	if (
		name.includes(searchParams.query) ||
		(searchParams.includeDescription &&
			description.includes(searchParams.query))
	)
		return true;

	return false;
}
