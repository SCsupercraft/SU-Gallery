/**!
 * Clipboard
 * @author 0znzw <meow@miyo.lol> (@link https://scratch.mit.edu/users/0znzw/)
 * @version 1.0
 * @license MIT AND LGPL-3.0
 * Do not remove this comment
 * TurboWarp's: https://extensions.turbowarp.org/clipboard.js
 * This extension's code is not based on the source code of TurboWarp's.
 */
(function(Scratch) {
  'use strict';
  if (!Scratch.extensions.unsandboxed) {
    throw new Error(`"Clipboard" extension must be ran unsandboxed.`);
  }
  const { BlockType, ArgumentType, Cast, vm } = Scratch;
  const { runtime } = vm, extId = 'clipboard';
  const gbind = (n, p, ...a) => (n?.[p]?.bind?.(n, ...a));
  const Base64 = (function() {
    const window = {};
    // https://github.com/beatgammit/base64-js (MIT)
    (function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else{var b;b="undefined"==typeof window?"undefined"==typeof global?"undefined"==typeof self?this:self:global:window,b.base64js=a()}})(function(){return function(){function b(d,e,g){function a(j,i){if(!e[j]){if(!d[j]){var f="function"==typeof require&&require;if(!i&&f)return f(j,!0);if(h)return h(j,!0);var c=new Error("Cannot find module '"+j+"'");throw c.code="MODULE_NOT_FOUND",c}var k=e[j]={exports:{}};d[j][0].call(k.exports,function(b){var c=d[j][1][b];return a(c||b)},k,k.exports,b,d,e,g)}return e[j].exports}for(var h="function"==typeof require&&require,c=0;c<g.length;c++)a(g[c]);return a}return b}()({"/":[function(a,b,c){'use strict';function d(a){var b=a.length;if(0<b%4)throw new Error("Invalid string. Length must be a multiple of 4");var c=a.indexOf("=");-1===c&&(c=b);var d=c===b?0:4-c%4;return[c,d]}function e(a,b,c){return 3*(b+c)/4-c}function f(a){var b,c,f=d(a),g=f[0],h=f[1],j=new m(e(a,g,h)),k=0,n=0<h?g-4:g;for(c=0;c<n;c+=4)b=l[a.charCodeAt(c)]<<18|l[a.charCodeAt(c+1)]<<12|l[a.charCodeAt(c+2)]<<6|l[a.charCodeAt(c+3)],j[k++]=255&b>>16,j[k++]=255&b>>8,j[k++]=255&b;return 2===h&&(b=l[a.charCodeAt(c)]<<2|l[a.charCodeAt(c+1)]>>4,j[k++]=255&b),1===h&&(b=l[a.charCodeAt(c)]<<10|l[a.charCodeAt(c+1)]<<4|l[a.charCodeAt(c+2)]>>2,j[k++]=255&b>>8,j[k++]=255&b),j}function g(a){return k[63&a>>18]+k[63&a>>12]+k[63&a>>6]+k[63&a]}function h(a,b,c){for(var d,e=[],f=b;f<c;f+=3)d=(16711680&a[f]<<16)+(65280&a[f+1]<<8)+(255&a[f+2]),e.push(g(d));return e.join("")}function j(a){for(var b,c=a.length,d=c%3,e=[],f=16383,g=0,j=c-d;g<j;g+=f)e.push(h(a,g,g+f>j?j:g+f));return 1===d?(b=a[c-1],e.push(k[b>>2]+k[63&b<<4]+"==")):2===d&&(b=(a[c-2]<<8)+a[c-1],e.push(k[b>>10]+k[63&b>>4]+k[63&b<<2]+"=")),e.join("")}c.byteLength=function(a){var b=d(a),c=b[0],e=b[1];return 3*(c+e)/4-e},c.toByteArray=f,c.fromByteArray=j;for(var k=[],l=[],m="undefined"==typeof Uint8Array?Array:Uint8Array,n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",o=0,p=n.length;o<p;++o)k[o]=n[o],l[n.charCodeAt(o)]=o;l[45]=62,l[95]=63},{}]},{},[])("/")});
    return window.base64js;
  }).apply({});
  class extension {
    static exports = { gbind, Base64 };
    constructor() {
      this._clipboard = navigator.clipboard;
      this._readText = this._clipboard && gbind(this._clipboard, 'readText');
      this._writeText = this._clipboard && gbind(this._clipboard, 'writeText');
      this._lastPaste = null;
      this._history = [];
      this._lastFiles = [new Map(), []];
      window.addEventListener('copy', () => runtime.startHats(`${extId}_whenCopied`));
      window.addEventListener('cut', () => runtime.startHats(`${extId}_whenCut`));
      window.addEventListener('paste', (ev) => {
        runtime.startHats(`${extId}_whenPasted`);
        this._lastPaste = ev.clipboardData || window.clipboardData;
        this._history.unshift(this.getPaste());
        while(this._history.length > 10) this._history.pop();
        this._lastFiles = [new Map(), []];
        Array.from(this._lastPaste.files).forEach(file => {
          this._lastFiles[0].set(file.name, file);
          this._lastFiles[1].push(file.name);
        });
        if (this._lastFiles[1].length > 0) {
          runtime.startHats(`${extId}_whenFilesPasted`);
        }
      });
    }
    getInfo() {
      return {
        id: extId,
        name: 'Clipboard V2',
        color1: '#008080',
        color2: '#006666',
        blocks: [{
          opcode: 'whenCopied',
          blockType: BlockType.EVENT,
          text: 'when text copied',
          isEdgeActivated: false,
        }, {
          opcode: 'whenPasted',
          blockType: BlockType.EVENT,
          text: 'when text pasted',
          isEdgeActivated: false,
        }, {
          opcode: 'setClipboard',
          blockType: BlockType.COMMAND,
          text: 'copy [TEXT] to clipboard',
          arguments: {
            TEXT: { type: ArgumentType.STRING, defaultValue: '' },
          },
        }, {
          opcode: 'resetClipboard',
          blockType: BlockType.COMMAND,
          text: 'clear clipboard',
        }, {
          opcode: 'clipboard',
          blockType: BlockType.REPORTER,
          text: 'clipboard',
          disableMonitor: true,
        }, {
          opcode: 'getLastPastedText',
          blockType: BlockType.REPORTER,
          text: 'last text pasted',
          disableMonitor: true,
        }, '---', {
          opcode: 'whenFilesPasted',
          blockType: BlockType.EVENT,
          text: 'when file(s) pasted',
          isEdgeActivated: false,
        }, {
          opcode: 'whenCut',
          blockType: BlockType.EVENT,
          text: 'when text cut',
          isEdgeActivated: false,
        }, {
          opcode: 'clearPaste',
          blockType: BlockType.COMMAND,
          text: 'clear pasted data',
        }, {
          opcode: 'clearHistory',
          blockType: BlockType.COMMAND,
          text: 'clear paste history',
        }, {
          opcode: 'writeRaw',
          blockType: BlockType.COMMAND,
          text: 'write dataURL [DATA] to clipboard',
          arguments: {
            DATA: { type: ArgumentType.STRING, defaultValue: 'data:text/plain;,Hi' },
          },
        }, {
          opcode: 'canDoAction',
          blockType: BlockType.BOOLEAN,
          text: 'can [ACTION] clipboard?',
          arguments: {
            ACTION: { type: ArgumentType.STRING, menu: 'ACTION' },
          },
          disableMonitor: true,
        }, {
          opcode: 'getPasteFiles',
          blockType: BlockType.REPORTER,
          text: 'last pasted files',
          disableMonitor: true,
        }, {
          opcode: 'getPasteFileData',
          blockType: BlockType.REPORTER,
          text: 'get pasted file [NAME] as [TYPE]',
          arguments: {
            NAME: { type: ArgumentType.STRING, defaultValue: 'file name' },
            TYPE: { type: ArgumentType.STRING, menu: 'DATA_TYPE' },
          },
          disableMonitor: true,
        }, {
          opcode: 'getHistory',
          blockType: BlockType.REPORTER,
          text: 'paste history',
          disableMonitor: true,
        }, {
          opcode: 'canWriteType',
          blockType: BlockType.BOOLEAN,
          text: 'is type [TYPE] supported by clipboard?',
          arguments: {
            TYPE: { type: ArgumentType.STRING, defaultValue: 'text/plain' },
          },
          disableMonitor: true,
        }],
        menus: {
          ACTION: {
            acceptReporters: true,
            items: ['read', 'write'],
          },
          DATA_TYPE: {
            acceptReporters: true,
            items: ['text', 'base64', {
              text: 'dataURL',
              value: 'dataurl',
            }, {
              text: 'arrayBuffer',
              value: 'arraybuffer',
            }],
          },
        },
      };
    }
    getPaste(type) {
      if (this._lastPaste) {
        if (type === 'ev') return this._lastPaste;
        return this._lastPaste.getData(type ?? 'text');
      }
      return '';
    }
    setClipboard({ TEXT }) {
      TEXT = Cast.toString(TEXT);
      if (this._writeText) this._writeText(TEXT);
      // https://github.com/surv-is-a-dev/gallery/blob/main/site-files/include/generator.js#L384C1-L404C8
      const active = document.activeElement || document.querySelector('*:focus');
      const input = document.createElement('input');
      input.value = TEXT;
      input.style.top = '0px';
      input.style.left = '0px';
      input.style.position = 'fixed';
      document.body.appendChild(input);
      input.focus();
      input.select();
      try {
        document.execCommand('copy');
      } catch {}
      input.blur();
      document.body.removeChild(input);
      if (active) active.focus();
    }
    resetClipboard() {
      this.setClipboard({ TEXT: '' });
    }
    async clipboard() {
      if (!this._readText) return '';
      const canRead = await Scratch.canReadClipboard().catch(() => false);
      if (!canRead) return '';
      return this._readText() ?? '';
    }
    getLastPastedText() {
      return this._history[0];
    }
    // extra blocks
    _promiseWrapper(func) {
      return new Promise((res, rej) => {
        let dres = false;
        return func((...a) => {
          dres = true;
          return res(...a);
        }, rej).then((...a) => {
          if (dres) return;
          return res(...a);
        }).catch(rej);
      });
    }
    _getPasteFile(name) {
      return this._lastFiles[0].get(name) ?? (new File(new Uint8Array(), ''));
    }
    _getPasteFileObj(name) {
      const file = this._getPasteFile(name);
      return {
        name: file.name || '',
        size: file.size || 0,
        type: file.type || '',
        modified: file.lastModified || Date.now(),
        rpath: file.webkitRelativePath || '',
      };
    }
    clearPaste() {
      this._lastPaste = null;
      this._lastFiles = [new Map(), []];
    }
    clearHistory() {
      this._history = [];
    }
    canDoAction({ ACTION }) {
      ACTION = Cast.toString(ACTION).toLowerCase() === 'read' ? 'read' : 'write';
      if (ACTION === 'write') return !!this._writeText;
      return this._promiseWrapper(async () => {
        const canRead = await Scratch.canReadClipboard().catch(() => false);
        return canRead && !!this._readText;
      });
    }
    getPasteFiles() {
      return JSON.stringify(this._lastFiles[1].map(name => this._getPasteFileObj(name)));
    }
    getPasteFileData({ NAME, TYPE }) {
      TYPE = Cast.toString(TYPE).toLowerCase();
      const file = this._getPasteFile(Cast.toString(NAME));
      if (file.name === '') return '';
      return new Promise((res, rej) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (TYPE === 'arraybuffer') return res(reader.result);
          let data = String(reader.result);
          if (TYPE === 'text') return res(data);
          if (TYPE !== 'dataurl') {
            data = data.replace(/^data:(.*,)?/, '');
            if ((data.length % 4) > 0) {
              data += '='.repeat(4 - (data.length % 4));
            }
          }
          return res(data);
        };
        reader.onerror = rej;
        switch(TYPE) {
          case 'arraybuffer':
            reader.readAsArrayBuffer(file);
            break;
          case 'base64':
          case 'dataurl':
            reader.readAsDataURL(file);
            break;
          default:
          case 'text':
            reader.readAsText(file);
            break;
        }
      });
    }
    getHistory() {
      return JSON.stringify(this._history);
    }
    canWriteType({ TYPE }) {
      return ClipboardItem.supports(Cast.toString(TYPE));
    }
    async writeRaw({ DATA }) {
      if (!this._writeText) return;
      DATA = Cast.toString(DATA);
      if (!DATA.startsWith('data:')) return '';
      const TYPE = DATA.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/)[0];
      if (!this.canWriteType({ TYPE })) return;
      try {
        DATA = await fetch(DATA);
        DATA = await DATA.arrayBuffer();
        const blob = new Blob([DATA], { type: TYPE });
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
      } catch {}
    }
  }
  Scratch.extensions.register(runtime[`ext_${extId}`] = new extension());
})(Scratch);