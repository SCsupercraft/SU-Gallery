export abstract class ExtensionGallery<
	T extends GalleryData,
	M extends GalleryModification_Base,
> {
	public readonly galleryName: string;
	public readonly galleryId: string;

	protected constructor(
		public readonly data: T,
		protected readonly modifications: (
			| M
			| GalleryModification_RemoveExtension
			| GalleryModification_AddSupportedMod
		)[],
		public readonly typeName: string
	) {
		this.galleryName = data.name;
		this.galleryId = data.id;
	}

	public name(): string {
		return `${this.galleryName} (${this.typeName})`;
	}

	public id(): string {
		return this.galleryId;
	}

	public abstract isRemote(): boolean;

	public abstract extensionCount(): number;

	public abstract refresh(logger: (message: string) => void): Promise<void>;
	public abstract downloadRemote(downloads: RemoteDownloads): Promise<void>;

	public abstract validateAssets(
		logger: (message: string) => void
	): Promise<void>;

	public abstract generateJson(): GalleryJSON_Gallery;
	public abstract copyFiles(): Promise<void>;

	protected getModifications<
		A extends
			| M
			| GalleryModification_RemoveExtension
			| GalleryModification_AddSupportedMod,
	>(type: A['type']): A[] {
		const array = [];
		for (const modification of this.modifications) {
			if (modification.type == type) {
				array.push(modification as A);
			}
		}
		return array;
	}

	protected processAddSupportedMod(
		extensions: GalleryJSON_Extension[]
	): GalleryJSON_Extension[] {
		for (const modification of this.getModifications<GalleryModification_AddSupportedMod>(
			'addSupportedMod'
		)) {
			for (const extension of extensions) {
				if (modification.exclude) {
					const whitelist =
						modification.isWhitelist &&
						!modification.exclude.includes(extension.id);
					const blacklist =
						!modification.isWhitelist &&
						modification.exclude.includes(extension.id);
					if (whitelist || blacklist) continue;
				}

				if (modification.uncertain)
					extension.maySupport.push(modification.id);
				else extension.supports.push(modification.id);
			}
		}
		return extensions;
	}
}

export type GalleryModification_Base = {
	type: string;
};

export type GalleryModification_RemoveExtension = {
	type: 'remove';
	extensionId: string;
};

export type GalleryModification_AddSupportedMod = {
	type: 'addSupportedMod';
	id: string;
	uncertain?: boolean;
	exclude?: string[];
	isWhitelist?: boolean;
};

export type SupportedMod = {
	id: string;
	name: string;
	link: string;
	iconUrl: string;
	iconExtension?: string;
	smallIcon: boolean;
};

export type GalleryData = {
	id: string;
	name: string;
	smallIcon: boolean;
};

export type RemoteGalleryData = {
	sourceLocation: string;
	viewLocation: string;
	iconUrl?: string;
	iconExtension?: string;
} & GalleryData;

export interface RemoteDownloads {
	addDownloadTask: (
		url: string,
		onResponse: (response: Response) => Promise<void>
	) => void;
	addDownloadSubTask: (name: string) => RemoteDownloads;
}

export class RemoteDownloadTaskCollection implements RemoteDownloads {
	private tasks: (RemoteDownloadTask | RemoteDownloadTaskCollection)[] = [];

	public constructor(public readonly name?: string) {}

	public async start(titleSetter: (title: string) => void) {
		for (const task of this.tasks) {
			if (task instanceof RemoteDownloadTaskCollection) {
				await task.start(titleSetter);
				continue;
			}

			titleSetter(this.name ? `${this.name} - ${task.url}` : task.url);
			await task.onResponse(await fetch(task.url));
		}
	}

	public addDownloadTask(
		url: string,
		onResponse: (response: Response) => Promise<void>
	): void {
		this.tasks.push({
			url,
			onResponse,
		});
	}

	public addDownloadSubTask(name: string): RemoteDownloads {
		const collection = new RemoteDownloadTaskCollection(
			this.name ? `${this.name}/${name}` : name
		);
		this.tasks.push(collection);
		return collection;
	}
}

type RemoteDownloadTask = {
	url: string;
	onResponse: (response: Response) => Promise<void>;
};

export type GalleryJSON = {
	lastUpdated: number;
	supportedMods: GalleryJSON_SupportedMod[];
	featured: [
		GalleryJSON_ExtensionLocation,
		GalleryJSON_ExtensionLocation,
		GalleryJSON_ExtensionLocation,
		GalleryJSON_ExtensionLocation,
	];
	galleries: GalleryJSON_Gallery[];
};

export type GalleryJSON_SupportedMod = {
	id: string;
	name: string;
	link: string;
	iconExtension: string;
	smallIcon: boolean;
};

export type GalleryJSON_ExtensionLocation = {
	galleryId: string;
	extensionId: string;
};

export type GalleryJSON_Gallery = {
	id: string;
	name: string;
	iconExtension?: string;
	smallIcon: boolean;
	extensions: GalleryJSON_Extension[];
	viewLocation?: string;
};

export type GalleryJSON_Extension = {
	id: string;
	name: string;
	description: string;
	authors: GalleryJSON_Extension_Author[];
	originalAuthors: GalleryJSON_Extension_Author[];
	badges: GalleryJSON_Extension_Badge[];
	supports: string[];
	maySupport: string[];
	duplicate: boolean;
	versions?: GalleryJSON_Version[];
	license?: string;
	bannerExtension?: string;
};

export type GalleryJSON_Version = {
	name: string;
	foldername: string;
};

export type GalleryJSON_Extension_Author = {
	name: string;
	link?: string;
};

export type GalleryJSON_Extension_Badge = {
	name: string;
	tooltip?: string;
	link?: string;
};

export type AuthorAlias = {
	alias: string[];
} & GalleryJSON_Extension_Author;
