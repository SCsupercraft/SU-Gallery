/**!
 * Script Manager
 * @author 0znzw <meow@miyo.lol> (@link https://scratch.mit.edu/users/0znzw/)
 * @author CST1229 https://scratch.mit.edu/users/CST1229/
 * @author FurryR https://github.com/FurryR/
 * @version 2.1
 * @license MIT
 * Do not remove this comment, also do not update on sharkpools gallery
 */
(function (Scratch) {
  'use strict';

  console.log('"Script Manager": https://surv.is-a.dev/gallery/');
  if (!Scratch.extensions.unsandboxed) {
    throw new Error(`"Script Manager" extension must be ran unsandboxed.`);
  }
  // @ts-ignore This is a PenguinMod feature
  if (Scratch.extensions.isPenguinMod) console.warn('I see your using PenguinMod, please do not report any bugs that happen on here as i do not actively support PenguinMod.');

  const hasOwn = function (object, key) {
    return Object.prototype.hasOwnProperty.call(object, key);
  };

  const _stackFrameFreeList = [];
  class _StackFrame {
    constructor(t) {
      (this.isLoop = !1), (this.warpMode = t), (this.justReported = null), (this.reporting = ''), (this.reported = null), (this.waitingReporter = null), (this.params = null), (this.executionContext = null), (this.op = null);
    }
    reset() {
      return (this.isLoop = !1), (this.warpMode = !1), (this.justReported = null), (this.reported = null), (this.waitingReporter = null), (this.params = null), (this.executionContext = null), (this.op = null), this;
    }
    reuse(t = this.warpMode) {
      return this.reset(), (this.warpMode = Boolean(t)), this;
    }
    static create(t) {
      const e = _stackFrameFreeList.pop();
      return void 0 !== e ? ((e.warpMode = Boolean(t)), e) : new _StackFrame(t);
    }
    static release(t) {
      void 0 !== t && _stackFrameFreeList.push(t.reset());
    }
  }

  const extId = '0znzwScriptManagement',
    vm = Scratch.vm,
    runtime = vm.runtime,
    rscp = runtime.sequencer.constructor.prototype,
    spst = rscp.stepThread;
  let workspace = null;

  rscp.stepThread = function (thread) {
    if (thread.dontStepJustThisOneTime) {
      thread.dontStepJustThisOneTime = false;
      return;
    }
    return spst.call(this, thread);
  };

  vm.on('EXTENSION_ADDED', tryUseScratchBlocks);
  vm.on('BLOCKSINFO_UPDATE', tryUseScratchBlocks);
  tryUseScratchBlocks();

  function getBlocksByType(workspace, type) {
    const blocks = workspace.getAllBlocks().filter((block) => block.type == type);
    const flyoutBlock = workspace.getBlockById(type);
    if (flyoutBlock) blocks.push(flyoutBlock);
    return blocks;
  }
  const messages = {
    inline: {
      warning: ['Currently in-dev', 'Not all features are available in the interpreter'],
      tooltip: ['run blocks inline', 'to return a value use the inline return block'],
    },
    inlineReturn: {
      tooltip: 'return block for the "inline block" block',
    },
    test_opcodesOf: {
      warning: 'big scripts will slow this down alot',
      tooltip: 'kind of like the "get blocks in thread" block but for the blocks in the branch',
    },
    toJSON: {
      tooltip: 'the json of the current project',
    },
    set_myself: {
      tooltip: "saves the current block's json",
    },
    get_myself_id: {
      tooltip: 'idk i forgot',
    },
    monitorThisThread: {
      tooltip: 'assign a t-id to the current script to use later',
    },
    isThreadWithIDrunning: {
      tooltip: 'returns weather or not the script with the t-id you specified is running',
    },
    stopThreadWithID: {
      tooltip: 'stops the script that has the t-id you specified',
    },
    restartThreadWithID: {
      tooltip: 'attempts to restart the script with the specified t-id',
    },
    setBlockViaID: {
      tooltip: 'sets the block that has the id you specified to the inputted json',
    },
    getBlocksInThread: {
      warning: 'big scripts will slow this down alot',
      tooltip: 'lists all the blocks that are top-level in the script with t-id',
    },
    getBlockViaID: {
      tooltip: 'gets the JSON of the block with the id you inputted',
    },
    storeInThread: {
      tooltip: 'stores data in a thread using a key as the variable name',
    },
    getStoreInThread: {
      tooltip: 'gets the data in the "variable" you set in the thread',
    },
    deleteScriptViaThreadID: {
      warning: 'this can fuck up your project as it actually deletes the blocks',
      tooltip: 'deletes the actual entire script in the project using t-id to get the script',
    },
    toggleScriptViaThreadID: {
      tooltip: ['toggles a script to be on or off', 'use sparingly'],
    },
    getScriptsInSprite: {
      tooltip: 'get the sprite that has a script with t-id you inputted and then return all the scripts in the sprite',
    },
    getOuterC: {
      warning: 'this is constantly under development and may change in the future',
      tooltip: 'gets the closes C-Block it can find to itself and returns its JSON',
    },
    forceRestartThreadWithID: {
      warning: 'this can break stuff such as custom blocks if not used correctly',
      tooltip: 'forces a script to restart based on its t-id',
    },
    skipBlocks: {
      warning: ['this is under development and does not always do what it is supposed to do', 'use sparingly'],
      tooltip: 'restarts the script and start specified number of blocks ahead of this block',
    },
    runInSprite: {
      warning: ['big scripts can crash the project as it has to clone the blocks', 'custom blocks will not transfer, and neither will sprite specific stuff'],
      tooltip: 'allows you to run blocks in other sprites'
    }
  };
  function modifyBlocks() {
    if (!workspace) return;
    for (const opcode of Object.keys(messages)) {
      const message = messages[opcode];
      let i = 0;
      getBlocksByType(workspace, `${extId}_${opcode}`).forEach((block) => {
        block.setWarningText(null);
        if (!!message.warning) {
          if (Array.isArray(message.warning))
            message.warning.forEach((warning) => {
              block.setWarningText(warning, `${extId}_${i}`);
              i++;
            });
          else block.setWarningText(message.warning, extId);
        }
        if (!!message.tooltip) {
          if (Array.isArray(message.tooltip)) message.tooltip = message.tooltip.join('\n');
          block.setTooltip(message.tooltip);
        }
      });
    }
    workspace
      .getAllBlocks()
      .filter((block) => block.warning)
      .map((block) => block.warning)
      .forEach((warning) => {
        if (warning.hasClick) warning.iconGroup_.removeEventListener('mousedown', warning.hasClick);
        warning.hasClick = function (event) {
          event.stopPropagation();
          warning.iconClick_(event);
          if (!Object.keys(warning.text_)[0].startsWith(extId)) return;
          if (warning.bubble_.rendered_)
            Array.from(warning.bubble_.content_.children).forEach((element) => {
              element.setAttribute('fill', '#DC143C');
            });
        };
        warning.iconGroup_.addEventListener('mousedown', warning.hasClick);
      });
  }
  function tryUseScratchBlocks() {
    if (!window.ScratchBlocks) return;
    // @ts-ignore Not typed yet
    workspace = ScratchBlocks.getMainWorkspace();
    vm.removeListener('EXTENSION_ADDED', tryUseScratchBlocks);
    vm.removeListener('BLOCKSINFO_UPDATE', tryUseScratchBlocks);
    vm.on('workspaceUpdate', modifyBlocks);
    vm.runtime.on('BLOCK_DRAG_UPDATE', modifyBlocks);
    vm.runtime.on('BLOCK_DRAG_END', modifyBlocks);
  }

  function getBlockByID(target, id) {
    return target.blocks._blocks[id];
  }

  function getOuterCblock(target, startId) {
    let block = getBlockByID(target, startId);
    let isC = false;
    while (!isC && block.hasOwnProperty('parent') && block.parent !== null) {
      block = getBlockByID(target, block.parent);
      isC = block.hasOwnProperty('inputs') && block.inputs.hasOwnProperty('SUBSTACK');
    }
    return isC ? block : null;
  }

  function cloneBlock(id, target) {
    function isInvalid(data) {
      return data == null || data == undefined;
    }
    let needed = [];
    let block = target.blocks.getBlock(id);
    if (isInvalid(block)) {
      return [];
    }
    Object.values(block.inputs).forEach((key) => {
      if (hasOwn('shadow', key) && key.block === key.shadow) {
        needed = [...needed, ...cloneBlock(key.block, target)];
        return;
      } else {
        if (hasOwn('shadow', key)) needed = [...needed, ...cloneBlock(key.shadow, target)];
        if (hasOwn('shadow', block)) needed = [...needed, ...cloneBlock(key.block, target)];
      }
    });
    Object.values(block.fields).forEach((key) => {
      if (hasOwn('id', key)) needed = [...needed, ...cloneBlock(key.id, target)];
    });
    needed.push(block);
    return needed;
  }

  function label(text) {
    return { blockType: 'label', text };
  }
  function button(text, func) {
    return { blockType: 'button', text, func };
  }
  //@ts-ignore
  let monitoredThreads = window.monitoredThreads || {};

  class extension {
    constructor() {
      this.lastBlock = '';
      this.target = undefined;
    }
    getInfo() {
      return {
        id: extId,
        name: 'Script Management',
        color1: '#545454',
        color2: '#494949',
        menuIconURI: 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxMzEuNSIgaGVpZ2h0PSIxMzEuNSIgdmlld0JveD0iMCwwLDEzMS41LDEzMS41Ij48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMTc0LjI1LC0xMTQuMjUpIj48ZyBkYXRhLXBhcGVyLWRhdGE9InsmcXVvdDtpc1BhaW50aW5nTGF5ZXImcXVvdDs6dHJ1ZX0iIGZpbGwtcnVsZT0ibm9uemVybyIgc3Ryb2tlLWxpbmVjYXA9ImJ1dHQiIHN0cm9rZS1saW5lam9pbj0ibWl0ZXIiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgc3Ryb2tlLWRhc2hhcnJheT0iIiBzdHJva2UtZGFzaG9mZnNldD0iMCIgc3R5bGU9Im1peC1ibGVuZC1tb2RlOiBub3JtYWwiPjxwYXRoIGQ9Ik0xNzcuNSwxODBjMCwtMzQuNTE3OCAyNy45ODIyLC02Mi41IDYyLjUsLTYyLjVjMzQuNTE3OCwwIDYyLjUsMjcuOTgyMiA2Mi41LDYyLjVjMCwzNC41MTc4IC0yNy45ODIyLDYyLjUgLTYyLjUsNjIuNWMtMzQuNTE3OCwwIC02Mi41LC0yNy45ODIyIC02Mi41LC02Mi41eiIgZmlsbD0iIzU0NTQ1NCIgc3Ryb2tlPSIjMjgyODI4IiBzdHJva2Utd2lkdGg9IjYuNSIvPjxwYXRoIGQ9Ik0xOTAuMDEzMTMsMTY0LjcxNTAxYy0wLjI5NzA0LC0yLjEzNTYyIDEuMTkzNDIsLTQuMTA3NjcgMy4zMjkwNCwtNC40MDQ3Mmw3LjczMzc2LC0xLjA3NTY4YzEuOTMzNDQsLTAuMjY4OTIgMy4wMzQ2MiwwLjU2MzMzIDQuMTM1OCwxLjM5NTZsNC40MDQ3MiwzLjMyOTA0YzEuMTAxMTgsMC44MzIyNiAyLjIwMjM2LDEuNjY0NTIgNC4xMzU4LDEuMzk1NmwxMS42MDA2NCwtMS42MTM1MmMxLjkzMzQ0LC0wLjI2ODkyIDIuNzY1NywtMS4zNzAxIDMuNTk3OTYsLTIuNDcxMjhsMy4zMjkwNCwtNC40MDQ3MmMwLjgzMjI2LC0xLjEwMTE4IDEuNjY0NTIsLTIuMjAyMzYgMy41OTc5NiwtMi40NzEyOGw0NC4zMjU5MSwtNi4xNjUyNGMyLjEzNTYyLC0wLjI5NzA0IDQuMTA3NjcsMS4xOTM0MiA0LjQwNDcyLDMuMzI5MDRsNS4zNzg0LDM4LjY2ODhjMC4yOTcwNCwyLjEzNTYyIC0xLjE5MzQyLDQuMTA3NjcgLTMuMzI5MDQsNC40MDQ3MmwtNDQuMzI1OTEsNi4xNjUyNGMtMS45MzM0NCwwLjI2ODkyIC0yLjc2NTcsMS4zNzAxIC0zLjU5Nzk2LDIuNDcxMjhsLTMuMzI5MDQsNC40MDQ3MmMtMC44MzIyNiwxLjEwMTE4IC0xLjY2NDUyLDIuMjAyMzYgLTMuNTk3OTYsMi40NzEyOGwtMTEuNjAwNjQsMS42MTM1MmMtMS45MzM0NCwwLjI2ODkyIC0zLjAzNDYyLC0wLjU2MzMzIC00LjEzNTgsLTEuMzk1NmwtNC40MDQ3MiwtMy4zMjkwNGMtMS4xMDExOCwtMC44MzIyNiAtMi4yMDIzNiwtMS42NjQ1MiAtNC4xMzU4LC0xLjM5NTZsLTcuNzMzNzYsMS4wNzU2OGMtMi4xMzU2MiwwLjI5NzA0IC00LjEwNzY3LC0xLjE5MzQyIC00LjQwNDcyLC0zLjMyOTA0eiIgZmlsbD0iI2ZmZmZmZiIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjAiLz48cGF0aCBkPSJNMjc4LjM2NzY5LDE3OS4xMjZsLTEuMDk0ODQsMy4yMzk3OWMtMC4zNjczNCwxLjA4NyAtMS41NDg4NSwxLjYzODk2IC0yLjYzNTA2LDEuMjcxODlsLTEuOTE0ODIsLTAuNjQ3MDhjLTAuODIzOTgsMS4yNjUyMiAtMS44MjExOCwyLjM4NTI3IC0yLjk0NTU5LDMuMzMwMTlsMC45MDQ2NywxLjg1NDY0YzAuMjQ0OSwwLjQ5NzU2IDAuMjgzNzMsMS4wNjExMiAwLjEwNTksMS41ODczNGMtMC4xNzkxMywwLjUyNDkgLTAuNTUwMDMsMC45NTE3NSAtMS4wNDY4LDEuMTk2OTJsLTMuMDY3NiwxLjUxNjAxYy0wLjQ5Njc3LDAuMjQ1MTcgLTEuMDYxNjQsMC4yODI2OCAtMS41ODc4NSwwLjEwNDg1Yy0wLjUyNzAxLC0wLjE3ODA5IC0wLjk1MjgsLTAuNTQ5NTEgLTEuMTk5MDEsLTEuMDQ4MzhsLTAuOTQ2MTUsLTEuOTA1NDFjLTEuNDA4MjQsMC4yODgwNiAtMi44NDYzOSwwLjM5MDEzIC00LjM0ODg2LDAuMjYwNDNsLTAuNjkxNDEsMi4wNDU5OGMtMC4zNjcwNywxLjA4NjIxIC0xLjUzMDg4LDEuNjY4NjYgLTIuNjE3MSwxLjMwMTU5bC0zLjI0MjE1LC0xLjA5NTY0Yy0xLjA4NjIxLC0wLjM2NzA3IC0xLjY0NDc5LC0xLjUzMTU3IC0xLjI3NzcyLC0yLjYxNzc4bDAuNjkxMTQsLTIuMDQ1MTljLTEuMjcyMSwtMC44MDg4MSAtMi4zNjEzOCwtMS43NjQ5OCAtMy4zMDYyMSwtMi44NDgyM2wtMS45MjE2NCwwLjkzOTc5Yy0wLjQ5NzU2LDAuMjQ0OSAtMS4wNjE2NCwwLjI4MjY4IC0xLjU4NzA3LDAuMTA1MTJjLTAuNTI1NDQsLTAuMTc3NTYgLTAuOTUwNDUsLTAuNTQ4NzEgLTEuMTk3MTksLTEuMDQ2MDJsLTEuNTE4NjMsLTMuMDY3NjFjLTAuMjQ1OTUsLTAuNDk3MDQgLTAuMjgyOTQsLTEuMDYzNDcgLTAuMTA1MTEsLTEuNTg5NjljMC4xNzc4MywtMC41MjYyMiAwLjU1MDA0LC0wLjk1NDM3IDEuMDQ3ODcsLTEuMjAwMDZsMS44NDM5NiwtMC45MTk2NmMtMC4zMjEsLTEuNDMyNSAtMC40MzQ2MiwtMi45MjcwNiAtMC4zMjA5LC00LjQzNDA1bC0xLjkxNDgyLC0wLjY0NzA4Yy0xLjA4NywtMC4zNjczNCAtMS42NzU3OSwtMS41MTc1NCAtMS4zMDg0NSwtMi42MDQ1NGwxLjA5NDg0LC0zLjIzOTc5YzAuMzY2MjcsLTEuMDgzODYgMS41Mzg3MSwtMS42NjA3NSAyLjYyNTcxLC0xLjI5MzQybDEuOTE0ODIsMC42NDcwOGMwLjgyMzczLC0xLjI2NzA2IDEuODE4NzksLTIuMzc4MiAyLjk0MzcyLC0zLjMyMjA3bC0wLjkwODg5LC0xLjg0NzMyYy0wLjI0Njc0LC0wLjQ5NzMgLTAuMjgyOTUsLTEuMDYwODUgLTAuMTA1MzgsLTEuNTg2MjhjMC4xNzUxNywtMC41MTgzNyAwLjU1NjMzLC0wLjk1NDg3IDEuMDQ3ODUsLTEuMTk3NDRsMy4wNjYwMywtMS41MTY1NGMwLjk5NjQzLC0wLjQ5MTExIDIuMjk3MzMsLTAuMDUyMzcgMi43ODg3LDAuOTQzMjhsMC45NTE2MywxLjkwOTg5YzEuNDA4MjQsLTAuMjg4MDYgMi44NTQ1MSwtMC4zODgyNiA0LjM1NTkzLC0wLjI1ODA0bDAuNjkxOTQsLTIuMDQ3NTVjMC4zNjcwNywtMS4wODYyMSAxLjUyMzM3LC0xLjY5MDQ0IDIuNjA5NTgsLTEuMzIzMzdsMy4yNDIxNSwxLjA5NTY0YzEuMDg2MjEsMC4zNjcwNyAxLjY1MjMxLDEuNTUzMzYgMS4yODUyNCwyLjYzOTU3bC0wLjY5MjIxLDIuMDQ4MzNjMS4yNzMxNSwwLjgwODI4IDIuMzU0NTcsMS43NjE4MSAzLjI5ODEsMi44NDM3NGwxLjkxNTg4LC0wLjk0MDg2YzAuOTkxNzIsLTAuNDkyNyAyLjI5MTgzLC0wLjA1NDIzIDIuNzgzOTksMC45NDE2OGwxLjUxOTE2LDMuMDY2MDRjMC4yNDQ2NSwwLjQ5NTcyIDAuMjgyNjgsMS4wNjE2NCAwLjEwNTEyLDEuNTg3MDdjLTAuMTc3ODMsMC41MjYyMiAtMC41NDk1MSwwLjk1MjggLTEuMDQ2NTUsMS4xOTg3NmwtMS44NDIxLDAuOTE0MTZjMC4zMjI1NywxLjQzMzAzIDAuNDM4ODUsMi45MTk3NCAwLjMyNTkxLDQuNDI2OTlsMS45MTQwMywwLjY0NjgyYzEuMDg2MjEsMC4zNjcwNyAxLjY4MzI5LDEuNTQxOTUgMS4zMTYyMywyLjYyNTU0ek0yNjUuOTg4MDMsMTc2Ljc0Nzc5YzEuMTUxMzcsLTMuNDA3MDggLTAuNzA2MjQsLTcuMTA4MTggLTQuMTQ1NTIsLTguMjcwNDRjLTMuNDM4NSwtMS4xNjE5OSAtNy4xNTg4MiwwLjY1NDEyIC04LjMxMDIsNC4wNjEyYy0xLjE1MDU4LDMuNDA0NzMgMC43MDQxNCw3LjEwOTIyIDQuMTQyNjQsOC4yNzEyMWMzLjQzOTI4LDEuMTYyMjYgNy4xNjE0NSwtMC42NTY3MyA4LjMxMzA5LC00LjA2MTk4eiIgZmlsbD0iIzU0NTQ1NCIgc3Ryb2tlPSIjMDAwMDAwIiBzdHJva2Utd2lkdGg9IjAiLz48L2c+PC9nPjwvc3ZnPjwhLS1yb3RhdGlvbkNlbnRlcjo2NS43NTo2NS43NDk5OTk5OTk5OTk5Ny0tPg==',
        blocks: [
          {
            blockType: Scratch.BlockType.REPORTER,
            opcode: 'toJSON',
            text: 'project json',
          },
          label('Threads'),
          /* managment */ {
            blockType: Scratch.BlockType.COMMAND,
            opcode: 'set_myself',
            text: 'use this place as command basis',
          },
          {
            blockType: Scratch.BlockType.REPORTER,
            opcode: 'get_myself_id',
            text: 'stored block sid',
          },
          {
            blockType: Scratch.BlockType.COMMAND,
            opcode: 'monitorThisThread',
            text: 'monitor current script w/ tid: [ID]',
            arguments: {
              ID: { type: 'string' },
            },
          },
          {
            blockType: Scratch.ArgumentType.BOOLEAN,
            opcode: 'isThreadWithIDrunning',
            text: 'is thread w/ tid: [ID] running?',
            arguments: {
              ID: { type: 'string' },
            },
          },
          {
            blockType: Scratch.BlockType.COMMAND,
            opcode: 'stopThreadWithID',
            text: 'stop thread w/ tid: [ID]',
            arguments: {
              ID: { type: 'string' },
            },
          },
          {
            blockType: Scratch.BlockType.COMMAND,
            opcode: 'restartThreadWithID',
            text: 'attempt restart thread w/ tid: [ID]',
            arguments: {
              ID: { type: 'string' },
            },
          },
          label('Blocks'),
          /* storage */ {
            blockType: Scratch.BlockType.COMMAND,
            opcode: 'setBlockViaID',
            text: 'set block w/ sid: [ID] to json: [block]',
            arguments: {
              ID: { type: 'string' },
              block: { type: 'string', defaultValue: '{}' },
            },
          },
          {
            blockType: Scratch.BlockType.REPORTER,
            opcode: 'getBlocksInThread',
            text: 'get blocks in thread w/ tid: [ID]',
            arguments: {
              ID: { type: 'string' },
            },
          },
          {
            blockType: Scratch.BlockType.REPORTER,
            opcode: 'getBlockViaID',
            text: 'get block w/ sid: [ID]',
            arguments: {
              ID: { type: 'string' },
            },
          },
          {
            blockType: Scratch.BlockType.COMMAND,
            opcode: 'storeInThread',
            text: 'store data in thread with key [key] and value [value]',
            arguments: {
              key: { type: 'string' },
              value: { type: 'string' },
            },
          },
          {
            blockType: Scratch.BlockType.REPORTER,
            opcode: 'getStoreInThread',
            text: 'get data with key [key] in thread data storage',
            arguments: {
              key: { type: 'string' },
            },
          },
          /* scripts */ '---',
          {
            blockType: Scratch.BlockType.COMMAND,
            opcode: 'deleteScriptViaThreadID',
            text: 'delete script w/ tid: [ID]',
            arguments: {
              ID: { type: 'string' },
            },
          },
          {
            blockType: Scratch.BlockType.COMMAND,
            opcode: 'toggleScriptViaThreadID',
            text: 'toggle script w/ tid: [ID]',
            arguments: {
              ID: { type: 'string' },
            },
          },
          {
            blockType: Scratch.BlockType.REPORTER,
            opcode: 'getScriptsInSprite',
            text: 'get all scripts in sprite containing thread of tid: [ID]',
            arguments: {
              ID: { type: 'string' },
            },
          },
          {
            blockType: Scratch.BlockType.REPORTER,
            opcode: 'getOuterC',
            text: 'get inner most c block relative to this block',
          },
          label('Other'),
          {
            opcode: 'runInSprite',
            blockType: Scratch.BlockType.CONDITIONAL,
            text: ['run code as [SPRITE]', 'and dont wait [DONT_WAIT]?'],
            arguments: {
              SPRITE: {
                type: Scratch.ArgumentType.STRING,
                menu: 'targets',
              },
              DONT_WAIT: {
                type: Scratch.ArgumentType.BOOLEAN,
              },
            },
          },
          /* inline tests */ {
            opcode: 'inline',
            text: 'inline',
            beInlineSM: 1,
          },
          {
            opcode: 'inlineReturn',
            blockType: Scratch.BlockType.COMMAND,
            text: 'inline return [value]',
            arguments: {
              value: { type: 'string' },
            },
            isTerminal: true,
          },
          {
            opcode: 'test_opcodesOf',
            text: 'get list of opcodes',
            beInlineSM: 1,
          },
          button('\u26a0 DANGEROUS OR BROKEN \u26a0', 'danger'),
          {
            blockType: Scratch.BlockType.COMMAND,
            opcode: 'forceRestartThreadWithID',
            text: 'force restart thread w/ tid: [ID] and update',
            arguments: {
              ID: { type: 'string' },
            },
          },
          {
            blockType: Scratch.BlockType.COMMAND,
            opcode: 'skipBlocks',
            text: 'restart thread and start [BLOCKS] blocks ahead',
            arguments: {
              BLOCKS: { type: 'number' },
            },
          },
        ],
        menus: {
          targets: {
            acceptReporters: true,
            items: this._getTargets('stage'),
          },
          targetsMyself: {
            acceptReporters: true,
            items: this._getTargets('stage', 'myself'),
          },
        },
      };
    }
    danger() {}
    _getTargets(stage, myself) {
      const spriteNames = [];
      if (stage) spriteNames.push({ text: 'Stage', value: '_stage_' });
      if (myself) spriteNames.push({ text: 'myself', value: '_myself_' });
      const targets = runtime.targets;
      for (let index = 1; index < targets.length; index++) {
        const targetName = targets[index].getName();
        spriteNames.push({
          text: targetName,
          value: targetName,
        });
      }
      if (spriteNames.length > 0) {
        return spriteNames;
      } else {
        return [{ text: '', value: 0 }]; //this should never happen but it's a failsafe
      }
    }
    stirSoup(idLength) {
      // https://github.com/TurboWarp/scratch-vm/blob/develop/src/util/uid.js
      const soup = '!#%()*+,-./:;=?@[]^_`{|}~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const id = [];
      for (let i = 0; i < idLength; i++) {
          id[i] = soup.charAt(Math.random() * soup.length);
      }
      return id.join('');
  }
    deleteScriptViaThreadID(args, util) {
      let block = monitoredThreads[args.ID].topBlock;
      //@ts-ignore Yes it does bitch
      vm.runtime.quietGlow(block);
      util.target.blocks._deleteScript(block);
      delete monitoredThreads[args.ID];
    }
    setBlockViaID(args, util) {
      util.target.blocks._blocks[args.ID] = JSON.parse(args.block);
      vm.runtime.requestBlocksUpdate();
    }
    toggleScriptViaThreadID(args, util) {
      vm.runtime.toggleScript(monitoredThreads[args.ID].topBlock, util.target);
    }
    getBlockViaID(args, util) {
      try {
        return JSON.stringify(util.target.blocks._blocks[args.ID]);
      } catch {
        return '{"error":"invalid block"}';
      }
    }
    get_myself_id() {
      return this.lastBlock;
    }
    set_myself(_, util) {
      this.lastBlock = util.thread.peekStack();
    }
    monitorThisThread(args, util) {
      monitoredThreads[args.ID] = util.thread;
    }
    isThreadWithIDrunning(args) {
      return vm.runtime.isActiveThread(monitoredThreads[args.ID] || { isKilled: true, stack: [] });
    }
    stopThreadWithID(args) {
      try {
        monitoredThreads[args.ID].stopThisScript();
      } catch {}
    }
    restartThreadWithID(args) {
      try {
        vm.runtime._restartThread(monitoredThreads[args.ID]);
      } catch {}
    }
    forceRestartThreadWithID(args, util) {
      try {
        monitoredThreads[args.ID] = vm.runtime._pushThread(monitoredThreads[args.ID].topBlock, util.target, { stackClick: true });
      } catch {}
    }
    storeInThread(args, util) {
      let thread = util.thread;
      if (!hasOwn(thread, 'customStorage')) thread.customStorage = {};
      thread.customStorage[args.key] = args.value;
    }
    getStoreInThread(args, util) {
      let thread = util.thread;
      if (!hasOwn(thread, 'customStorage')) thread.customStorage = {};
      if (!hasOwn(thread.customStorage, args.key)) return null;
      return thread.customStorage[args.key];
    }
    getBlocksInThread(args) {
      let thread = monitoredThreads[args.ID];
      let block = thread.blockContainer.getBlock(thread.topBlock);
      let found = [];
      while (block.next) {
        found.push(block.id);
        if (block.next) block = thread.blockContainer.getBlock(block.next);
      }
      found.push(block.id);
      return JSON.stringify(found);
    }
    getScriptsInSprite(args) {
      return JSON.stringify(monitoredThreads[args.ID].blockContainer.getScripts());
    }
    getOuterC(_, util) {
      return JSON.stringify(getOuterCblock(util.target, util.thread.peekStack()));
    }
    toJSON() {
      return vm.toJSON();
    }
    skipBlocks(args, util) {
      let thread = util.thread;
      let id = thread.peekStack();
      for (let i = 0; i <= Scratch.Cast.toNumber(args.BLOCKS) - 1; i++) {
        //@ts-ignore Nah boi, Ik what im doing.
        id = vm.runtime.targets[1].blocks.getNextBlock(id);
      }
      if (id) {
        thread.stopThisScript();
        vm.runtime._pushThread(id, util.target, { stackClick: true });
      }
    }
    skipBlock_SP(args, util) {
      /* interpreter only, sp made this */
      // start at -1 to skip over the starting block
      for (let i = -1; i < Scratch.Cast.toNumber(args.NUM); i++) {
        util.thread.goToNextBlock();
      }
    }
    /* code for inline blocks */
    spoofThread(Thread, thread, topBlock, target) {
      const myThreadOpts = { stackClick: thread.stackClick ?? false, updateMonitor: thread.updateMonitor ?? false };
      const warpMode = thread.stackFrames[thread.stackFrames.length - 1].warpMode;
      // @ts-ignore Not typed at all
      const myThread = new Thread(thread.topBlock, thread.target, myThreadOpts);
      myThread.stackFrames = [new _StackFrame(warpMode)];
      myThread.topBlock = topBlock ?? myThread.topBlock;
      myThread.stack = [myThread.topBlock];
      myThread.blockGlowInFrame = myThread.topBlock;
      myThread.target = target ?? myThread.target;
      myThread.blockContainer = myThread.target.blocks;
      for (const key of Object.keys(thread)) {
        if (hasOwn(myThread, key)) continue;
        myThread[key] = thread[key];
      }
      return myThread;
    }
    /* Thanks CST1229 */
    setGlobalStateThread(thread, sequencer) {
      if (!thread.isCompiled) return;
      const oldGenerator = thread.generator;
      thread.generator = { next: () => {} };
      sequencer.stepThread(thread);
      thread.generator = oldGenerator;
    }
    /**/
    myId(util) {
      return (util.thread.isCompiled ? util.thread.peekStack() : util.thread.peekStackFrame().op.id);
    }
    inline(_, util) {
      const thread = util.thread,
        Thread = thread.constructor,
        sequencer = util.sequencer;
      const myId = this.myId(util);
      if (!myId) return '';
      const blocks = thread.blockContainer;
      const substack = blocks.getBranch(myId);
      if (!substack) return '';
      var inlineThread = this.spoofThread(Thread, thread, substack, thread.target);
      (inlineThread.updateMonitor = false), (inlineThread.stackClick = true);
      const threadIndex = runtime.threads.indexOf(thread);
      runtime.threads.splice(threadIndex, 0, inlineThread);
      const altSequencer = new sequencer.constructor(runtime);
      altSequencer.stepThread(inlineThread);
      this.setGlobalStateThread(thread, sequencer);
      thread.goToNextBlock();
      if (thread.isCompiled) inlineThread.tryCompile();
      thread.pushStack(substack);
      util.thread = thread;
      util.sequencer = sequencer;
      inlineThread.dontStepJustThisOneTime = true;
      // @ts-ignore Not typed at all
      if (inlineThread.status === Thread.STATUS_DONE || hasOwn(inlineThread, 'inlineReturn')) {
        const returnValue = inlineThread.inlineReturn;
        if (!thread.isCompiled) setTimeout(() => runtime.visualReport(myId, returnValue), 0);
        return returnValue ?? '';
      }
      return new Promise((resolve) => {
        runtime.on('AFTER_EXECUTE', function afterExecute() {
          // @ts-ignore Not typed at all
          if (inlineThread.status === Thread.STATUS_DONE || hasOwn(inlineThread, 'inlineReturn')) {
            runtime.off('AFTER_EXECUTE', afterExecute);
            const returnValue = inlineThread.inlineReturn;
            console.log(thread.isCompiled);
            if (!thread.isCompiled) setTimeout(() => runtime.visualReport(myId, returnValue), 0);
            resolve(returnValue ?? '');
          }
        });
      });
    }
    inlineReturn(args, util) {
      const thread = util.thread;
      thread.inlineReturn = args.value;
      runtime._stopThread(thread);
    }
    test_opcodesOf(_, util) {
      const thread = util.thread;
      const blocks = thread.blockContainer;
      const substack = blocks.getBranch(thread.peekStack());
      const opcodes = [];
      let subblock = blocks.getBlock(substack);
      if (!subblock) return '[]';
      while (subblock.next !== null) {
        opcodes.push(subblock.opcode);
        subblock = blocks.getBlock(subblock.next);
      }
      if (subblock) opcodes.push(subblock.opcode);
      return JSON.stringify(opcodes);
    }
    /* end inline blocks */
    until(conditionFunction) {
      const poll = (resolve) => {
        if (conditionFunction()) resolve();
        else runtime.once('AFTER_EXECUTE', (_) => poll(resolve));
      };
      return new Promise(poll);
    }
    async runInSprite(args, util) {
      let SPRITE = Scratch.Cast.toString(args.SPRITE);
      const DONT_WAIT = Scratch.Cast.toBoolean(args.DONT_WAIT);
      let endTarget = undefined;
      // @ts-ignore Not typed yet
      if (SPRITE.toLowerCase() === '_stage_') endTarget = runtime._stageTarget;
      //if (SPRITE.toLowerCase() === '_myself_') endTarget = util.target;
      if (!endTarget) endTarget = runtime.getSpriteTargetByName(SPRITE);
      if (!endTarget) return 0;
      const thread = util.thread;
      const target = util.target;
      const blocks = target.blocks;
      const startBlock = blocks.getBranch(thread.peekStack(), 1);
      let cloneOver = [];
      let block = blocks.getBlock(startBlock);
      cloneOver.push(cloneBlock(block.id, target));
      while (block.next) {
        if (block.next) block = blocks.getBlock(block.next);
        cloneOver.push(cloneBlock(block.id, target));
      }
      // @ts-expect-error Not typed by me
      cloneOver[0].parent = null;
      for (let i = 0; i < cloneOver.length; i++) {
        const blocks2 = cloneOver[i];
        for (let j = 0; j < blocks2.length; j++) {
          block = blocks2[j];
          endTarget.blocks._blocks[block.id] = block;
        }
      }
      endTarget.blocks._addScript(startBlock);
      runtime.requestBlocksUpdate();
      vm.refreshWorkspace();
      var newThread = runtime._pushThread(startBlock, endTarget, {
          stackClick: true,
        }),
        threadDied = false;
      setTimeout(async () => {
        await this.until((_) => !runtime.isActiveThread(newThread) == true);
        threadDied = true;
        endTarget.blocks._deleteScript(newThread.topBlock);
        vm.emitWorkspaceUpdate();
      }, 0);
      if (DONT_WAIT) return 0;
      await this.until((_) => threadDied);
      return 0;
    }
  }
  /* I made this first with ScratchBlocks, then lily did smarter than me :cri: 
      https://github.com/LilyMakesThings/extensions/blob/Experiments/extensions/Lily/Experiments/inlineSimple.js
      I modified it alot for my uses :P */
  // @ts-ignore Not typed yet
  const cbfsb = runtime._convertBlockForScratchBlocks.bind(runtime);
  // @ts-ignore Not typed yet
  runtime._convertBlockForScratchBlocks = function (blockInfo, categoryInfo) {
    if (blockInfo.beInlineSM) {
      (blockInfo.blockType = Scratch.BlockType.BOOLEAN), (blockInfo.branchCount = 1);
      blockInfo.outputShape = 3;
      blockInfo.disableMonitor = true;
      if (!Array.isArray(blockInfo.text)) blockInfo.text = [blockInfo.text];
    }
    const res = cbfsb(blockInfo, categoryInfo);
    if (blockInfo.outputShape) res.json.outputShape = blockInfo.outputShape;
    return res;
  };
  //@ts-ignore
  Scratch.extensions.register(new extension());
})(Scratch);