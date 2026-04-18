import * as _fs from 'node:fs/promises';
import * as _fsSync from 'node:fs';
import path from 'node:path';
import type Stream from 'node:stream';
import type { Abortable } from 'node:events';

export const fs = {
  async readFile(
    filepath: string,
    options:
      | ({
          encoding: BufferEncoding;
          flag?: _fsSync.OpenMode | undefined;
        } & Abortable)
      | BufferEncoding,
  ) {
    return await _fs.readFile(filepath, options);
  },
  async readFileBuf(
    filepath: string,
    options?:
      | ({
          encoding?: null | undefined;
          flag?: _fsSync.OpenMode | undefined;
        } & Abortable)
      | null,
  ) {
    return await _fs.readFile(filepath, options);
  },
  async readDir(filepath: string) {
    return await _fs.readdir(filepath, 'utf-8');
  },
  async write(
    filepath: string,
    data:
      | string
      | NodeJS.ArrayBufferView
      | Iterable<string | NodeJS.ArrayBufferView>
      | AsyncIterable<string | NodeJS.ArrayBufferView>
      | Stream,
    options?:
      | (_fsSync.ObjectEncodingOptions & {
          mode?: _fsSync.Mode | undefined;
          flag?: _fsSync.OpenMode | undefined;
          flush?: boolean | undefined;
        } & Abortable)
      | BufferEncoding
      | null,
  ) {
    await _fs.mkdir(path.dirname(filepath), {
      recursive: true,
    });
    _fsSync.closeSync(_fsSync.openSync(filepath, 'w'));
    await _fs.writeFile(filepath, data, options);
  },
  async copy(src: string, dest: string) {
    await _fs.mkdir(path.dirname(dest), {
      recursive: true,
    });
    _fsSync.closeSync(_fsSync.openSync(dest, 'w'));
    await _fs.copyFile(src, dest);
  },
  async cleanDir(path: string): Promise<void> {
    if (await fs.exists(path)) {
      await _fs.rm(path, {
        force: true,
        recursive: true,
        maxRetries: 3,
        retryDelay: 500,
      });
    }
  },
  async exists(path: string): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      await _fs
        .stat(path)
        .then(async (stat) => {
          resolve(true);
        })
        .catch(async (e) => {
          if (e.code === 'ENOENT') {
            resolve(false);
          } else {
            reject(e);
          }
        });
    });
  },
};
