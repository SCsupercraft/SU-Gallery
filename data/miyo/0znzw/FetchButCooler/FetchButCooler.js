/**!
 * Fetch
 * @author 0znzw <meow@miyo.lol> (@link https://scratch.mit.edu/users/0znzw/)
 * @version 1.0
 * @license MIT AND LGPL-3.0
 * Do not remove this comment
 */
(function(Scratch) {
  if (!Scratch.extensions.unsandboxed) {
    throw new Error(`"Fetch" must be ran unsandboxed.`);
  }
  const { Cast, BlockType, ArgumentType, vm } = Scratch, { runtime } = vm;
  const zor = (x, y) => (x < 0 ? y : (x === 0 ? x : (x || y)));
  const Cast_toJSON = function(obj) {
    const isArray = Array.isArray(obj), isObject = typeof obj === 'object';
    if (Scratch.extensions.isNitrobolt || Scratch.extensions.isUSB) return isArray ? Cast.toArray(obj) : Cast.toObject(obj);
    return isObject ? JSON.stringify(obj) : '';
  };
  const validURL = (url) => {
    try {
      return new URL(url);
    } catch {
      return false;
    }
  };
  const alphaChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const uid = function (len, soup) {
    const soup_ = soup ?? ('!#%()*+,-./:;=?@[]^_`{|}~' + alphaChars);
    const length = len ?? 20;
    const soupLength = soup_.length;
    const id = [];
    for (let i = 0; i < length; i++) {
      id[i] = soup_.charAt(Math.random() * soupLength);
    }
    return id.join('');
  };
  const runHats = (opcode) => {
    // https://github.com/surv-is-a-dev/gallery/blob/main/site-files/extensions/0znzw/tests/hidden/runHats.js
    const threads = [];
    for (const target of runtime.targets) {
      Object.values(target.blocks._blocks).filter(block => block.opcode === opcode).forEach(block => {
        threads.push(runtime._pushThread(block.id, target, { stackClick: true }));
      });
    }
    return threads;
  };
  const Base64 = (function() {
    const window = {};
    // https://github.com/beatgammit/base64-js (MIT)
    (function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;b="undefined"==typeof window?"undefined"==typeof global?"undefined"==typeof self?this:self:global:window,b.base64js=a()}})(function(){return function(){function b(d,e,g){function a(j,i){if(!e[j]){if(!d[j]){var f="function"==typeof require&&require;if(!i&&f)return f(j,!0);if(h)return h(j,!0);var c=new Error("Cannot find module '"+j+"'");throw c.code="MODULE_NOT_FOUND",c}var k=e[j]={exports:{}};d[j][0].call(k.exports,function(b){var c=d[j][1][b];return a(c||b)},k,k.exports,b,d,e,g)}return e[j].exports}for(var h="function"==typeof require&&require,c=0;c<g.length;c++)a(g[c]);return a}return b}()({"/":[function(a,b,c){'use strict';function d(a){var b=a.length;if(0<b%4)throw new Error("Invalid string. Length must be a multiple of 4");var c=a.indexOf("=");-1===c&&(c=b);var d=c===b?0:4-c%4;return[c,d]}function e(a,b,c){return 3*(b+c)/4-c}function f(a){var b,c,f=d(a),g=f[0],h=f[1],j=new m(e(a,g,h)),k=0,n=0<h?g-4:g;for(c=0;c<n;c+=4)b=l[a.charCodeAt(c)]<<18|l[a.charCodeAt(c+1)]<<12|l[a.charCodeAt(c+2)]<<6|l[a.charCodeAt(c+3)],j[k++]=255&b>>16,j[k++]=255&b>>8,j[k++]=255&b;return 2===h&&(b=l[a.charCodeAt(c)]<<2|l[a.charCodeAt(c+1)]>>4,j[k++]=255&b),1===h&&(b=l[a.charCodeAt(c)]<<10|l[a.charCodeAt(c+1)]<<4|l[a.charCodeAt(c+2)]>>2,j[k++]=255&b>>8,j[k++]=255&b),j}function g(a){return k[63&a>>18]+k[63&a>>12]+k[63&a>>6]+k[63&a]}function h(a,b,c){for(var d,e=[],f=b;f<c;f+=3)d=(16711680&a[f]<<16)+(65280&a[f+1]<<8)+(255&a[f+2]),e.push(g(d));return e.join("")}function j(a){for(var b,c=a.length,d=c%3,e=[],f=16383,g=0,j=c-d;g<j;g+=f)e.push(h(a,g,g+f>j?j:g+f));return 1===d?(b=a[c-1],e.push(k[b>>2]+k[63&b<<4]+"==")):2===d&&(b=(a[c-2]<<8)+a[c-1],e.push(k[b>>10]+k[63&b>>4]+k[63&b<<2]+"=")),e.join("")}c.byteLength=function(a){var b=d(a),c=b[0],e=b[1];return 3*(c+e)/4-e},c.toByteArray=f,c.fromByteArray=j;for(var k=[],l=[],m="undefined"==typeof Uint8Array?Array:Uint8Array,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",o=0,p=n.length;o<p;++o)k[o]=n[o],l[n.charCodeAt(o)]=o;l[45]=62,l[95]=63},{}]},{},[])("/")});
    return window.base64js;
  }).apply({});
  class Fetch {
    constructor(url, id, opts) {
      this.controller = new AbortController();
      this.url = url, this.id = id, this.opts = opts || {
        headers: {}, body: '', method: 'get', signal: this.controller.signal,
      };
      this.resetStatus();
    }
    static /* @private */ Fetch = fetch;
    static /* @private */ Decoder = new TextDecoder();
    static Reader = class FetchReader {
      constructor(reader, onUpdate) {
        /* @private */ this.onUpdate = onUpdate || (() => {});
        /* @private */ this.reader = reader;
        this.done = false;
        this.length = 0;
        this.value = [];
      }
      async readAll() {
        while (true) {
          const { value, done } = await this.reader.read();
          if (done) break;
          this.length += value.length;
          this.value.push(value);
          this.onUpdate(this);
        }
        this.onDone();
      }
      /* @private */ merge() {
        let offset = 0;
        const result = new Uint8Array(this.value.reduce((a, c) => a + c.length, 0));
        while(true) {
          const value = this.value.shift();
          if (!value) break;
          result.set(value, offset);
          offset += value.length;
        }
        this.value = [result];
      }
      /* @private */ onDone() {
        this.merge();
        this.done = true;
        this.onUpdate(this);
      }
    };
    static Response = class FetchResponse {
      constructor(fetchReader, original) {
        this.response = original;
        this.buffer = (fetchReader?.value || fetchReader)[0];
      }
      async uint8array() {
        return this.buffer;
      }
      async arrayBuffer() {
        return this.buffer.buffer;
      }
      async text() {
        return Fetch.Decoder.decode(this.buffer, { stream: true });
      }
      async json() {
        return await JSON.parse(await this.text());
      }
      async blob() {
        return new Blob([this.buffer], { type: 'application/octet-stream' });
      }
      async base64() {
        return Base64.fromByteArray(this.buffer);
      }
      async hex() {
        return (await Array.fromAsync(this.buffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
      }
      async binary() {
        return (await Array.fromAsync(this.buffer)).map((byte) => byte.toString(0).padStart(8, '0')).join('');
      }
    };
    static /* @private */ sleeping = new Map();
    static /* @public */ aliveList = new Set();
    static /* @public */ sharedList = Object.create(null);
    static sleep(id, callback) {
      if (Fetch.sleeping.get(id)) return '';
      Fetch.sleeping.set(id, callback);
    }
    static /* @private */ extractSize(headers) {
      headers = Object.fromEntries(headers);
      if (headers['content-length']) return Number(headers['content-length']);
      if (headers['content-range']) return Number(headers['content-range'].split('/')[1]);
      console.warn(headers, 'Does not conform to the HTTP 1.1 specification; and is missing both Content-Length and Content-Range.');
      return 0;
    }
    static /* @private */ done(fetchInstance) {
      runHats(`${extension.id}_whenAnyFetchDone`).forEach(hat => hat[extension.FETCH_INSTANCE_ID] = fetchInstance.id);
      runHats(`${extension.id}_whenFetchDone`).forEach(hat => hat[extension.FETCH_INSTANCE_ID] = fetchInstance.id);
      Fetch.aliveList.delete(fetchInstance.id);
      const callback = Fetch.sleeping.get(fetchInstance.id);
      if (!callback) return '';
      Fetch.sleeping.delete(fetchInstance.id);
      callback(fetchInstance);
    }
    /* @private */ resetStatus(ip) {
      this.sync = null, this.syncValue = null, this.canRead = false;
      this.isDone = false, this.inProgress = ip || false, this.size = 0;
    }
    /* @private */ done() {
      Fetch.done(this);
      this.sync = new Fetch.Response(this.syncValue, this.sync);
      this.size = this.sync.buffer.length;
      this.syncValue = null;
      this.inProgress = false;
      this.isDone = true;
    }
    /* @private */ streamUpdate(syncValue) {
      if (syncValue.done) this.done();
    }
    startReader() {
      if (this.inProgress || this.isDone) return Promise.resolve('');
      return new Promise((resolve, reject) => {
        this.resetStatus(true);
        this.sync = Fetch.Fetch(this.url, this.opts);
        this.sync.then(res => {
          this.size = Fetch.extractSize(res.headers || new Headers());
          this.sync = res;
          return res.body.getReader();
        }).then(reader => {
          this.canRead = true;
          resolve(this.syncValue = new Fetch.Reader(reader, this.streamUpdate.bind(this)));
        }).catch(err => reject(err));
      });
    }
    async start() {
      if (this.inProgress || this.isDone) return '';
      await this.startReader();
      return this.syncValue.readAll();
    }
    async startAsync() {
      if (!await this.start()) return '';
      return await new Promise(resolve => {
        Fetch.sleep(this.id, () => resolve(this));
      });
    }
    async tryRead() {
      if (this.isDone) return this.sync;
      if (!this.canRead) throw 'cannot read, either the fetch has not started or reading is off.';
      this.syncValue.merge();
      return new Fetch.Response(this.syncValue, this.sync);
    }
  }
  Fetch.Fetch = Scratch.fetch.bind(Scratch);
  const URLARG = { URL: { type: ArgumentType.STRING, defaultValue: 'https://extensions.turbowarp.org/hello.txt' } };
  const IDARG = { ID: { type: ArgumentType.STRING, defaultValue: 'my fetch' } };
  const RESARG = { RESTYPE: { type: ArgumentType.STRING, menu: 'RESTYPE', defaultValue: 'text' } };
  const METAARG = { META: { type: ArgumentType.STRING, menu: 'METAS', defaultValue: 'status' } };
  const HEADERSARG = {
    HEADERS: {
      type: ArgumentType.OBJECT || ArgumentType.STRING,
      defaultValue: '{}',
    },
    HEADER: {
      type: ArgumentType.STRING,
      defaultValue: '',
    },
    VALUE: {
      type: ArgumentType.STRING,
      defaultValue: '',
    },
  };
  const METHODARG = { METHOD: { type: ArgumentType.STRING, menu: 'METHOD', defaultValue: 'GET' } };
  const BODYARG = { BODY: { type: ArgumentType.STRING, defaultValue: '{"body":true,"hahaha":"yes"}' } };
  class extension {
    static exports = { Fetch, zor, uid, runHats, validURL, Cast_toJSON };
    static id = '0znzwFetch';
    constructor() {
      this.showArrayBuffer = false;
      runtime.on('PROJECT_STOP_ALL', this.clear);
      runtime.on('PROJECT_START', this.clear);
      this.clear();
    }
    /* @private */ clear() {
      this.deleteAllFetchs();
      Fetch.aliveList = new Set();
      Fetch.sharedList = Object.create(null);
      Fetch.sleeping = new Map();
    }
    static /* @private */ check = Symbol(`${extension.id}.CheckPass`);
    getInfo() {
      return {
        id: extension.id,
        name: 'Fetch',
        blocks: [{
          opcode: 'startAndFetch',
          blockType: BlockType.COMMAND,
          text: 'fetch [URL] id: [ID] and start',
          arguments: {
            ...URLARG,
            ...IDARG,
          },
        }, {
          opcode: 'doFetch',
          blockType: BlockType.COMMAND,
          text: 'fetch [URL] id: [ID]',
          arguments: {
            ...URLARG,
            ...IDARG,
          },
        }, {
          opcode: 'startFetch',
          blockType: BlockType.COMMAND,
          text: 'start fetch id: [ID] and wait [WAIT]',
          arguments: {
            ...IDARG,
            WAIT: { type: ArgumentType.BOOLEAN },
          },
        }, '---', {
          opcode: 'deleteAllFetchs',
          blockType: BlockType.COMMAND,
          text: 'delete all fetchs',
        }, {
          opcode: 'deleteFetch',
          blockType: BlockType.COMMAND,
          text: 'delete fetch id: [ID]',
          arguments: {
            ...IDARG,
          },
        }, {
          opcode: 'abortFetch',
          blockType: BlockType.COMMAND,
          text: 'abort fetch id: [ID]',
          arguments: {
            ...IDARG,
          },
        }, '---', {
          opcode: 'inlineFetch',
          blockType: BlockType.REPORTER,
          text: 'fetch [URL] as [RESTYPE]',
          arguments: {
            ...URLARG,
            ...RESARG,
          },
          allowDropAnywhere: true,
        }, '---', {
          opcode: 'whenAnyFetchDone',
          blockType: BlockType.EVENT,
          text: 'when any fetch finishes',
          isEdgeActivated: false,
        }, {
          opcode: 'whenFetchDone',
          blockType: BlockType.HAT,
          text: 'when fetch id: [ID] finishes',
          arguments: {
            ...IDARG,
          },
          isEdgeActivated: false,
        }, {
          opcode: 'currentFetch',
          blockType: BlockType.REPORTER,
          text: '(hat) current fetch',
          disableMonitor: true,
        }, '---', {
          opcode: 'fetchExists',
          blockType: BlockType.BOOLEAN,
          text: 'does fetch id: [ID] exist?',
          arguments: {
            ...IDARG,
          },
        }, {
          opcode: 'fetchDone',
          blockType: BlockType.BOOLEAN,
          text: 'is fetch id: [ID] done?',
          arguments: {
            ...IDARG,
          },
        }, {
          opcode: 'aliveFetchs',
          blockType: BlockType.REPORTER,
          text: 'running fetchs',
          allowDropAnywhere: true,
          disableMonitor: true,
        }, {
          opcode: 'activeFetchs',
          blockType: BlockType.REPORTER,
          text: 'all fetchs',
          allowDropAnywhere: true,
          disableMonitor: true,
        }, '---', {
          opcode: 'readFetchMeta',
          blockType: BlockType.REPORTER,
          text: 'get [META] from fetch id: [ID]',
          arguments: {
            ...IDARG,
            ...METAARG,
          },
          allowDropAnywhere: true,
        }, {
          opcode: 'readFetch',
          blockType: BlockType.REPORTER,
          text: 'read fetched data id: [ID] as [RESTYPE]',
          arguments: {
            ...IDARG,
            ...RESARG,
          },
          allowDropAnywhere: true,
        }, '---', {
          opcode: 'setBody',
          blockType: BlockType.COMMAND,
          text: 'set body of [ID] to [BODY]',
          arguments: {
            ...IDARG,
            ...BODYARG,
          },
        }, {
          opcode: 'setMethod',
          blockType: BlockType.COMMAND,
          text: 'set method of [ID] to [METHOD]',
          arguments: {
            ...IDARG,
            ...METHODARG,
          },
        }, {
          opcode: 'setHeaders',
          blockType: BlockType.COMMAND,
          text: 'set headers of [ID] to [HEADERS]',
          arguments: {
            ...IDARG,
            ...HEADERSARG,
          },
        }, {
          opcode: 'setHeader',
          blockType: BlockType.COMMAND,
          text: 'set header [HEADER] of [ID] to [VALUE]',
          arguments: {
            ...IDARG,
            ...HEADERSARG,
          },
        }],
        menus: {
          RESTYPE: {
            acceptReporters: true,
            items: '_resType',
          },
          METAS: {
            acceptReporters: true,
            items: '_metas',
          },
          METHOD: {
            acceptReporters: true,
            items: '_methods',
          },
        },
      };
    }
    static FETCH_INSTANCE_ID = `${extension.id}InstanceId`;
    /* @private */ _resType(resType, _) {
      const types = ['text', 'json', 'base64', 'hex', 'binary'];
      if (this.showArrayBuffer) types.push('arraybuffer');
      if ((_ || '') !== extension.check) return types;
      resType = Cast.toString(resType).toLowerCase();
      if (resType === 'arraybuffer') return 'arrayBuffer';
      return types.includes(resType) ? resType : 'text';
    }
    /* @private */ async _doRes(fetchInstance, resType) {
      resType = this._resType(resType, extension.check);
      if (resType === 'blob') return '';
      const res = new Promise(resolve => {
        (fetchInstance.sync[resType]()).catch(err => {
          console.warn('Failed fetch', fetchInstance, 'with error:', err);
          resolve('');
        }).then(res => resolve(res));
      });
      if (!res) return '';
      if (resType === 'json') return Cast_toJSON(res);
      return res;
    }
    /* @private */ _metas(meta, _) {
      const items = ['status', 'url', 'method', 'progress', 'final size', 'current size', 'json'];
      if ((_ || '') !== extension.check) return items;
      meta = Cast.toString(meta).toLowerCase();
      return zor(items.indexOf(meta), 0);
    }
    /* @private */ _methods(method, _) {
      const types = [
        'GET', 'POST', 'PATCH', 'DELETE', 'PUT',
        'HEAD', 'OPTIONS', 'TRACE', // 'CONNECT',
      ];
      if ((_ || '') !== extension.check) return types;
      method = Cast.toString(method).toUpperCase();
      return (types.includes(method) ? method : 'get').toLowerCase();
    }
    startAndFetch(args) {
      if (this.doFetch(args) || 0) return this.startFetch(args);
      return '';
    }
    doFetch({ URL, ID }) {
      ID = Cast.toString(ID);
      if (Fetch.sharedList[ID]) return '';
      URL = Cast.toString(URL);
      if (!validURL(URL)) return '';
      Fetch.sharedList[ID] = new Fetch(URL, ID, {});
      return true;
    }
    startFetch({ ID, WAIT }) {
      if (!(ID = Fetch.sharedList[Cast.toString(ID)])) return '';
      return ((ID = ID.start(), Cast.toBoolean(WAIT))) ? ID : '';
    }
    deleteAllFetchs() {
      const ids = Object.keys(Fetch.sharedList);
      for (const ID of ids) this.deleteFetch({ ID });
    }
    deleteFetch({ ID }) {
      if (!(ID = Fetch.sharedList[Cast.toString(ID)])) return false;
      Fetch.sleeping.delete(ID.id);
      Fetch.aliveList.delete(ID.id);
      delete Fetch.sharedList[ID.id];
      try {
        ID.controller.abort();
      } catch {}
      return true;
    }
    abortFetch({ ID }) {
      if (!(ID = Fetch.sharedList[Cast.toString(ID)])) return false;
      try {
        ID.controller.abort();
      } catch {}
    }
    inlineFetch({ URL, RESTYPE }) {
      URL = Cast.toString(URL);
      if (!validURL(URL)) return '';
      const fetchInstance = new Fetch(URL, uid(50), {});
      return new Promise(resolve => {
        fetchInstance.startAsync().then(_ => {
          this._doRes(fetchInstance, RESTYPE).then(resolve);
        }).catch(err => {
          console.error('Failed to fetch', fetchInstance, 'with error', err);
          resolve('');
        });
      });
    }
    whenAnyFetchDone() {
      return true;
    }
    whenFetchDone({ ID }, { thread }) {
      if (thread[extension.FETCH_INSTANCE_ID] !== Cast.toString(ID)) return (thread.status = 4, false);
      return true;
    }
    fetchExists({ ID }) {
      return !!Fetch.sharedList[Cast.toString(ID)];
    }
    fetchDone({ ID }) {
      if (!(ID = Fetch.sharedList[Cast.toString(ID)])) return false;
      return !ID.inProgress && ID.isDone;
    }
    aliveFetchs() {
      return Cast_toJSON(Array.from(Fetch.aliveList));
    }
    activeFetchs() {
      return Cast_toJSON(Object.keys(Fetch.sharedList));
    }
    /* @private */ _fetchMetaToJSON(r) {
      const res = r.response;
      const object = {
        length: r.buffer.length,
        status: res.status, ok: res.ok,
        statusText: res.statusText,
        bodyUsed: res.bodyUsed, type: res.type,
        url: res.url, redirected: res.redirected,
        headers: Object.fromEntries(res.headers || []),
      };
      return Cast_toJSON(object);
    }
    async readFetchMeta({ ID, META }) {
      if (!(ID = Fetch.sharedList[Cast.toString(ID)])) return '';
      META = this._metas(META, extension.check);
      switch(META) {
        case 1: return ID.url;
        case 2: return ID.opts.method || 'get';
      }
      const res = await new Promise(resolve => {
        ID.tryRead().catch(err => {
          console.warn('Failed to read', ID, 'with error:', err);
          resolve('');
        }).then(res => resolve(res));
      });
      if (!res) return '';
      switch(META) {
        case 0: return res.response.status;
        case 3: return (res.buffer.length / ID.size) * 100;
        case 4: return ID.size;
        case 5: return res.buffer.length;
        case 6: return this._fetchMetaToJSON(res);
        default: return '';
      }
    }
    readFetch({ ID, RESTYPE }) {
      if (!(ID = Fetch.sharedList[Cast.toString(ID)])) return Promise.resolve(false);
      return new Promise(resolve => {
        ID.tryRead().catch(err => {
          console.warn('Failed to read', ID, 'with error:', err);
          resolve('');
        }).then(res => {
          this._doRes(ID, RESTYPE).then(resolve);
        });
      });
    }
    currentFetch(_, { thread }) {
      return thread[extension.FETCH_INSTANCE_ID] || '';
    }
    setHeaders({ ID, HEADERS }) {
      if (!(ID = Fetch.sharedList[Cast.toString(ID)])) return '';
      ID.opts.headers = Cast_toJSON(HEADERS);
    }
    setHeader({ ID, HEADER, VALUE }) {
      if (!(ID = Fetch.sharedList[Cast.toString(ID)])) return '';
      ID.opts.headers[Cast.toString(HEADER)] = VALUE;
    }
    setMethod({ ID, METHOD }) {
      if (!(ID = Fetch.sharedList[Cast.toString(ID)])) return '';
      ID.opts.method = this._methods(METHOD, extension.check);
    }
    setBody({ ID, BODY }) {
      if (!(ID = Fetch.sharedList[Cast.toString(ID)])) return '';
      ID.opts.body = BODY;
    }
  }
  Scratch.extensions.register(runtime[`ext_${extension.id}`] = new extension());
})(Scratch);