/**!
 * Try Catch
 * @author 0znzw <meow@miyo.lol> (@link https://scratch.mit.edu/users/0znzw/)
 * @version 2.1
 * @license MIT AND LGPL-3.0
 * Do not remove this comment
 */
(function(Scratch) {
  if (!Scratch.extensions.unsandboxed) {
    throw new Error(`"Try Catch V2" extension must be ran unsandboxed.`);
  }

  const vm = Scratch.vm, { exports, runtime } = vm;
  const extId = '0znzwTryCatchV2';
  const THREAD_HOOK = Symbol('TryCatch.Capture');
  const THREAD_ERR = Symbol('TryCatch.Error');

  const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

  // Thanks CST1229
  const shadowColors = {caught: '#891900'};
  // @ts-ignore
  if (Scratch?.gui) Scratch.gui.getBlockly().then(ScratchBlocks => {
    const sbuisar = ScratchBlocks.scratchBlocksUtils.isShadowArgumentReporter;
    const bspssc = ScratchBlocks.BlockSvg.prototype.setShadowColour;
    const bspuc = ScratchBlocks.BlockSvg.prototype.updateColour;
    const gpdod_ = ScratchBlocks.Gesture.prototype.duplicateOnDrag_;
    ScratchBlocks.BlockSvg.prototype.setShadowColour = function(color) {
      if (this.type == `${extId}_caught`) {
        return bspssc.call(this, shadowColors.caught);
      } else return bspssc.call(this, color);
    };
    ScratchBlocks.BlockSvg.prototype.updateColour = function() {
      if (this.type == `${extId}_caught`) {
        (()=>{
          const parent = this.getParent();
          if (!parent) return;
          // preferably I should not have to check the parent block type.
          if (parent.type !== `${extId}_attempt`) return;
          const input = parent.getInputWithBlock(this);
          if (!input) return;
          const shadowDom_ = input.connection?.shadowDom_;
          if (!shadowDom_) return;
          this.colour_ = shadowColors.caught;
        })();
      }
      bspuc.call(this);
    }
    ScratchBlocks.Gesture.prototype.duplicateOnDrag_ = function() {
      if (this.type == `${extId}_caught`) {
        this.targetBlock_.colour_ = shadowColors.caught;
        this.targetBlock_.updateColour();
      }
      gpdod_.call(this);
    }
    ScratchBlocks.scratchBlocksUtils.isShadowArgumentReporter = function(block) {
      const result = sbuisar(block);
      if (result) return result;
      if (block.isShadow() && block.type == `${extId}_caught`) {
        return true;
      } else return false;
    };
  });
  const PATCHES_ID = extId;
  const cst_patch = (obj, functions) => {
    if (obj[PATCHES_ID]) return;
    obj[PATCHES_ID] = {};
    for (const name in functions) {
      const original = obj[name];
      obj[PATCHES_ID][name] = obj[name];
      if (original) {
        obj[name] = function (...args) {
          const callOriginal = (...args) => original.call(this, ...args);
          return functions[name].call(this, callOriginal, ...args);
        };
      } else {
        obj[name] = function (...args) {
          return functions[name].call(this, () => {}, ...args);
        };
      }
    }
  };

  // Improved version of my one in "Error Stop"
  const prims = runtime._primitives;
  runtime._primitives = new Proxy(prims, {
    get(target, prop, reciver) {
      // @ts-ignore
      const tprop = target[prop];
      if (typeof tprop == 'function') return function(...all) {
        const args = all[0], util = all[1], { thread } = util;
        if (!hasOwn(thread, THREAD_HOOK)) return tprop(...all);
        const hook = thread[THREAD_HOOK];
        try {
          return tprop(...all);
        } catch(error) {
          thread[THREAD_ERR] = error;
          if (hook) thread.pushStack(hook);
          return '';
        }
      }; else return tprop;
    }
  });

  const xml = {
    attemptBlock: `<block type="${extId}_attempt"><value name="ERROR"><shadow type="${extId}_caught"></shadow></value></block>`
  };
  class extension {
    getInfo() {
      return {
        id: extId,
        name: 'Try Catch V2',
        color1: '#ff3104',
        blocks: [{
          hideFromPalette: true,
          opcode: 'caught',
          text: 'error',
          blockType: Scratch.BlockType.REPORTER,
          color1: '#c52300', // differentiate the block
        }, {
          hideFromPalette: true,
          opcode: 'attempt',
          text: ['try', 'catch [ERROR]'],
          blockType: Scratch.BlockType.CONDITIONAL,
          arguments: {
            ERROR: {type: Scratch.ArgumentType.STRING}
          },
          branchCount: 2,
        }, {
          // @ts-ignore
          blockType: Scratch.BlockType.XML,
          xml: `${xml.attemptBlock}`,
        }, {
          opcode: 'error',
          text: 'throw [ERROR]',
          blockType: Scratch.BlockType.COMMAND,
          arguments: {
            ERROR: {type: Scratch.ArgumentType.STRING}
          },
          isTerminal: true,
        }]
      };
    }
    async until(conditionFunction) {
      const poll = (resolve) => {
        if (conditionFunction()) resolve();
        else vm.runtime.once('AFTER_EXECUTE', (_) => poll(resolve));
      };
      return new Promise(poll);
    }
    caught(args, util) {
      const error = util.thread?.[THREAD_ERR];
      if (!error) return '{"message":"","name":"","stack":""}';
      return JSON.stringify({
        message: error?.message ?? '',
        name: error?.name ?? '',
        stack: error?.stack ?? '',
      });
    }
    async attempt(args, util) {
      const { target, thread } = util, blocks = target.blocks;
      const id = thread.peekStack();
      const tryBranch = blocks.getBranch(id, 1), catchBranch = blocks.getBranch(id, 2) ?? false;
      if (!tryBranch) return 0;
      const tryThread = runtime._pushThread(tryBranch, target, { stackClick: true, updateMonitor: false });
      tryThread[THREAD_HOOK] = catchBranch;
      await this.until(_ => !runtime.isActiveThread(tryThread));
    }
    error(args, util) {
      throw new Error(args.ERROR);
    }
  }

  let TYPE_UNKNOWN, Frame, TypedInput;
  // TurboWarp and CST's exports support.
  const errors = new (function generator() {
    'use strict';
    this.$i = 0;
    this.now = () => `Perr${this.$i}`;
    this.next = () => `Perr${++this.$i}`;
  });
  function getError() {
    if ((this.currentFrame ?? '') === '') return '(\'\')';
    let i = -1, j = this.frames.findIndex(same => same === this.currentFrame);
    let k = this.currentFrame;
    while(true) {
      k = this.frames[j - (++i)];
      if (k === undefined || k[THREAD_ERR]) break;
    }
    return `(${(k || {})[THREAD_ERR] ?? '\'\''})`;
  }
  // @ts-ignore
  const iwnafhwtb = exports?.i_will_not_ask_for_help_when_these_break;
  let JSG, STG, IRG;
  if (iwnafhwtb) {
    const temp = iwnafhwtb();
    JSG = temp.JSGenerator;
    STG = temp.ScriptTreeGenerator;
    IRG = temp.IRGenerator;
    void({ TYPE_STRING, Frame, TypedInput } = JSG.unstable_exports);
  } else {
    // @ts-ignore
    IRG = exports?.IRGenerator;
    if (IRG) {
      // @ts-ignore
      JSG = exports.JSGenerator;
      STG = IRG.exports.ScriptTreeGenerator;
      void({ TYPE_UNKNOWN, Frame, TypedInput } = JSG.exports);
    } else {
      console.error('Failed register compiler patches. VM is outdated.');
    }
  }
  if (JSG) {
    const JSGP = JSG.prototype;
    const STGP = STG.prototype;
    const IRGP = IRG.prototype;

    // Patching JSG and STG
    cst_patch(JSGP, {
      descendStackedBlock(originalFn, node) {
        switch(node.kind) {
          case `${extId}.caught`:
            this.source += '\nvoid(\'\');';
            break;
          case `${extId}.error`:
            this.source += `\nthrow new Error(${this.descendInput(node.error).asString()});`;
            break;
          case `${extId}.attempt`:
            this.source += '\ntry {\n';
            this.descendStack(node.toTry, new Frame(false));
            this.currentFrame[THREAD_ERR] = errors.next();
            this.source += `\n} catch(${this.currentFrame[THREAD_ERR]}) {\n`;
            this.descendStack(node.onCaught, new Frame(false));
            this.source += `\n};`;
            break;
          default:
            return originalFn(node);
        }
      },
      descendInput(originalFn, node) {
        switch(node.kind) {
          case `${extId}.caught`: {
            const e = getError.call(this);
            return new TypedInput(`(JSON.stringify({message:${e}?.message??'',name:${e}?.name??'',stack:${e}?.stack??''}))`, TYPE_STRING);
          };
          default:
            return originalFn(node);
        }
      },
    });
    cst_patch(STGP, {
      descendStackedBlock(originalFn, block) {
        switch(block.opcode) {
          case `${extId}_caught`:
            return {
              kind: `${extId}.caught`,
            };
          case `${extId}_error`:
            return {
              kind: `${extId}.error`,
              error: this.descendInputOfBlock(block, 'ERROR'),
            };
          case `${extId}_attempt`:
            return {
              kind: `${extId}.attempt`,
              toTry: this.descendSubstack(block, 'SUBSTACK'),
              onCaught: this.descendSubstack(block, 'SUBSTACK2'),
            };
          default:
            return originalFn(block);
        }
      },
      descendInput(originalFn, block) {
        switch(block.opcode) {
          case `${extId}_caught`:
            return {
              kind: `${extId}.caught`,
            };
          default:
            return originalFn(block);
        }
      },
    });
  }

  // @ts-ignore
  Scratch.extensions.register(new extension());
})(Scratch);