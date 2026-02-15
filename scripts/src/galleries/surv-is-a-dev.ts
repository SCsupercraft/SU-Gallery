import {
  ExtensionGallery,
  type GalleryJSON_Extension,
  type GalleryJSON_Extension_Badge,
  type GalleryJSON_Gallery,
  type GalleryModification_AddSupportedMod,
  type GalleryModification_MarkExtensionAsDupe,
  type GalleryModification_RemoveExtension,
  type RemoteDownloads,
  type RemoteGalleryData,
} from '../extension-gallery.js';
import JSON5 from 'json5';
import { BuildHelper } from '../helper.js';
import path from 'path';
import chalk from 'chalk';

export type GalleryModification =
  | GalleryModification_MarkExtensionAsDupe
  | GalleryModification_RemoveExtension
  | GalleryModification_AddSupportedMod;

export class SurvExtensionGallery extends ExtensionGallery<
  RemoteGalleryData,
  GalleryModification
> {
  private extensions: SurvExtension[] = [];
  private readonly icon?: string;

  public constructor(
    data: RemoteGalleryData,
    modifications: GalleryModification[],
  ) {
    super(data, modifications, 'surv-is-a-dev');
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
    const extensions = JSON5.parse(
      await (
        await fetch(
          `${this.data.sourceLocation}site-files/extensions/index.json5`,
        )
      ).text(),
    ) as Set<Metadata>;
    if (!(extensions instanceof Set))
      throw `Failed to load gallery data. Expected an set.`;

    const removedExtensions =
      this.getModifications<GalleryModification_RemoveExtension>('remove').map(
        (v) => v.extensionId,
      );

    for (const metadata of extensions) {
      if (typeof metadata != 'object')
        throw `Failed to load extension data. Expected extension to be a object.\nFound: ${metadata}`;
      if (removedExtensions.includes(metadata.id)) continue;

      const extension = new SurvExtension(this, metadata.id, metadata);
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

type Credit = {
  name: string;
  url: string;
};

type Metadata = {
  img?: string;
  id: string;
  name: string;
  description: string;
  search_tags?: Set<string>;
  requirements?: Set<string>;
  mode: Set<string>;
  credits: Set<Credit>;
  mod?: string | string[] | Set<string>;
};

const MetadataMods: { [key: string]: string } = {
  turbowarp: 'tw',
  penguinmod: 'pm',
  electramod: 'em',
};

class SurvExtension {
  protected bannerExtension?: string;

  public constructor(
    protected readonly gallery: SurvExtensionGallery,
    protected readonly extensionId: string,
    protected readonly metadata: Metadata,
  ) {}

  public id(): string {
    return this.extensionId;
  }

  public async fetchExtension(downloads: RemoteDownloads): Promise<void> {
    downloads.addDownloadTask(
      `${this.gallery.data.sourceLocation}site-files/extensions/${this.metadata.id}.js`,
      async (response) => {
        if (response.status != 200)
          throw `Failed to fetch code for '${this.extensionId}'. Tried to fetch '${this.gallery.data.sourceLocation}site-files/extensions/${this.metadata.id}.js'`;

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

    if (this.metadata.img) {
      this.bannerExtension = this.metadata.img.substring(
        this.metadata.img.lastIndexOf('.') + 1,
        this.metadata.img.length,
      );

      downloads.addDownloadTask(
        `${this.gallery.data.sourceLocation}site-files/images/${this.metadata.img}`,
        async (response) => {
          if (response.status != 200)
            throw `Failed to fetch banner for '${this.extensionId}'. Tried to fetch '${this.gallery.data.sourceLocation}site-files/images/${this.metadata.img}'`;
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
    const supports: string[] = [];
    if (this.metadata.mod) {
      if (this.metadata.mod instanceof Set) {
        supports.push(
          ...(this.metadata.mod
            .values()
            .toArray()
            .map((mod) => MetadataMods[mod.toLowerCase()])
            .filter((v) => v !== undefined) as string[]),
        );
      }
    } else supports.push('tw');

    const badges: GalleryJSON_Extension_Badge[] = [];

    if (this.metadata.search_tags) {
      this.metadata.search_tags
        .values()
        .toArray()
        .forEach((val) => {
          switch (val) {
            case 'experimental':
              badges.push({
                name: 'Experimental',
                tooltip: 'This extension is experimental, use with caution.',
              });
              break;
            case 'advanced':
              badges.push({
                name: 'Advanced',
              });
              break;
          }
        });
    }

    if (this.metadata.requirements) {
      this.metadata.requirements
        .values()
        .toArray()
        .forEach((val) => {
          switch (val) {
            case 'internet':
              badges.push({
                name: 'Internet',
                tooltip: 'This extension requires access to the internet.',
              });
              break;
            case 'hardware':
              badges.push({
                name: 'Hardware',
                tooltip: 'This extension requires special hardware.',
              });
              break;
            case 'mobile':
              badges.push({
                name: 'Mobile',
                tooltip: 'This extension is for mobile devices.',
              });
              break;
          }
        });
    }

    return {
      id: this.extensionId,
      name: this.metadata.name,
      description: this.metadata.description,
      authors: this.metadata.credits
        .values()
        .toArray()
        .map((credit) => {
          return {
            name: credit.name,
            link: credit.url,
          };
        }),
      originalAuthors: [],
      badges,
      supports,
      maySupport: [],
      duplicate: false,
      bannerExtension: this.bannerExtension,
    };
  }
}
