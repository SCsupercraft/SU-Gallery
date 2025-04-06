import { extensionTypes, galleryTypes } from './extension-data.mjs';
import {
	LocalExtensionData,
	LocalExtensionGalleryData,
} from './local-extension-data.mjs';
import {
	TurbowarpExtensionData,
	TurbowarpExtensionGalleryData,
} from './turbowarp-extension-data.mjs';
import {
	PenguinmodExtensionData,
	PenguinmodExtensionGalleryData,
} from './penguinmod-extension-data.mjs';
import {
	RubyExtensionData,
	RubyExtensionGalleryData,
} from './ruby-extension-data.mjs';

extensionTypes['local'] = LocalExtensionData;
extensionTypes['turbowarp'] = TurbowarpExtensionData;
extensionTypes['penguinmod'] = PenguinmodExtensionData;
extensionTypes['ruby'] = RubyExtensionData;

galleryTypes['local'] = LocalExtensionGalleryData;
galleryTypes['turbowarp'] = TurbowarpExtensionGalleryData;
galleryTypes['penguinmod'] = PenguinmodExtensionGalleryData;
galleryTypes['ruby'] = RubyExtensionGalleryData;
