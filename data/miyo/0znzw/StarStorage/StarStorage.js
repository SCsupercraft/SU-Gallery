/**!
 * StarStorage
 * @author 0znzw <meow@miyo.lol> (@link https://scratch.mit.edu/users/0znzw/)
 * @version 1.1
 * @license MIT AND LGPL-3.0
 * Do not remove this comment
 */
(function(Scratch) {
  'use strict';

  if (!Scratch.extensions.unsandboxed) {
    throw new Error(`"* Storage" must run unsandboxed.`);
  }

  const extId = '0znzwStarStorage';
  const { BlockType, ArgumentType, Cast, vm } = Scratch, { runtime } = vm;
  runtime.extensionStorage ??= {};
  runtime.extensionStorage[extId] ??= {};
  runtime.extensionStorage[extId].key ??= (Math.floor(Math.random() * 10000) + Date.now()).toString(36);
  let key = runtime.extensionStorage[extId].key;

  function setCookie(e,t,n){const o=new Date;o.setTime(o.getTime()+24*n*60*60*1e3);let i="expires="+o.toUTCString();document.cookie=e+"="+t+";"+i+";path=/"}
  function getCookie(e){let t=e+"=",n=decodeURIComponent(document.cookie).split(";");for(let e=0;e<n.length;e++){let o=n[e];for(;" "==o.charAt(0);)o=o.substring(1);if(0==o.indexOf(t))return o.substring(t.length,o.length)}return""}

  const idb = new (class IndexedDBsimple {
    // Thanks to Mistium (https://mistium.com/) for making the original extension code.
    // Code copied from PawedLoader.
    // MIT License | https://github.com/PawedLoader/PawedLoader/blob/main/src/classes/IndexedDBSimple.js
    // No License | https://web.archive.org/web/20240503173045/https://raw.githubusercontent.com/Mistium/extensions.mistium/main/featured/IndexedDB.js
    constructor() {
      this.dbName = key;
      this.dbVersion = 1;
      this.db;
    }
    setDBName(NAME) {
      this.dbName = NAME;
      this.initializeDatabase();
    }
    initializeDatabase() {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onerror = function(event) {
        console.error('IndexedDB error:', event.target.error);
      };
      request.onsuccess = (event) => {
        this.db = event.target.result;
      };
      request.onupgradeneeded = (event) => {
        this.db = event.target.result;
        const objectStore = this.db.createObjectStore('data', {
          keyPath: 'key'
        });
      };
    }
    writeToDatabase(KEY, VALUE) {
      const transaction = this.db.transaction(['data'], 'readwrite');
      const objectStore = transaction.objectStore('data');
      objectStore.put({
        key: KEY,
        value: VALUE
      });
    }
    async readFromDatabase(KEY) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['data'], 'readonly');
        const objectStore = transaction.objectStore('data');
        const request = objectStore.get(KEY);
        request.onsuccess = function(event) {
          resolve(event.target.result ? event.target.result.value : null);
        };
        request.onerror = function(event) {
          reject('Error reading from database');
        };
      });
    };
    async getAllKeys() {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(['data'], 'readonly');
        const objectStore = transaction.objectStore('data');
        const request = objectStore.getAllKeys();
        request.onsuccess = function(event) {
          const keysArray = event.target.result;
          const keysJSON = JSON.stringify(keysArray);
          resolve(keysJSON);
        };
        request.onerror = function(event) {
          reject('Error getting keys from database');
        };
      });
    }
    async keyExists(KEY) {
      const keys = await this.getAllKeys();
      return keys.includes(KEY);
    }
    deleteFromDatabase(KEY) {
      const transaction = this.db.transaction(['data'], 'readwrite');
      const objectStore = transaction.objectStore('data');
      objectStore.delete(KEY);
    }
  });
  idb.setDBName(key);

  class extension {
    getInfo() {
      return {
        id: extId,
        name: '* Storage',
        blocks: [{
          blockType: BlockType.COMMAND,
          opcode: 'setStorageKey',
          text: 'use storage [KEY]',
          arguments: {
            KEY: { type: ArgumentType.STRING, defaultValue: key },
          },
        }, {
          blockType: BlockType.BOOLEAN,
          opcode: 'hasKey',
          text: '[KEY] exists in [TYPE]?',
          arguments: {
            KEY: { type: ArgumentType.STRING, defaultValue: 'foo' },
            TYPE: { type: ArgumentType.STRING, menu: 'TYPES', defaultValue: 'localStorage' },
          },
        }, {
          blockType: BlockType.REPORTER,
          opcode: 'getKey',
          text: 'get [KEY] from [TYPE]',
          arguments: {
            KEY: { type: ArgumentType.STRING, defaultValue: 'foo' },
            TYPE: { type: ArgumentType.STRING, menu: 'TYPES', defaultValue: 'localStorage' },
          },
          allowDropAnywhere: true,
        }, {
          blockType: BlockType.COMMAND,
          opcode: 'setKey',
          text: 'set [KEY] in [TYPE] to [VALUE]',
          arguments: {
            KEY: { type: ArgumentType.STRING, defaultValue: 'foo' },
            VALUE: { type: ArgumentType.STRING, defaultValue: 'bar' },
            TYPE: { type: ArgumentType.STRING, menu: 'TYPES', defaultValue: 'localStorage' },
          },
        }, {
          blockType: BlockType.COMMAND,
          opcode: 'deleteKey',
          text: 'delete [KEY] from [TYPE]',
          arguments: {
            KEY: { type: ArgumentType.STRING, defaultValue: 'foo' },
            TYPE: { type: ArgumentType.STRING, menu: 'TYPES', defaultValue: 'localStorage' },
          },
        }],
        menus: {
          TYPES: { items: ['localStorage', 'sessionStorage', 'cookies', 'indexedDB'], acceptReporters: true },
        },
      };
    }
    setStorageKey({ KEY }) {
      KEY = `${Cast.toString(KEY)}`;
      runtime.extensionStorage[extId].key = KEY;
      idb.setDBName(KEY);
      key = KEY;
    }
    setKey({ KEY, TYPE, VALUE }) {
      KEY = `${key}${Cast.toString(KEY)}`;
      VALUE = Cast.toString(VALUE);
      TYPE = Cast.toString(TYPE).toLowerCase();
      switch(TYPE) {
        case 'sessionstorage': return sessionStorage.setItem(KEY, VALUE);
        case 'cookies': return setCookie(KEY, VALUE, 365);
        case 'indexeddb': return idb.writeToDatabase(KEY, VALUE);
        default:
        case 'localstorage': return localStorage.setItem(KEY, VALUE);
      }
    }
    getKey({ KEY, TYPE }) {
      KEY = `${key}${Cast.toString(KEY)}`;
      TYPE = Cast.toString(TYPE).toLowerCase();
      switch(TYPE) {
        case 'sessionstorage': return sessionStorage.getItem(KEY) ?? '';
        case 'cookies': return getCookie(KEY) ?? '';
        case 'indexeddb': return idb.readFromDatabase(KEY) ?? '';
        default:
        case 'localstorage': return localStorage.getItem(KEY) ?? '';
      }
    }
    hasKey({ KEY, TYPE }) {
      KEY = `${key}${Cast.toString(KEY)}`;
      TYPE = Cast.toString(TYPE).toLowerCase();
      switch(TYPE) {
        case 'sessionstorage': return sessionStorage.getItem(KEY) !== null;
        case 'cookies': return getCookie(KEY) !== '';
        case 'indexeddb': return idb.keyExists(KEY);
        default:
        case 'localstorage': return localStorage.getItem(KEY) !== null;
      }
    }
    deleteKey({ KEY, TYPE }) {
      KEY = `${key}${Cast.toString(KEY)}`;
      TYPE = Cast.toString(TYPE).toLowerCase();
      switch(TYPE) {
        case 'sessionstorage': return sessionStorage.removeItem(KEY);
        case 'cookies': return setCookie(KEY, '', 365);
        case 'indexeddb': return idb.deleteFromDatabase(KEY);
        default:
        case 'localstorage': return localStorage.removeItem(KEY);
      }
    }
    deserialize(data) {
      runtime.extensionStorage[extId] = data[extId];
    }
    serialize() {
      return { extId: runtime.extensionStorage[extId] };
    }
  }
  Scratch.extensions.register(runtime[`ext_${extId}`] = new extension());
})(Scratch);