/**!
 * Switch Case (extension)
 * @author 0znzw <meow@miyo.lol> (@link https://scratch.mit.edu/users/0znzw/)
 * @version 1.1
 * @license MIT AND LGPL-3.0
 * Do not remove this comment
 */
(function(Scratch) {
  if (!Scratch.extensions.unsandboxed) {
    throw new Error(`"Switch Case" must be ran unsandboxed.`);
  }
  if (!('scaffolding' in window)) {
    if (Scratch.extensions.isUSB) {
      alert('Unsandboxed may break at any time use this with caution!');
    } else if (Scratch.extensions.isPenguinMod) {
      alert('The compiler patches do not work in PenguinMod.\nThis extension may break at any time.\nDo not submit a bug report on PM.');
    }
  }
  const extId = '0znzwSwitchCaseUSB';
  const { BlockType, ArgumentType, vm } = Scratch, { runtime } = vm;
  const showDevBlocks = true, patchAnyways = true;
  let patchThread = (t) => undefined;
  if (patchAnyways || !Scratch.extensions.isUSB) {
    // This code is used in the Unsandboxed virtual machine as'well,
    // It was originally written here and added to the VM later on.
    patchThread = function patchThread(t) {
      if (patchThread.patched) return;
      patchThread.patched = true;
      const Thread = t.constructor;
      
      /**
       * Get the stackframe of the current loop.
       * @param {Thread} thread 
       * @returns {boolean|Array<any, number>}
       */
      Thread.getLoopFrame = (patchAnyways ? undefined : Thread.getLoopFrame) ?? function(thread, iter) {
        const stackFrames = thread.stackFrames, frameCount = stackFrames.length;
        let loopFrameBlock = null, loopFrameIndex;

        for (let i = frameCount - 1; i >= 0; i--) {
          // This check should literally never pass, 
          // but as GarboMuffin once said, "just in case".
          if (i < 0) break;
          if (!(stackFrames[i].isLoop || (iter ? stackFrames[i].isIterable : (
            stackFrames[i].isBreakable || stackFrames[i].isIterable
          )))) continue;
          loopFrameBlock = stackFrames[i].op.id;
          loopFrameIndex = i;
          break;
        }

        if (!loopFrameBlock) {
          // We are not inside of a loop block.
          return false;
        }

        return [loopFrameBlock, loopFrameIndex];
      };

      /**
       * Break the current executing loop.
       */
      Thread.prototype.breakCurrentLoop = (patchAnyways ? undefined : Thread.prototype.breakCurrentLoop) ?? function() {
        const blocks = this.blockContainer, stackFrame = this.peekStackFrame();

        if (!stackFrame._breakData) {
          let frameData = false;
          if (!(frameData = Thread.getLoopFrame(this, false))) return;
          const loopFrameBlock = frameData[0];
          const afterLoop = blocks.getBlock(loopFrameBlock).next;
          stackFrame._breakData = { loopFrameBlock, afterLoop };
        }

        const { loopFrameBlock, afterLoop } = stackFrame._breakData;

        // Remove any remaining blocks within the remaining stack
        // until we reach the loop block. 
        let _;
        while ((_ = this.stack.at(-1)) !== loopFrameBlock) {
          // We don't want to exit from a procedure
          if (blocks.getBlock(_)?.opcode === 'procedures_call') return;
          this.popStack();
        }

        // Remove the remaining loop block.
        this.popStack();

        // If there's a block after the loop, continue
        // from there.
        if (afterLoop) {
          this.pushStack(afterLoop);
        }

        // Clear breakData because it is stoopid
        delete stackFrame._breakData;
      };

      /**
       * Continue the current running loop onto the next iteration.
       */
      Thread.prototype.continueCurrentLoop = (patchAnyways ? undefined : Thread.prototype.continueCurrentLoop) ?? function() {
        const blocks = this.blockContainer, stackFrame = this.peekStackFrame();

        if (!stackFrame._continueData) {
          let frameData = false;
          if (!(frameData = Thread.getLoopFrame(this, true))) return;
          stackFrame._continueData = frameData[0];
        }

        // Pop the stack until we are at the loop block
        // (we make sure to check if the stack exists though to prevent errors)
        let _;
        while (this.stack[0] && (_ = this.stack.at(-1)) !== stackFrame._continueData) {
          // Same as break.
          if (blocks.getBlock(_)?.opcode === 'procedures_call') return;
          this.popStack();
        }

        // "run util.yield", and restart the loop block
        this.status = Thread.STATUS_YIELD;
      };
    }
  }
  class extension {
    constructor() {
      this.noFallthrough = false;
    }
    getInfo() {
      return {
        id: extId,
        name: 'Switch Case',
        blocks: [{
          blockType: BlockType.REPORTER,
          opcode: 'switchValue',
          text: 'switch value',
          disableMonitor: true,
        }, {
          blockType: BlockType.REPORTER,
          opcode: 'caseValue',
          text: 'case value',
          disableMonitor: true,
        }, '---', {
          blockType: BlockType.CONDITIONAL,
          opcode: 'switch',
          text: 'switch [VALUE]',
          arguments: {
            VALUE: {
              type: ArgumentType.STRING,
            },
          },
          isBreakable: true,
        }, {
          blockType: BlockType.CONDITIONAL,
          opcode: 'case',
          text: 'case [VALUE]',
          arguments: {
            VALUE: {
              type: ArgumentType.STRING,
            },
          },
          isBreakable: true,
        }, {
          blockType: BlockType.CONDITIONAL,
          opcode: 'default',
          text: 'default',
          isTerminal: true,
          isBreakable: true,
        }, {
          hideFromPalette: !showDevBlocks && Scratch.extensions.isUSB,
          blockType: BlockType.COMMAND,
          opcode: 'break',
          text: 'break',
          isTerminal: true,
        }, {
          hideFromPalette: !showDevBlocks && Scratch.extensions.isUSB,
          blockType: BlockType.COMMAND,
          opcode: 'continue',
          text: 'continue',
          isTerminal: true,
        }, {
          blockType: BlockType.XML,
          xml: Scratch.extensions.isUSB ? '<block type="control_break"></block><block type="control_continue"></block>' : '',
        }]
      }
    }
    static switch_value = `${extId}_SwitchValue`;
    static case_value = `${extId}_CaseValue`;
    static break_ran = `${extId}_BreakRan`;
    static case_type = `${extId}_IsCase`;
    static is_switch = `${extId}_IsSwitch`;
    static frame_id = `${extId}_FrameId`;
    static last_frame_did_not_break = `${extId}_LastFrameDidntBreak`;
    static case_valid = `${extId}_CaseValid`;
    static switch_construct = `${extId}_SwitchConstruct`;
    static stack_construct = `${extId}_StackConstruct`;
    _getParentFrame(thread, childFrameId) {
      const frameIndex = thread.stackFrames.findIndex(frame => frame?.op?.id === childFrameId);
      return (thread.stackFrames[frameIndex - 1] || { executionContext: {} }).executionContext;
    }
    _getFrame(thread, check) {
      const frameCount = thread.stackFrames.length;
      let frameIndex = null;
      for (let i = frameCount - 1; i >= 0; i--) {
        const frame = thread.stackFrames[i];
        if (check(frame)) {
          frameIndex = i;
          break;
        }
      }
      return frameIndex === null ? { executionContext: {} } : thread.stackFrames[frameIndex];
    }
    _getSwitchFrame(thread) {
      return this._getFrame(thread, (frame) => frame?.executionContext?.[extension.is_switch]).executionContext;
    }
    _getCaseFrame(thread) {
      return this._getFrame(thread, (frame) => frame?.executionContext?.[extension.case_type]).executionContext;
    }
    switch({ VALUE }, util) {
      const thread = util.thread;
      patchThread(thread);
      const frame = util.stackFrame;
      if (typeof frame[extension.is_switch] === 'undefined') {
        frame.isBreakable = true;
        frame[extension.switch_value] = VALUE;
        frame[extension.is_switch] = true;
        frame[extension.case_type] = false;
        frame[extension.last_frame_did_not_break] = null;
        util.startBranch(1, false);
      }
    }
    case({ VALUE }, util) {
      const thread = util.thread;
      patchThread(thread);
      const frame = util.stackFrame;
      const parentFrame = this._getParentFrame(thread, thread.peekStack());
      if (
        !parentFrame[extension.is_switch] ||
        (this.noFallthrough && parentFrame[extension.last_frame_did_not_break])
      ) return;
      if (frame[extension.case_type]) {
        parentFrame[extension.last_frame_did_not_break] = true;
        return;
      } else {
        frame.isBreakable = true;
        frame[extension.case_value] = VALUE;
        frame[extension.case_type] = 'CASE';
        frame[extension.case_valid] = parentFrame[extension.switch_value] === VALUE;
        if (
          frame[extension.case_valid] ||
          (!this.noFallthrough && parentFrame[extension.last_frame_did_not_break])
        ) {
          parentFrame[extension.last_frame_did_not_break] = false;
          util.startBranch(1, true);
        } else {
          parentFrame[extension.last_frame_did_not_break] = true;
        }
      }
    }
    default(_, util) {
      const thread = util.thread;
      patchThread(thread);
      const frame = util.stackFrame;
      const parentFrame = this._getParentFrame(thread, thread.peekStack());
      if (!parentFrame[extension.is_switch]) return;
      frame.isBreakable = true;
      frame[extension.case_type] = 'DEFAULT';
      if (parentFrame[extension.last_frame_did_not_break]) {
        parentFrame[extension.last_frame_did_not_break] = null;
        if (this.noFallthrough) return;
        util.startBranch(1, false);
      }
    }
    break(_, { thread }) {
      patchThread(thread);
      thread.breakCurrentLoop();
    }
    continue(_, { thread }) {
      patchThread(thread);
      thread.continueCurrentLoop();
    }
    switchValue(_, { thread }) {
      return this._getSwitchFrame(thread)[extension.switch_value] ?? '';
    }
    caseValue(_, { thread }) {
      return this._getCaseFrame(thread)[extension.case_value] ?? '';
    }
    static JSG_getParentFrame(frame) {
      return this.frames[this.frames.findIndex(same => same === frame) - 1] || {};
    }
    static JSG_getFrame(check) {
      const frameCount = this.frames.length;
      let frameIndex = null;
      for (let i = frameCount - 1; i >= 0; i--) {
        const frame = this.frames[i];
        if (check(frame)) {
          frameIndex = i;
          break;
        }
      }
      return frameIndex === null ? {} : this.frames[frameIndex];
    }
    static JSG_getSwitchFrame() {
      return extension.JSG_getFrame.call(this, (frame) => frame[extension.switch_value]);
    }
    static JSG_getCaseFrame() {
      return extension.JSG_getFrame.call(this, (frame) => frame[extension.case_value]);
    }
    static JSG_descendForSource(stack, frame) {
      const oldSource = this.source;
      this.source = '';
      this.descendStack(stack, frame);
      const newSource = this.source;
      this.source = oldSource;
      return newSource;
    }
    static JSG_checkStackConstruct(switchFrame) {
      const stackConstruct = switchFrame[extension.stack_construct];
      if (stackConstruct[0]) {
        switchFrame[extension.switch_construct].push(['raw', stackConstruct.join('')]);
        switchFrame[extension.stack_construct] = [];
      }
    }
    static patchCompiler() {
      if (!vm.exports.i_will_not_ask_for_help_when_these_break) return;
      const iwnafhwtb = vm.exports.i_will_not_ask_for_help_when_these_break();
      if (iwnafhwtb.IntermediateStackedBlock) return;
      const { JSGenerator, ScriptTreeGenerator } = iwnafhwtb;
      const { Frame, TypedInput, TYPE_UNKNOWN } = JSGenerator.unstable_exports;
      const JSGP = JSGenerator.prototype, STGP = ScriptTreeGenerator.prototype;
      const js_dsb = JSGP.descendStackedBlock, st_dsb = STGP.descendStackedBlock;
      const js_di = JSGP.descendInput, st_di = STGP.descendInput;
      // Break and continue code from: 
      JSGP.descendStackedBlock = function (...args) {
        const node = args[0];
        const parentFrame = extension.JSG_getParentFrame.call(this, this.currentFrame);
        if (node.kind === `${extId}.switch`) {
          const switchValue = this.localVariables.next();
          const noFallthrough = runtime[`ext_${extId}`].noFallthrough;
          this.currentFrame[extension.is_switch] = true;
          this.currentFrame[extension.switch_value] = switchValue;
          this.currentFrame[extension.switch_construct] = [];
          this.currentFrame[extension.stack_construct] = [];
          extension.JSG_descendForSource.call(this, node.stack, new Frame(false));
          extension.JSG_checkStackConstruct.call(this, this.currentFrame);
          const frames = this.currentFrame[extension.switch_construct], frameCount = frames.length;
          let variables = `let ${switchValue} = ${this.descendInput(node.value).asUnknown()}`, stack = ``;
          this.currentFrame[extension.is_switch] = false;
          for (let i = 0; i < frameCount; i++) {
            const [frameType, frameData] = frames[i];
            if (frameType === 'default') {
              stack += 'default: {\n';
            } else if (frameType === 'case') {
              const caseVariable = this.localVariables.next();
              variables += `, ${caseVariable}`;
              stack += `case (${switchValue}): (${caseVariable} = (${this.descendInput(frameData.value).asUnknown()}));\ncase (${caseVariable}): {\n`;
              this.currentFrame[extension.case_value] = caseVariable;
            } else {
              stack += `case (${switchValue}): {\n`;
            }
            const stackFrame = new Frame(false);
            stackFrame.isBreakable = true;
            const stackSource = frameType === 'raw' ? frameData : extension.JSG_descendForSource.call(this, frameData.stack, stackFrame);
            stack += `${stackSource}${noFallthrough && frameType !== 'raw' ? 'break;\n' : ''}};\n`;
          }
          this.currentFrame[extension.is_switch] = true;
          this.source += `${variables};\nswitch(${switchValue}){\n${stack}};\n`;
          return;
        } else if (node.kind === `${extId}.case`) {
          if (!parentFrame[extension.is_switch]) return;
          extension.JSG_checkStackConstruct.call(this, parentFrame);
          parentFrame[extension.switch_construct].push(['case', node]);
          return;
        } else if (node.kind === `${extId}.default`) {
          if (!parentFrame[extension.is_switch]) return;
          extension.JSG_checkStackConstruct.call(this, parentFrame);
          parentFrame[extension.switch_construct].push(['default', node]);
          return;
        }
        if (parentFrame[extension.is_switch]) {
          const stackFrame = new Frame(false);
          stackFrame.isBreakable = true;
          const stackSource = extension.JSG_descendForSource.call(this, [ node ], stackFrame);
          parentFrame[extension.stack_construct].push(stackSource);
        } else if (node.kind === `${extId}.break`) {
          if (!this.frames.find(frame =>
            frame.isLoop ||
            frame.isBreakable ||
            frame.isIterable
          )) return null;
          this.source += '\nbreak;\n';
        } else if (node.kind === `${extId}.continue`) {
          if (!this.frames.find(frame => frame.isLoop || frame.isIterable)) return null;
          this.source += '\ncontinue;\n';
        } else {
          return js_dsb.apply(this, args);
        }
      };
      JSGP.descendInput = function (...args) {
        const node = args[0];
        if (node.kind === `${extId}.switchValue`) {
          const frame = extension.JSG_getSwitchFrame.call(this);
          return new TypedInput(frame ? (frame[extension.switch_value] || '') : '', TYPE_UNKNOWN);
        } else if (node.kind === `${extId}.caseValue`) {
          const frame = extension.JSG_getCaseFrame.call(this);
          return new TypedInput(frame ? (frame[extension.case_value] || '') : '', TYPE_UNKNOWN);
        } else {
          return js_di.apply(this, args);
        }
      };
      STGP.descendStackedBlock = function (...args) {
        const block = args[0];
        if (block.opcode === `${extId}_switch`) {
          return {
            kind: `${extId}.switch`,
            value: this.descendInputOfBlock(block, 'VALUE'),
            stack: this.descendSubstack(block, 'SUBSTACK'),
          };
        } else if (block.opcode === `${extId}_case`) {
          return {
            kind: `${extId}.case`,
            value: this.descendInputOfBlock(block, 'VALUE'),
            stack: this.descendSubstack(block, 'SUBSTACK'),
          };
        } else if (block.opcode === `${extId}_default`) {
          return {
            kind: `${extId}.default`,
            stack: this.descendSubstack(block, 'SUBSTACK'),
          };
        } else if (block.opcode === `${extId}_break`) {
          return { kind: `${extId}.break` };
        } else if (block.opcode === `${extId}_continue`) {
          return { kind: `${extId}.continue` };
        } else return st_dsb.apply(this, args);
      };
      STGP.descendInput = function (...args) {
        const block = args[0];
        if (block.opcode === `${extId}_switchValue`) {
          return { kind: `${extId}.switchValue` };
        } else if (block.opcode === `${extId}_caseValue`) {
          return { kind: `${extId}.caseValue` };
        } else {
          return st_di.apply(this, args);
        }
      };
    }
  }
  extension.patchCompiler();
  Scratch.extensions.register(runtime[`ext_${extId}`] = new extension());
})(Scratch);