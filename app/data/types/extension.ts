export type AuthorType = 'creator' | 'originalCreator';

export class AuthorTypeUtil {
	public static asString(type?: AuthorType): string {
		switch (type) {
			case 'creator':
				return 'Created by';
			case 'originalCreator':
				return 'Originally created by';
			default:
				return '';
		}
	}
}

export type ExtensionAuthor = {
	type?: AuthorType;
	name: string;
	link?: string;
};

export type ExtensionCredits = ExtensionAuthor[];

export type ExtensionBadge = {
	name: string;
	tooltip?: string;
};

export type Extension = {
	id: string;
	name: string;
	description: string;
	credits: ExtensionCredits;
	badges?: ExtensionBadge[];
	gallery: string;
	license?: string;
	banner?: string;
	featured?: boolean;
	dupe?: boolean;
};

export type ExtensionGallery = {
	id: string;
	name: string;
	icon?: string;
	smallIcon?: boolean;
	viewLocation?: string;
	extensions: Extension[];
};

export type ExtensionJson = {
	lastUpdated: number;
	data: ExtensionGallery[];
};
