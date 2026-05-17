/**!
 * Compiler Injector
 * @author 0znzw <meow@miyo.lol> (@link https://scratch.mit.edu/users/0znzw/)
 * @version 1.5
 * @license MIT AND LGPL-3.0
 * Do not remove this comment
 */
(function(Scratch) {
  if (!Scratch.extensions.unsandboxed) {
    throw new Error(`"Compiler Injector" extension must be ran unsandboxed!`);
  }
  
  const { vm, BlockType, ArgumentType } = Scratch, { runtime } = vm, extId = '0znzwCompilerPatching', uExtId = extId.toUpperCase();
  const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const referr = 'Non-variable was passed to asRef';
  const exports = (() => {
    let taco = false;
    const ve = vm.exports;
    const extras = {
      ...ve,
    };
    if (hasOwn(ve, 'i_will_not_ask_for_help_when_these_break')) {
      const iwnafhwtb = ve.i_will_not_ask_for_help_when_these_break();
      taco = hasOwn(iwnafhwtb, 'IntermediateStackBlock');
      return {
        ...extras,
        ...iwnafhwtb,
        ...iwnafhwtb.JSGenerator.unstable_exports,
        JSGP: iwnafhwtb.JSGenerator.prototype,
        STGP: iwnafhwtb.ScriptTreeGenerator.prototype,
        taco,
      };
    } else if (hasOwn(ve, 'JSGenerator') && hasOwn(ve, 'IRGenerator') && hasOwn(ve.IRGenerator, 'exports') && hasOwn(ve.IRGenerator.exports, 'ScriptTreeGenerator')) {
      const jsg = ve.JSGenerator, je = jsg.exports;
      extras.InputType = {
        NUMBER: je.TYPE_NUMBER,
        STRING: je.TYPE_STRING,
        UNKNOWN: je.TYPE_UNKNOWN,
        BOOLEAN: je.TYPE_UNKNOWN,
      };
      return {
        ...extras,
        JSGenerator: jsg,
        ...ve.IRGenerator.exports,
        ...ve.JSGenerator.exports,
        JSGP: ve.JSGenerator.prototype,
        STGP: ve.IRGenerator.exports.ScriptTreeGenerator.prototype,
      };
    } else {
      throw new Error(`The VM is outdated please use a version with a compiler and compiler exports.`);
    }
  })();
  if (exports.taco) {
    exports.asRaw = function(input) {
      input = String(input);
      if (input[0] === '"' && input[input.length - 1] === '"') return JSON.parse(input);
      return input;
    };
  } else {
    exports.asRaw = function(input) {
      if (input instanceof exports.ConstantInput || hasOwn(input, 'constantValue')) return input.constantValue;
      return input.asUnknown();
    };
  }
  exports.asRef = function(input, JSG) {
    if (!(!exports.taco && (input instanceof exports.VariableInput || hasOwn(input, '_value'))) && !(exports.taco && (input = String(input)) && input.startsWith('b') && input.endsWith('.value'))) {
      return (console.log(referr), `('${referr}')`);
    }
    if (input._value) return exports.asRaw(input._value);
    input = input?.source || input;
    const ref = input.slice(0, input.indexOf('.'));
    const src = Object.entries(JSG._setupVariables).find(entr => entr[1] === ref)[0];
    const target = src.startsWith('stage.variables') ? runtime.getTargetForStage() : JSG.target;
    const id = src.slice(src.indexOf('["') + 2, src.length - 2);
    return target.variables[id]?.value;
  };

  runtime.patchedOpcodes = new Map(), runtime.patchPresets = new Map();
  runtime.MioFunctions = new Map();
  runtime.patchedOpcodes.setOpcode = (function(opcode, position, js) {
    if (!runtime.patchedOpcodes.has(opcode)) {
      this.set(opcode, {
        ontop: null,
        before: '',
        after: '',
      });
    }
    runtime.patchedOpcodes.get(opcode)[position] = js;
  }).bind(runtime.patchedOpcodes);
  
  const PATCHES_ID = `__patches_${extId}__`;
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

  const { asRaw, asRef, STGP, JSGP, Frame } = exports;
  const descendPatchArgs = function(block) {
    let inputs = block?.inputs;
    if (!inputs) inputs = block;
    return Array.from(Object.entries(inputs).flatMap(entr => String(entr[0]).startsWith('ARG') ? [this.descendInputOfBlock(block, entr[0])] : []) || []);
  };
  function getPreset(name) {
    return '';
  }
  if (exports.taco) {
    const { InputType, IntermediateInput, IntermediateStackBlock, StackOpcode, InputOpcode } = exports;
    InputOpcode[`${uExtId}_OPPATCH`] = `${extId}.opPatch`;
    InputOpcode[`${uExtId}_NEWLINE`] = `${extId}.newline`;
    InputOpcode[`${uExtId}_PATCH_REPORTER`] = `${extId}.patchReporter`;
    InputOpcode[`${uExtId}_ALL_PATCHED`] = `${extId}.allPatched`;
    InputOpcode[`${uExtId}_IS_PATCHED`] = `${extId}.isPatched`;
    InputOpcode[`${uExtId}_USE_PRESET_REPORTER`] = `${extId}.presetReporter`;
    InputOpcode[`${uExtId}_REF_VARIABLE`] = `${extId}.refVariable`;
    InputOpcode[`${uExtId}_CALL_FN_REPORTER`] = `${extId}.callFnReporter`;
    StackOpcode[`${uExtId}_OPPATCH`] = `${extId}.opPatch`;
    StackOpcode[`${uExtId}_PATCH_COMMAND`] = `${extId}.patchCommand`;
    StackOpcode[`${uExtId}_PATCH_CONDITIONAL`] = `${extId}.patchWrapper`;
    StackOpcode[`${uExtId}_PATCH_OPCODE`] = `${extId}.patchOpcode`;
    StackOpcode[`${uExtId}_UNPATCH_OPCODE`] = `${extId}.unpatchOpcode`;
    StackOpcode[`${uExtId}_NEW_PRESET`] = `${extId}.newPreset`;
    StackOpcode[`${uExtId}_USE_PRESET_COMMAND`] = `${extId}.presetCommand`;
    StackOpcode[`${uExtId}_DEBUG_STATE`] = `${extId}.debugState`;
    StackOpcode[`${uExtId}_NEW_FN`] = `${extId}.newFn`;
    StackOpcode[`${uExtId}_CALL_FN_COMMAND`] = `${extId}.callFnCommand`;
    cst_patch(STGP, {
      descendInput(fn, block, ...args) {
        const patchedOpcode = runtime.patchedOpcodes.get(block.opcode);
        if (patchedOpcode) {
          return new IntermediateInput(InputOpcode[`${uExtId}_OPPATCH`], InputType.ANY, {
            node: fn(block, ...args),
            patchedOpcode,
          });
        }
        switch(block.opcode) {
          case `${extId}_newline`:
            return new IntermediateInput(InputOpcode[`${uExtId}_NEWLINE`], InputType.ANY, {});
          case `${extId}_patch_reporter`:
            return new IntermediateInput(InputOpcode[`${uExtId}_PATCH_REPORTER`], InputType.ANY, {
              args: descendPatchArgs.call(this, block),
            });
          case `${extId}_all_patched`:
            return new IntermediateInput(InputOpcode[`${uExtId}_ALL_PATCHED`], InputType.ANY, {});
          case `${extId}_is_patched`:
            return new IntermediateInput(InputOpcode[`${uExtId}_IS_PATCHED`], InputType.ANY, {
              opcode: this.descendInputOfBlock(block, 'OPCODE').toType(InputType.STRING),
            });
          case `${extId}_use_preset_reporter`:
            this.script.yields = true;
            return new IntermediateInput(InputOpcode[`${uExtId}_USE_PRESET_REPORTER`], InputType.ANY, {
              name: this.descendInputOfBlock(block, 'NAME').toType(InputType.STRING),
            });
          case `${extId}_ref_variable`:
            return new IntermediateInput(InputOpcode[`${uExtId}_REF_VARIABLE`], InputType.ANY, {
              var: this.descendInputOfBlock(block, 'VAR'),
            });
          case `${extId}_call_fn_reporter`:
            this.script.yields = true;
            return new IntermediateInput(InputOpcode[`${uExtId}_CALL_FN_REPORTER`], InputType.ANY, {
              name: this.descendInputOfBlock(block, 'NAME0').toType(InputType.STRING),
              args: descendPatchArgs.call(this, block),
            }, true);
          default:
            return fn(block, ...args);
        }
      },
      descendStackedBlock(fn, block, ...args) {
        const patchedOpcode = runtime.patchedOpcodes.get(block.opcode);
        if (patchedOpcode) {
          return new IntermediateStackBlock(StackOpcode[`${uExtId}_OPPATCH`], {
            node: fn(block, ...args),
            patchedOpcode,
          });
        }
        switch(block.opcode) {
          case `${extId}_patch_command`:
            return new IntermediateStackBlock(StackOpcode[`${uExtId}_PATCH_COMMAND`], {
              args: descendPatchArgs.call(this, block),
            });
          case `${extId}_patch_conditional`:
            return new IntermediateStackBlock(StackOpcode[`${uExtId}_PATCH_CONDITIONAL`], {
              js1: this.descendInputOfBlock(block, 'JSSTART'),
              stack: this.descendSubstack(block, 'SUBSTACK'),
              js2: this.descendInputOfBlock(block, 'JSEND'),
            });
          case `${extId}_patch_opcode`:
            return new IntermediateStackBlock(StackOpcode[`${uExtId}_PATCH_OPCODE`], {
              opcode: this.descendInputOfBlock(block, 'OPCODE').toType(InputType.STRING),
              position: this.descendInputOfBlock(block, 'POS').toType(InputType.STRING),
              js: this.descendInputOfBlock(block, 'JS'),
            });
          case `${extId}_unpatch_opcode`:
            return new IntermediateStackBlock(StackOpcode[`${uExtId}_UNPATCH_OPCODE`], {
              opcode: this.descendInputOfBlock(block, 'OPCODE').toType(InputType.STRING),
            });
          case `${extId}_new_preset`:
            return new IntermediateStackBlock(StackOpcode[`${uExtId}_NEW_PRESET`], {
              name: this.descendInputOfBlock(block, 'NAME').toType(InputType.STRING),
              id: block.id,
            });
          case `${extId}_use_preset_command`:
            this.script.yields = true;
            return new IntermediateStackBlock(StackOpcode[`${uExtId}_USE_PRESET_COMMAND`], {
              name: this.descendInputOfBlock(block, 'NAME').toType(InputType.STRING),
            });
          case `${extId}_debug_state`:
            debugger;
            return new IntermediateStackBlock(StackOpcode[`${uExtId}_DEBUG_STATE`], {});
          case `${extId}_new_fn`:
            this.script.yields = true;
            return new IntermediateStackBlock(StackOpcode[`${uExtId}_NEW_FN`], {
              name: this.descendInputOfBlock(block, 'NAME0').toType(InputType.STRING),
              stack: this.descendSubstack(block, Object.keys(block.inputs).find(key => key.startsWith('SUBSTACK'))),
              args: descendPatchArgs.call(this, block).map(arg => arg.toType(InputType.STRING)),
            });
          case `${extId}_call_fn_command`:
            this.script.yields = true;
            return new IntermediateStackBlock(StackOpcode[`${uExtId}_CALL_FN_COMMAND`], {
              name: this.descendInputOfBlock(block, 'NAME0').toType(InputType.STRING),
              args: descendPatchArgs.call(this, block),
            });
          default:
            return fn(block, ...args);
        }
      },
    });
    cst_patch(JSGP, {
      descendInput(fn, block, ...args) {
        const node = block.inputs; 
        switch(block.opcode) {
          case InputOpcode[`${uExtId}_NEWLINE`]:
            return '\n';
          case InputOpcode[`${uExtId}_OPPATCH`]:
            return `${node.patchedOpcode.before ?? ''}
  ${node.patchedOpcode.ontop !== null ? node.patchedOpcode.ontop : this.descendInput(node.node)}
  ${node.patchedOpcode.after ?? ''}`;
          case InputOpcode[`${uExtId}_PATCH_REPORTER`]:
            return node.args.map(arg => asRaw(this.descendInput(arg)) || '').join('') || '';
          case InputOpcode[`${uExtId}_ALL_PATCHED`]:
            return '(JSON.stringify(Array.from(runtime.patchedOpcodes.keys())))';
          case InputOpcode[`${uExtId}_IS_PATCHED`]:
            return `(runtime.patchedOpcodes.has(${this.descendInput(node.opcode)}))`;
          case InputOpcode[`${uExtId}_PRESET_REPORTER`]:
            return getPreset.call(this, node.name);
          case InputOpcode[`${uExtId}_REF_VARIABLE`]:
            return asRef(this.descendInput(node.var), this);
          case InputOpcode[`${uExtId}_CALL_FN_REPORTER`]:
            return `(yield* ((runtime.MioFunctions.get(${this.descendInput(node.name)}) || function*(){})(${node.args.map(arg => this.descendInput(arg)).join(',') || ''})))`;
          default:
            return fn(block, ...args);
        }
      },
      descendStackedBlock(fn, block, ...args) {
        const node = block.inputs; 
        switch(block.opcode) {
          case StackOpcode[`${uExtId}_OPPATCH`]:
            this.source += node.patchedOpcode.before ?? '';
            if (node.patchedOpcode.ontop) {
              this.source += node.patchedOpcode.ontop;
            } else this.descendStackedBlock(node.node);
            this.source += node.patchedOpcode.after ?? '';
            break;
          case StackOpcode[`${uExtId}_PATCH_COMMAND`]:
            this.source += node.args.map(arg => asRaw(this.descendInput(arg)) || '').join('') || '';
            break;
          case StackOpcode[`${uExtId}_PATCH_CONDITIONAL`]:
            this.source += asRaw(this.descendInput(node.js1)) + '\n';
            this.descendStack(node.stack, new Frame(false));
            this.source += '\n' + asRaw(this.descendInput(node.js2));
            break;
          case StackOpcode[`${uExtId}_PATCH_OPCODE`]:
            this.source += `runtime.patchedOpcodes.setOpcode(${this.descendInput(node.opcode)}, ${this.descendInput(node.position)}, ${this.descendInput(node.js)});`;
            break;
          case StackOpcode[`${uExtId}_UNPATCH_OPCODE`]:
            this.source += `runtime.patchedOpcodes.delete(${this.descendInput(node.opcode)});`;
            break;
          case StackOpcode[`${uExtId}_NEW_PRESET`]:
            this.source += `runtime.patchPresets.set(${this.descendInput(node.name)}, "${node.id}");`;
            break;
          case StackOpcode[`${uExtId}_PRESET_COMMAND`]:
            this.source += getPreset.call(this, node.name);
            break;
          case StackOpcode[`${uExtId}_DEBUG_STATE`]:
            debugger;
            this.source += `console.log('Debug state over');\n`
            break;
          case StackOpcode[`${uExtId}_NEW_FN`]: {
            const oldSource = this.source;
            this.source = '';
            this.descendStack(node.stack, new Frame(false));
            const stack = this.source;
            this.source = oldSource;
            const header = `\n${Object.entries(this._setupVariables).map(entr => `let ${entr[1]} = ${entr[0]};\n`).join('')}`;
            this.source += `runtime.MioFunctions.set(${this.descendInput(node.name)}, function*(${node.args.flatMap(arg => {
              arg = String(this.descendInput(arg));
              if (arg.startsWith('"') && arg.endsWith('"')) arg = JSON.parse(arg);
              if (/([A-Z])([a-zA-Z0-9$_]+)/gi.test(arg)) return [arg];
              return [];
            }).join(',') || ''}) {${header}${stack}\n});\n`;
            break;
          };
          case StackOpcode[`${uExtId}_CALL_FN_COMMAND`]:
            this.source += `yield* ((runtime.MioFunctions.get(${this.descendInput(node.name)}) || function*(){})(${node.args.map(arg => this.descendInput(arg)).join(',') || ''}));\n`;
            break;
          default:
            return fn(block, ...args);
        }
      }
    });
  } else {
    const { TypedInput, TYPE_UNKNOWN, TYPE_BOOLEAN, TYPE_STRING } = exports;
    cst_patch(STGP, {
      descendInput(fn, block, ...args) {
        const patchedOpcode = runtime.patchedOpcodes.get(block.opcode);
        if (patchedOpcode) {
          return {
            kind: `${extId}.opPatch`,
            node: fn(block, ...args),
            patchedOpcode,
          };
        }
        switch(block.opcode) {
          case `${extId}_newline`:
            return {
              kind: `${extId}.newline`,
            };
          case `${extId}_patch_reporter`:
            return {
              kind: `${extId}.patchReporter`,
              args: descendPatchArgs.call(this, block),
            };
          case `${extId}_all_patched`:
            return {
              kind: `${extId}.allPatched`,
            };
          case `${extId}_is_patched`:
            return {
              kind: `${extId}.isPatched`,
              opcode: this.descendInputOfBlock(block, 'OPCODE'),
            };
          case `${extId}_use_preset_reporter`:
            this.script.yields = true;
            return {
              kind: `${extId}.presetReporter`,
              name: this.descendInputOfBlock(block, 'NAME'),
            };
          case `${extId}_ref_variable`:
            return {
              kind: `${extId}.refVariable`,
              var: this.descendInputOfBlock(block, 'VAR'),
            };
          case `${extId}_call_fn_reporter`:
            this.script.yields = true;
            return {
              kind: `${extId}.callFnReporter`,
              name: this.descendInputOfBlock(block, 'NAME0'),
              args: descendPatchArgs.call(this, block),
            };
          default:
            return fn(block, ...args);
        }
      },
      descendStackedBlock(fn, block, ...args) {
        const patchedOpcode = runtime.patchedOpcodes.get(block.opcode);
        if (patchedOpcode) {
          return {
            kind: `${extId}.opPatch`,
            node: fn(block, ...args),
            patchedOpcode,
          };
        }
        switch(block.opcode) {
          case `${extId}_patch_command`:
            return {
              kind: `${extId}.patchCommand`,
              args: descendPatchArgs.call(this, block),
            };
          case `${extId}_patch_conditional`:
            return {
              kind: `${extId}.patchWrapper`,
              js1: this.descendInputOfBlock(block, 'JSSTART'),
              stack: this.descendSubstack(block, 'SUBSTACK'),
              js2: this.descendInputOfBlock(block, 'JSEND'),
            };
          case `${extId}_patch_opcode`:
            return {
              kind: `${extId}.patchOpcode`,
              opcode: this.descendInputOfBlock(block, 'OPCODE'),
              position: this.descendInputOfBlock(block, 'POS'),
              js: this.descendInputOfBlock(block, 'JS'),
            };
          case `${extId}_unpatch_opcode`:
            return {
              kind: `${extId}.unpatchOpcode`,
              opcode: this.descendInputOfBlock(block, 'OPCODE'),
            };
          case `${extId}_new_preset`:
            return {
              kind: `${extId}.newPreset`,
              name: this.descendInputOfBlock(block, 'NAME'),
              id: block.id,
            };
          case `${extId}_use_preset_command`:
            this.script.yields = true;
            return {
              kind: `${extId}.presetCommand`,
              name: this.descendInputOfBlock(block, 'NAME'),
            };
          case `${extId}_debug_state`:
            debugger;
            return {
              kind: `${extId}.debugState`,
            };
          case `${extId}_new_fn`:
            this.script.yields = true;
            return {
              kind: `${extId}.newFn`,
              name: this.descendInputOfBlock(block, 'NAME0'),
              stack: this.descendSubstack(block, Object.keys(block.inputs).find(key => key.startsWith('SUBSTACK'))),
              args: descendPatchArgs.call(this, block),
            };
          case `${extId}_call_fn_command`:
            this.script.yields = true;
            return {
              kind: `${extId}.callFnCommand`,
              name: this.descendInputOfBlock(block, 'NAME0'),
              args: descendPatchArgs.call(this, block),
            };
          default:
            return fn(block, ...args);
        }
      },
    });
    cst_patch(JSGP, {
      descendInput(fn, node, ...args) {
        switch(node.kind) {
          case `${extId}.newline`:
            return new TypedInput('\n', TYPE_UNKNOWN);
          case `${extId}.opPatch`:
            return new TypedInput(`${node.patchedOpcode.before ?? ''}
  ${node.patchedOpcode.ontop !== null ? node.patchedOpcode.ontop : this.descendInput(node.node).asUnknown()}
  ${node.patchedOpcode.after ?? ''}`, TYPE_UNKNOWN);
          case `${extId}.patchReporter`:
            return new TypedInput(node.args.map(arg => asRaw(this.descendInput(arg)) || '').join('') || '', TYPE_UNKNOWN);
          case `${extId}.allPatched`:
            return new TypedInput(`(JSON.stringify(Array.from(runtime.patchedOpcodes.keys())))`, TYPE_STRING);
          case `${extId}.isPatched`:
            return new TypedInput(`(runtime.patchedOpcodes.has(${this.descendInput(node.opcode).asString()}))`, TYPE_BOOLEAN);
          case `${extId}.presetReporter`:
            return new TypedInput(getPreset.call(this, node.name), TYPE_UNKNOWN);
          case `${extId}.refVariable`:
            return new TypedInput(asRef(this.descendInput(node.var), this), TYPE_UNKNOWN);
          case `${extId}.callFnReporter`:
            return new TypedInput(`(yield* ((runtime.MioFunctions.get(${this.descendInput(node.name).asString()}) || function*(){}))(${node.args.map(arg => this.descendInput(arg).asSafe()).join(',') || ''}))`, TYPE_UNKNOWN);
          default:
            return fn(node, ...args);
        }
      },
      descendStackedBlock(fn, node, ...args) {
        switch(node.kind) {
          case `${extId}.opPatch`:
            this.source += node.patchedOpcode.before ?? '';
            if (node.patchedOpcode.ontop) {
              this.source += node.patchedOpcode.ontop;
            } else this.descendStackedBlock(node.node);
            this.source += node.patchedOpcode.after ?? '';
            break;
          case `${extId}.patchCommand`:
            this.source += node.args.map(arg => asRaw(this.descendInput(arg)) || '').join('') || '';
            break;
          case `${extId}.patchWrapper`:
            this.source += asRaw(this.descendInput(node.js1)) + '\n';
            this.descendStack(node.stack, new Frame(false));
            this.source += '\n' + asRaw(this.descendInput(node.js2));
            break;
          case `${extId}.patchOpcode`:
            this.source += `runtime.patchedOpcodes.setOpcode(${this.descendInput(node.opcode).asString()}, ${this.descendInput(node.position).asString()}, ${this.descendInput(node.js).asString()});`;
            break;
          case `${extId}.unpatchOpcode`:
            this.source += `runtime.patchedOpcodes.delete(${this.descendInput(node.opcode).asString()});`;
            break;
          case `${extId}.newPreset`:
            this.source += `runtime.patchPresets.set(${this.descendInput(node.name).asString()}, "${node.id}");`;
            break;
          case `${extId}.presetCommand`:
            this.source += getPreset.call(this, node.name);
            break;
          case `${extId}.debugState`:
            debugger;
            this.source += `console.log('Debug state over');\n`
            break;
          case `${extId}.newFn`: {
            const oldSource = this.source;
            this.source = '';
            this.descendStack(node.stack, new Frame(false));
            const stack = this.source;
            this.source = oldSource;
            const header = `\n${Object.entries(this._setupVariables).map(entr => `let ${entr[1]} = ${entr[0]};\n`).join('')}`;
            this.source += `runtime.MioFunctions.set(${this.descendInput(node.name).asString()}, function*(${node.args.flatMap(arg => {
              arg = String(this.descendInput(arg).asSafe());
              if (arg.startsWith('"') && arg.endsWith('"')) arg = JSON.parse(arg);
              if (/([A-Z])([a-zA-Z0-9$_]+)/gi.test(arg)) return [arg];
              return [];
            }).join(',') || ''}) {${header}${stack}\n});\n`;
            break;
          };
          case `${extId}.callFnCommand`:
            this.source += `yield* ((runtime.MioFunctions.get(${this.descendInput(node.name).asString()}) || function*(){})(${node.args.map(arg => this.descendInput(arg).asSafe()).join(',') || ''}));\n`;
            break;
          default:
            return fn(node, ...args);
        }
      }
    });
  }
  
  class extension {
    getInfo() {
      return {
        id: extId,
        name: 'Compiler Injector',
        blocks: [{
          blockType: BlockType.BUTTON,
          text: runtime.debug ? 'Disable debug' : 'Enable debug',
          func: 'DEBUG',
        }, {
          blockType: BlockType.COMMAND,
          opcode: 'debug_state',
          text: 'debug compiler state',
        }, '---', {
          blockType: BlockType.REPORTER,
          opcode: 'newline',
          text: 'newline',
          allowDropAnywhere: true,
          disableMonitor: true,
        }, {
          blockType: BlockType.COMMAND,
          opcode: 'patch_command',
          text: 'inject js',
          mutator: `mio_${extId}_extendable`,
          extensions: [`mio_${extId}_extendable_string`],
          func: 'interpreter_error',
        }, {
          blockType: BlockType.REPORTER,
          opcode: 'patch_reporter',
          text: 'inject js',
          allowDropAnywhere: true,
          disableMonitor: true,
          mutator: `mio_${extId}_extendable`,
          extensions: [`mio_${extId}_extendable_string`],
          func: 'interpreter_error',
        }, {
          blockType: BlockType.CONDITIONAL,
          opcode: 'patch_conditional',
          text: ['inject js [JSSTART]', '[JSEND]'],
          arguments: {
            JSSTART: { type: ArgumentType.STRING, defaultValue: 'if (1) {' },
            JSEND: { type: ArgumentType.STRING, defaultValue: '};' },
          },
          branchCount: 1,
          func: 'interpreter_error',
        }, '---', {
          blockType: BlockType.REPORTER,
          opcode: 'ref_variable',
          text: 'inject variable [VAR]',
          arguments: {
            VAR: { type: null },
          },
          allowDropAnywhere: true,
          func: 'interpreter_error',
        }, {
          blockType: BlockType.COMMAND,
          opcode: 'patch_opcode',
          text: 'inject js [JS] [POS] opcode [OPCODE]',
          arguments: {
            OPCODE: { type: ArgumentType.STRING, defaultValue: 'motion_direction' },
            JS: { type: ArgumentType.STRING, defaultValue: 'alert(1);' },
            POS: { menu: 'inject_type' },
          },
          func: 'interpreter_error',
        }, {
          blockType: BlockType.COMMAND,
          opcode: 'unpatch_opcode',
          text: 'uninject opcode [OPCODE]',
          arguments: {
            OPCODE: { type: ArgumentType.STRING, defaultValue: 'motion_direction' },
          },
          func: 'interpreter_error',
        }, {
          blockType: BlockType.REPORTER,
          opcode: 'all_patched',
          text: 'patched opcodes',
          disableMonitor: true,
          func: 'interpreter_error',
        }, {
          blockType: BlockType.BOOLEAN,
          opcode: 'is_patched',
          text: 'is [OPCODE] patched?',
          arguments: {
            OPCODE: { type: ArgumentType.STRING, defaultValue: 'motion_direction' },
          },
          func: 'interpreter_error',
        }, '---',  {
          blockType: BlockType.CONDITIONAL,
          opcode: 'new_preset',
          text: 'create preset [NAME] using',
          arguments: {
            NAME: { type: ArgumentType.STRING, defaultValue: 'my preset' },
          },
          hideFromPalette: true,
          func: 'interpreter_error',
        }, {
          blockType: BlockType.COMMAND,
          opcode: 'use_preset_command',
          text: 'inject preset [NAME]',
          arguments: {
            NAME: { type: ArgumentType.STRING, defaultValue: 'my preset' },
          },
          hideFromPalette: true,
          func: 'interpreter_error',
        }, {
          blockType: BlockType.REPORTER,
          opcode: 'use_preset_reporter',
          text: 'inject preset [NAME]',
          arguments: {
            NAME: { type: ArgumentType.STRING, defaultValue: 'my preset' },
          },
          allowDropAnywhere: true,
          hideFromPalette: true,
          func: 'interpreter_error',
        }, '---', {
          blockType: BlockType.COMMAND,
          opcode: 'new_fn',
          text: 'new function',
          mutator: `mio_${extId}_extendable`,
          extensions: [`mio_${extId}_extendable_newfn`],
          func: 'interpreter_error',
        }, {
          blockType: BlockType.COMMAND,
          opcode: 'call_fn_command',
          text: 'run function',
          mutator: `mio_${extId}_extendable`,
          extensions: [`mio_${extId}_extendable_callfn`],
          func: 'interpreter_error',
        }, {
          blockType: BlockType.REPORTER,
          opcode: 'call_fn_reporter',
          text: 'run function',
          allowDropAnywhere: true,
          disableMonitor: true,
          mutator: `mio_${extId}_extendable`,
          extensions: [`mio_${extId}_extendable_callfn`],
          func: 'interpreter_error',
        }],
        menus: {
          inject_type: {
            acceptReporters: true,
            items: [{text: 'overtop of', value: 'ontop'}, 'before', 'after'],
          },
        },
      };
    }
    DEBUG() {
      runtime.debug = !runtime.debug;
      vm.extensionManager.refreshBlocks();
      console.log(runtime.debug ? 'Enabled compiler logs' : 'Disabled compiler logs');
    }
    debug_state() {
      debugger;
      console.log('Debug state over');
    }
    newline() {
      return '\n';
    }
    patch_command() {}
    patch_reporter() {}
    patch_conditional() {}
    ref_variable() {}
    patch_opcode() {}
    precompile() {}
    all_patched() {}
    is_patched() {}
    unpatch_opcode() {}
    new_preset() {}
    use_preset_command() {}
    use_preset_reporter() {}
    new_fn() {}
    call_fn_command() {}
    call_fn_reporter() {}
    interpreter_error(_, util) {
      const blockId = util.thread.isCompiled ? util.thread.peekStack() : util.thread.peekStackFrame().op.id;
      let err = 'This block cannot be ran in the interpreter.';
      if (!util.target.blocks.getBlock(blockId)) err += '\nBeing in the flyout may also cause issues.';
      runtime.visualReport(blockId, util.thread.isCompiled ? 'How did we get here...' : err);
    }
  }

  // https://github.com/TurboWarp/extensions/pull/1254/files
  const cbfsb = runtime._convertBlockForScratchBlocks.bind(runtime);
  runtime._convertBlockForScratchBlocks = function (blockInfo, categoryInfo) {
    const res = cbfsb(blockInfo, categoryInfo);
    if (blockInfo.mutator) res.json.mutator = blockInfo.mutator;
    return res;
  };
  if (Scratch.gui) Scratch.gui.getBlockly().then(ScratchBlocks => {
    const allExtensions = ScratchBlocks.Extensions.ALL_;

    const leftArrowIcon = `data:image/svg+xml;base64,PHN2ZyBkYXRhLW5hbWU9IkxheWVyIDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwIDEzIiB0cmFuc2Zvcm09InNjYWxlKC0xLCAxKSI+PHBhdGggZD0iTTMuNjUuMTQ1YTIuNDEgMi40MSAwIDAgMSAxLjcyLjcxbDMuOTIgMy45MmEyLjQ1IDIuNDUgMCAwIDEgMCAzLjQ1bC0zLjkyIDMuOTFhMi40MiAyLjQyIDAgMCAxLTEuNzIuNzIgMi40OCAyLjQ4IDAgMCAxLTEuNzMtLjcxYy0uMjQtLjI5LS43MS0uNzItLjcxLTUuNjUgMC00LjkzLjQ2LTUuMzkuNzEtNS42NGEyLjQ0IDIuNDQgMCAwIDEgMS43My0uNzF6IiBmaWxsPSIjMjMxZjIwIiBvcGFjaXR5PSIuMSIvPjxwYXRoIGQ9Ik04Ljk4NSA2LjUxYTEuNDMgMS40MyAwIDAgMS0uNDIgMWwtMy45MiAzLjk0YTEuNDQgMS40NCAwIDAgMS0yIDBjLS41Ni0uNTYtLjU2LTkuMzEgMC05Ljg3YTEuNDQgMS40NCAwIDAgMSAyIDBsMy45MiAzLjkyYTEuNDMgMS40MyAwIDAgMSAuNDIgMS4wMXoiIGZpbGw9IiNmZmYiLz48L3N2Zz4=`;
    const rightArrowIcon = `data:image/svg+xml;base64,PHN2ZyBkYXRhLW5hbWU9IkxheWVyIDEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDEwIDEzIj48cGF0aCBkPSJNMy42NS4xNDVhMi40MSAyLjQxIDAgMCAxIDEuNzIuNzFsMy45MiAzLjkyYTIuNDUgMi40NSAwIDAgMSAwIDMuNDVsLTMuOTIgMy45MWEyLjQyIDIuNDIgMCAwIDEtMS43Mi43MiAyLjQ4IDIuNDggMCAwIDEtMS43My0uNzFjLS4yNC0uMjktLjcxLS43Mi0uNzEtNS42NSAwLTQuOTMuNDYtNS4zOS43MS01LjY0YTIuNDQgMi40NCAwIDAgMSAxLjczLS43MXoiIGZpbGw9IiMyMzFmMjAiIG9wYWNpdHk9Ii4xIi8+PHBhdGggZD0iTTguOTg1IDYuNTFhMS40MyAxLjQzIDAgMCAxLS40MiAxbC0zLjkyIDMuOTRhMS40NCAxLjQ0IDAgMCAxLTIgMGMtLjU2LS41Ni0uNTYtOS4zMSAwLTkuODdhMS40NCAxLjQ0IDAgMCAxIDIgMGwzLjkyIDMuOTJhMS40MyAxLjQzIDAgMCAxIC40MiAxLjAxeiIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==`;
    const arrowWidth = 16;
    const arrowHeight = 32;
    class FieldImageButton extends ScratchBlocks.FieldImage {
      constructor(src, width, height, callback, opt_alt, flip_rtl, noPadding) {
        super(src, width, height, opt_alt, flip_rtl);
        this._callback = callback.bind(this);
        this.noPadding = noPadding;
      }
      init() {
        if (this.fieldGroup_) {
          return;
        }
        super.init();
        this.mouseDownWrapper_ = ScratchBlocks.bindEventWithChecks_(
          this.getSvgRoot(),
          'mousedown',
          this,
          this.onMouseDown_
        );
        this.getSvgRoot().style.cursor = 'pointer';
      }
      showEditor_() {
        if (this._callback) {
          this._callback();
        }
      }
      getSize() {
        if (!this.size_.width) {
          this.render_();
        }
        if (!this.noPadding) return this.size_;
        return new this.size_.constructor(
          Math.max(1, this.size_.width - ScratchBlocks.BlockSvg.SEP_SPACE_X),
          this.size_.height
        );
      }
      EDITABLE = true;
    }
    ScratchBlocks.FieldImageButton = FieldImageButton;
    if (!allExtensions?.[`mio_${extId}_extendable`]) ScratchBlocks.Extensions.registerMutator(`mio_${extId}_extendable`, {
        domToMutation(xmlElement) {
          this.inputCount = Math.floor(
            Number(xmlElement.getAttribute('inputcount'))
          );
          this.inputCount = Math.min(
            Math.max(this.minInputs, this.inputCount),
            this.maxInputs
          );
          if (isNaN(this.inputCount) || !Number.isFinite(this.inputCount))
            this.inputCount = this.minInputs;
          this.prevInputCount = this.inputCount;
          this.updateDisplay_(true);
        },
        mutationToDom() {
          const container = document.createElement('mutation');
          container.setAttribute('inputcount', this.inputCount.toString());
          return container;
        },
        isExtendableInput(input) {
          return (
            input.name.startsWith('ARROW_') ||
            this.extendableDefs.some((def) => input.name.startsWith(def.id)) ||
            this.extendableDefsStart.some((def) =>
              input.name.startsWith(def.id)
            ) ||
            this.extendableDefsEnd.some((def) => input.name.startsWith(def.id))
          );
        },
        disconnectOldBlocks_() {
          const connectionMap = {};
          const hasEndBlocks = this.extendableDefsEnd.length > 0;
          const hasStartBlocks = this.extendableDefsStart.length > 0;
          const prevEndIndex = this.prevInputCount + (this.extendableDefsStart.length > 0);
          const reattachMap = Object.create(null);
          if (hasEndBlocks) {
            for (const def of this.extendableDefsEnd) {
              const input = this.getInput(
                this.getExtendableInput(def.id, prevEndIndex)
              );
              if (input && input.connection) {
                reattachMap[input.name] = def.id;
              }
            }
          }
          for (const input of this.inputList) {
            if (input.connection && this.isExtendableInput(input)) {
              const target = input.connection.targetBlock();
              const saveInfo = {
                shadow: input.connection.getShadowDom(),
                block: target,
              };
              let name = input.name;
              if (reattachMap[name]) {
                name = this.getExtendableInput(
                  reattachMap[name],
                  this.inputCount + hasStartBlocks
                );
                if (connectionMap[name]) {
                  connectionMap['$UNUSED' + name] = connectionMap[name];
                  delete connectionMap[name];
                }
              }
              if (connectionMap[name]) {
                connectionMap['$UNUSED' + name] = saveInfo;
              } else {
                connectionMap[name] = saveInfo;
              }
              input.connection.setShadowDom(null);
              if (target) {
                input.connection.disconnect();
              }
            }
          }
          return connectionMap;
        },
        removeAllInputs_() {
          this.inputList = this.inputList.filter((input) => {
            if (
              this.isExtendableInput(input) ||
              (input.type === ScratchBlocks.DUMMY_INPUT && this.clearLabels)
            ) {
              input.dispose();
              return false;
            }
            return true;
          });
        },
        attachShadow_(input, def) {
          if (!def.shadowType) return;
          ScratchBlocks.Events.disable();
          let newBlock;
          try {
            newBlock = this.workspace.newBlock(def.shadowType);
            newBlock.setFieldValue(def.shadowDefault, def.shadowField);
            newBlock.setShadow(true);
            if (!this.isInsertionMarker()) {
              newBlock.initSvg();
              newBlock.render(false);
            }
          } finally {
            ScratchBlocks.Events.enable();
          }
          if (ScratchBlocks.Events.isEnabled()) {
            ScratchBlocks.Events.fire(
              new ScratchBlocks.Events.BlockCreate(newBlock)
            );
          }
          if (newBlock.outputConnection)
            newBlock.outputConnection.connect(input.connection);
          else newBlock.previousConnection.connect(input.connection);
        },
        buildShadowDom_(def) {
          const shadowDom = document.createElement('shadow');
          shadowDom.setAttribute('type', def.shadowType);
          const fieldDom = document.createElement('field', null);
          fieldDom.setAttribute('name', def.shadowField);
          shadowDom.appendChild(fieldDom);
          return shadowDom;
        },
        populateArgument_(connectionMap, id, input, def) {
          let oldBlock = null;
          let oldShadow = null;
          if (connectionMap && id in connectionMap) {
            const saveInfo = connectionMap[id];
            oldBlock = saveInfo['block'];
            oldShadow = saveInfo['shadow'];
          }
          if (connectionMap && oldBlock) {
            connectionMap[id] = null;
            if (oldBlock.outputConnection)
              oldBlock.outputConnection.connect(input.connection);
            else oldBlock.previousConnection.connect(input.connection);
            if (def.shadowType) {
              const shadowDom = oldShadow || this.buildShadowDom_(def);
              input.connection.setShadowDom(shadowDom);
            }
          } else {
            this.attachShadow_(input, def);
          }
        },
        cleanInputs() {
          const target = Scratch.vm.editingTarget;
          if (!target) return;
          const blocks = this.isInFlyout
            ? Scratch.vm.runtime.flyoutBlocks
            : target.blocks;
          const vmBlock = blocks.getBlock(this.id);
          if (!vmBlock) return;
          const usedInputs = new Set(this.inputList.map((i) => i?.name));
          const inputs = vmBlock.inputs;
          for (const name of Object.keys(inputs)) {
            const input = inputs[name];
            if (!usedInputs.has(name)) {
              blocks.deleteBlock(input.block);
              blocks.deleteBlock(input.shadow);
              delete inputs[name];
            }
          }
        },
        getExtendableInput(prefix, index) {
          let id = prefix;
          if (prefix === 'SUBSTACK') {
            index += 1;
            if (index > 1) id += index;
          } else {
            id += index;
          }
          return id;
        },
        addInput_(def, i, connectionMap = null) {
          const id = this.getExtendableInput(def.id, i);
          const input = this.appendInput_(def.type, id);
          if (def.type === ScratchBlocks.DUMMY_INPUT) {
            input.appendField(def.check);
          } else {
            if (def.check) {
              input.setCheck(def.check);
            }
            this.populateArgument_(connectionMap, id, input, def);
          }
        },
        insertInput() {
          ScratchBlocks.Events.setGroup(true);
          const oldMutation = ScratchBlocks.Xml.domToText(this.mutationToDom());
          this.inputCount++;
          this.updateDisplay_();
          const newMutation = ScratchBlocks.Xml.domToText(this.mutationToDom());
          const ev = new ScratchBlocks.Events.BlockChange(
            this,
            'mutation',
            null,
            oldMutation,
            newMutation
          );
          ScratchBlocks.Events.fire(ev);
          ScratchBlocks.Events.setGroup(false);
        },
        deleteInput() {
          ScratchBlocks.Events.setGroup(true);
          const oldMutation = ScratchBlocks.Xml.domToText(this.mutationToDom());
          this.inputCount--;
          const plusInputs = this.extendableDefsStart.length > 0 ? 1 : 0;
          for (const def of this.extendableDefs) {
            this.removeInput(
              this.getExtendableInput(def.id, this.inputCount + plusInputs)
            );
          }
          this.updateDisplay_();
          const newMutation = ScratchBlocks.Xml.domToText(this.mutationToDom());
          const ev = new ScratchBlocks.Events.BlockChange(
            this,
            'mutation',
            null,
            oldMutation,
            newMutation
          );
          ScratchBlocks.Events.fire(ev);
          ScratchBlocks.Events.setGroup(false);
          this.cleanInputs();
        },
        createAllInputs_(connectionMap) {
          let index = 0;
          if (this.extendableDefsStart.length > 0) {
            for (const def of this.extendableDefsStart)
              this.addInput_(def, index, connectionMap);
            index++;
          }
          for (let i = 0; i < this.inputCount; i++) {
            for (const def of this.extendableDefs)
              this.addInput_(def, index, connectionMap);
            index++;
          }
          return index;
        },
        addArrowButtons_() {
          if (this.inputCount > this.minInputs) {
            const leftInput = this.appendDummyInput('ARROW_LEFT');
            const leftArrow = new FieldImageButton(
              leftArrowIcon,
              arrowWidth,
              arrowHeight,
              function () {
                this.sourceBlock_.deleteInput();
              },
              'Remove input',
              true,
              this.inputCount < this.maxInputs
            );
            leftInput.appendField(leftArrow);
          }
          if (this.inputCount < this.maxInputs) {
            const rightInput = this.appendDummyInput('ARROW_RIGHT');
            const rightArrow = new FieldImageButton(
              rightArrowIcon,
              arrowWidth,
              arrowHeight,
              function () {
                this.sourceBlock_.insertInput();
              },
              'Add Input',
              true,
              false
            );
            rightInput.appendField(rightArrow);
          }
        },
        updateDisplay_(force) {
          if (
            !this.isInsertionMarker() &&
            !force &&
            this.workspace?.currentGesture_?.isDraggingBlock_ &&
            this.workspace?.currentGesture_?.targetBlock_.type === this.type
          ) return;
          const wasRendered = this.rendered;
          if (this.isInFlyout) ScratchBlocks.Events.disable();
          this.rendered = false;
          this.extendableUpdatedDisplay = true;
          const connectionMap = this.disconnectOldBlocks_();
          this.removeAllInputs_();
          let index = this.createAllInputs_(connectionMap);
          this.addArrowButtons_();
          for (const def of this.extendableDefsEnd) this.addInput_(def, index, connectionMap);
          ScratchBlocks.ScratchBlocks.ProcedureUtils.deleteShadows_.call(this, connectionMap);
          this.prevInputCount = this.inputCount;
          this.rendered = wasRendered;
          if (wasRendered) {
            this.initSvg();
            this.render();
          }
          if (this.isInFlyout) ScratchBlocks.Events.enable();
        },
      },
      function() {
        this.extendableDefs = [];
        this.extendableDefsStart = [];
        this.extendableDefsEnd = [];
        this.inputCount = 2;
        this.minInputs = 1;
        this.maxInputs = Infinity;
        this.clearLabels = false;
        this.prevInputCount = this.inputCount;
      }
    );
    const ogInitSvg = ScratchBlocks.BlockSvg.prototype.initSvg;
    ScratchBlocks.BlockSvg.prototype.initSvg = function() {
      if (this.getExtendableInput && !this.extendableUpdatedDisplay) this.updateDisplay_();
      return ogInitSvg.call(this);
    };
    const createInput = (type, id, check = null, shadowType = undefined, shadowField = undefined, shadowDefault = undefined) => ({ type, id, check, shadowType, shadowField, shadowDefault });
    if (!allExtensions?.[`mio_${extId}_extendable_string`]) ScratchBlocks.Extensions.register(`mio_${extId}_extendable_string`, function() {
      this.extendableDefs = [
        createInput(ScratchBlocks.INPUT_VALUE, 'ARG', null, 'text', 'TEXT', ''),
      ];
      this.minInputs = 1;
      this.inputCount = 1;
    });
    if (!allExtensions?.[`mio_${extId}_extendable_newfn`]) ScratchBlocks.Extensions.register(`mio_${extId}_extendable_newfn`, function() {
      this.extendableDefsStart = [
        createInput(ScratchBlocks.INPUT_VALUE, 'NAME', null, 'text', 'TEXT', ''),
        createInput(ScratchBlocks.DUMMY_INPUT, 'ARGS_WORD', 'arguments'),
      ];
      this.extendableDefs = [
        createInput(ScratchBlocks.INPUT_VALUE, 'ARG', 'String', 'text', 'TEXT', ''),
      ];
      this.extendableDefsEnd = [
        createInput(ScratchBlocks.NEXT_STATEMENT, 'SUBSTACK', null),
      ];
      this.minInputs = 0;
      this.inputCount = 0;
    });
    if (!allExtensions?.[`mio_${extId}_extendable_callfn`]) ScratchBlocks.Extensions.register(`mio_${extId}_extendable_callfn`, function() {
      this.extendableDefsStart = [
        createInput(ScratchBlocks.INPUT_VALUE, 'NAME', null, 'text', 'TEXT', ''),
        createInput(ScratchBlocks.DUMMY_INPUT, 'ARGS_WORD', 'with arguments:'),
      ];
      this.extendableDefs = [
        createInput(ScratchBlocks.INPUT_VALUE, 'ARG', null, 'text', 'TEXT', ''),
      ];
      this.minInputs = 0;
      this.inputCount = 0;
    });
  });

  Scratch.extensions.register(new extension());
})(Scratch);