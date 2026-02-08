import {
  ExtensionGallery,
  type GalleryJSON_Extension,
  type GalleryJSON_Gallery,
  type GalleryModification_AddSupportedMod,
  type GalleryModification_MarkExtensionAsDupe,
  type GalleryModification_RemoveExtension,
  type RemoteDownloads,
  type RemoteGalleryData,
} from '../extension-gallery.js';
import { BuildHelper } from '../helper.js';
import path from 'path';
import chalk from 'chalk';

export type GalleryModification =
  | GalleryModification_MarkExtensionAsDupe
  | GalleryModification_RemoveExtension
  | GalleryModification_AddSupportedMod;

export class LemonExtensionGallery extends ExtensionGallery<
  RemoteGalleryData,
  GalleryModification
> {
  private extensions: LemonExtension[] = [];
  private readonly icon?: string;

  public constructor(
    data: RemoteGalleryData,
    modifications: GalleryModification[],
  ) {
    super(data, modifications, 'lemon');
    this.icon = data.iconExtension
      ? data.iconExtension
      : data.iconUrl?.substring(data.iconUrl.lastIndexOf('.') + 1);
  }

  public isRemote(): boolean {
    return true;
  }

  public extensionCount(): number {
    return this.extensions.length;
  }

  public async refresh(logger: (message: string) => void): Promise<void> {
    const extensions = JSON.parse(
      await (await fetch(`${this.data.sourceLocation}extensions.json`)).text(),
    ) as LemonExtensionMetadata[];
    if (!Array.isArray(extensions))
      throw `Failed to load gallery data. Expected an array, but found an object.`;

    const removedExtensions =
      this.getModifications<GalleryModification_RemoveExtension>('remove').map(
        (v) => v.extensionId,
      );

    for (const metadata of extensions) {
      if (typeof metadata != 'object' || Array.isArray(metadata))
        throw `Failed to load extension data. Expected extension to be an object.\nFound: ${metadata}`;

      const id = metadata.url
        .substring(0, metadata.url.lastIndexOf('.'))
        .replace('extensions/', '')
        .replaceAll(' ', '_');

      if (removedExtensions.includes(id)) continue;

      const extension = new LemonExtension(this, metadata, id);
      this.extensions.push(extension);
    }

    logger(`found ${this.extensionCount()} extension(s)`);
  }

  public async downloadRemote(downloads: RemoteDownloads): Promise<void> {
    if (this.data.iconUrl)
      downloads.addDownloadTask(this.data.iconUrl, async (response) => {
        const imgContent = await response.blob();
        await BuildHelper.write(
          path.resolve(
            BuildHelper.galleryDirectory,
            `galleries/${this.galleryId}.${this.icon}`,
          ),
          await imgContent.bytes(),
          'utf-8',
        );
      });
    for (const extension of this.extensions) {
      await extension.fetchExtension(
        downloads.addDownloadSubTask(extension.id()),
      );
    }
  }

  public async validateAssets(
    logger: (message: string) => void,
  ): Promise<void> {
    if (this.data.iconUrl) {
      const iconFile = path.resolve(
        BuildHelper.galleryDirectory,
        `galleries/${this.galleryId}.${this.icon}`,
      );
      if (!(await BuildHelper.exists(iconFile)))
        throw `Failed to find gallery icon! Expected the file '${iconFile}' to exist.`;
    }
    for (const extension of this.extensions) {
      await extension.validateAssets(logger);
    }
  }

  public generateJson(): GalleryJSON_Gallery {
    return {
      id: this.galleryId,
      name: this.galleryName,
      iconExtension: this.icon,
      smallIcon: this.data.smallIcon,
      extensions: this.processCommonModifications(
        this.extensions.map((extension) => extension.generateJson()),
      ),
      viewLocation: this.data.viewLocation,
    };
  }

  public async copyFiles(): Promise<void> {}
}

type Creator = {
  name: string;
  url: string;
};

type LemonExtensionMetadata = {
  title: string;
  img: string | null;
  description: string;
  url: string;
  docsURL: string;
  sandboxed: boolean;
  creator: Creator[];
};

class LemonExtension {
  protected bannerExtension?: string;

  public constructor(
    protected readonly gallery: LemonExtensionGallery,
    protected readonly metadata: LemonExtensionMetadata,
    protected readonly extensionId: string,
  ) {}

  public id(): string {
    return this.extensionId;
  }

  public async fetchExtension(downloads: RemoteDownloads): Promise<void> {
    downloads.addDownloadTask(
      `${this.gallery.data.sourceLocation}${this.metadata.url}`,
      async (response) => {
        if (response.status != 200)
          throw `Failed to fetch code for '${this.extensionId}'. Tried to fetch '${this.gallery.data.sourceLocation}${this.metadata.url}'`;

        await BuildHelper.write(
          path.resolve(
            BuildHelper.galleryDirectory,
            'extensions/code',
            this.gallery.id(),
            this.extensionId + '.js',
          ),
          await response.text(),
          'utf-8',
        );
      },
    );

    if (!this.metadata.img) return;

    this.bannerExtension = this.metadata.img.substring(
      0,
      this.metadata.img.lastIndexOf('.'),
    );

    downloads.addDownloadTask(
      `${this.gallery.data.sourceLocation}${this.metadata.img}`,
      async (response) => {
        if (response.status != 200)
          throw `Failed to fetch banner for '${this.extensionId}'. Tried to fetch '${this.gallery.data.sourceLocation}${this.metadata.img}'`;
        const imgContent: Blob = await response.blob();
        await BuildHelper.write(
          path.resolve(
            BuildHelper.galleryDirectory,
            'extensions/banner',
            this.gallery.id(),
            `${this.extensionId}.${this.bannerExtension}`,
          ),
          await imgContent.bytes(),
          'utf-8',
        );
      },
    );
  }

  public async validateAssets(
    logger: (message: string) => void,
  ): Promise<void> {
    const codeFile = path.resolve(
      BuildHelper.galleryDirectory,
      'extensions/code',
      this.gallery.id(),
      this.extensionId + '.js',
    );
    if (!(await BuildHelper.exists(codeFile)))
      throw `Failed to find extension code! Expected the file '${codeFile}' to exist.`;
    if (!this.bannerExtension) {
      logger(chalk.yellow(`missing banner for ${this.extensionId}`));
    } else {
      const bannerFile = path.resolve(
        BuildHelper.galleryDirectory,
        'extensions/banner',
        this.gallery.id(),
        `${this.extensionId}.${this.bannerExtension}`,
      );
      if (!(await BuildHelper.exists(bannerFile)))
        throw `Failed to find extension banner! Expected the file '${bannerFile}' to exist.`;
    }
  }

  public generateJson(): GalleryJSON_Extension {
    return {
      id: this.extensionId,
      name: this.metadata.title,
      description: this.metadata.description,
      authors: this.metadata.creator.map((creator) => {
        return {
          name: creator.name,
          link: creator.url,
        };
      }),
      originalAuthors: [],
      badges: [],
      supports: [],
      maySupport: [],
      duplicate: false,
      bannerExtension: this.bannerExtension,
    };
  }
}
