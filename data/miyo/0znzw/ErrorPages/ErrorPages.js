/**!
 * Fake Errors~
 * @author 0znzw <meow@miyo.lol> (@link https://scratch.mit.edu/users/0znzw/)
 * @version 1.0
 * @license MIT AND LGPL-3.0
 * Do not remove this comment
 */
(function(Scratch) {
  const ReloadIcon = `data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNDBweCIgaGVpZ2h0PSI0N3B4IiB2aWV3Qm94PSIwIDAgNDAgNDciIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDQ4LjIgKDQ3MzI3KSAtIGh0dHA6Ly93d3cuYm9oZW1pYW5jb2RpbmcuY29tL3NrZXRjaCAtLT4KICAgIDx0aXRsZT5SZWxvYWQ8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZGVmcz48L2RlZnM+CiAgICA8ZyBpZD0iVjItLS1HZW5lcmFsLU9vcHMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC02MjEuMDAwMDAwLCAtMjI0LjAwMDAwMCkiPgogICAgICAgIDxnIGlkPSJ2MS1XZWxjb21lLU1vZGFsLSIgZmlsbD0iI0ZGRkZGRiI+CiAgICAgICAgICAgIDxnIGlkPSJVbnN1cHBvcnRlZCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDI4LjAwMDAwMCwgMjE5LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTIzMywzMS44OTY0NjgxIEMyMzMsNDIuOTM2ODgzOSAyMjQuMDM4NjI0LDUxLjg5ODI2MDMgMjEzLjAwMTc5Miw1MS44OTgyNjAzIEMyMDEuOTk3MjIyLDUxLjg5ODI2MDMgMTkzLDQyLjkzNjg4MzkgMTkzLDMxLjg5NjQ2ODEgQzE5MywyMS40Mjk1ODA0IDIwMS4xMzMzNDUsMTIuODI2NjU4OSAyMTEuMzg4NzQ1LDEyLjAwMjIxMjMgTDIxMS4zODg3NDUsNy40ODU2Nzg1NyBDMjExLjM4ODc0NSw1LjUxNDE3NTc1IDIxMy41MzU4OSw0LjMzMTI3NDA1IDIxNS4yMjA2MjksNS40MDY2MzkyMyBMMjI2Ljk3Nzk1NSwxMi45NzAwNDEgQzIyOC41MTkzMTIsMTMuOTM3ODY5NiAyMjguNTE5MzEyLDE2LjE2MDI5MSAyMjYuOTc3OTU1LDE3LjE2Mzk2NTIgTDIxNS4yMjA2MjksMjQuNjkxNTIxNCBDMjEzLjUzNTg5LDI1Ljc2Njg4NjYgMjExLjM4ODc0NSwyNC41ODM5ODQ5IDIxMS4zODg3NDUsMjIuNjEyNDgyIEwyMTEuMzg4NzQ1LDE4LjMxMTAyMTMgQzIwNC41NzQ1MTQsMTkuMDk5NjIyNSAxOTkuMjcyOTY0LDI0Ljg3MDc0ODkgMTk5LjI3Mjk2NCwzMS44OTY0NjgxIEMxOTkuMjcyOTY0LDM5LjQ5NTcxNTMgMjA1LjQzODM5MSw0NS42MjUyOTY4IDIxMy4wMDE3OTIsNDUuNjI1Mjk2OCBDMjIwLjU2MTYwOSw0NS42MjUyOTY4IDIyNi43MjcwMzYsMzkuNDk1NzE1MyAyMjYuNzI3MDM2LDMxLjg5NjQ2ODEgQzIyNi43MjcwMzYsMzAuMTc5NDY4MyAyMjguMTI4NTk2LDI4Ljc3NzkwOTEgMjI5Ljg4MTQ0MSwyOC43Nzc5MDkxIEMyMzEuNjAyMDI1LDI4Ljc3NzkwOTEgMjMzLDMwLjE3OTQ2ODMgMjMzLDMxLjg5NjQ2ODEiIGlkPSJSZWxvYWQiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+`;
  let backgroundColor = 'var(--menu-bar-background)', devmode = false;
  const _vm = Scratch.vm;
  const VM = Symbol('~.VM');
  const RealRemove = Symbol('~.RealRemove');
  const Wrapper = Symbol('~.Wrapper');
  // Made with love and to be as hard as possible to recover from
  const fuckVM = (createGUI, err) => {
    _vm.stopAll();
    _vm.stop();
    _vm.runtime.threads = [];
    _vm.runtime.targets = 1; // trol
    _vm.editingTarget = {};
    _vm.stageSprite = {};
    _vm.runtime._editingTarget = {};
    _vm.runtime._stageTarget = {};
    _vm.runtime[VM] = _vm;
    // First lets fuck up ScratchBlocks cause its a bitch -_-
    if (window.ScratchBlocks) {
      // @ts-ignore
      for (const key of Object.keys(window.ScratchBlocks)) {
        try {
          ScratchBlocks[key] = () => {
            throw new Error('nyo :>');
          }
        } catch {}
      }
    }
    const runtime = _vm.runtime;
    // @ts-ignore
    window.scaffolding = {}; // Fuck the packager :D
    // @ts-ignore
    window.vm = {}; // Fuck the global object~
    // @ts-ignore
    window.ScratchBlocks = {}; // Gotta beat this bitch :3
    const vm = runtime[VM];
    vm.on('CREATE_UNSANDBOXED_API', (Scratch) => {
      Scratch.vm = {}; // Fuck the Scratch object
      Scratch.runtime = {}; // And fuck the runtime :]
      Scratch.renderer = {}; // cant leave out the renderer >_<
      Scratch.gui = {}; // No G- GUI? waa-
    });
    for (const key of Object.keys(vm)) {
      try {
        vm.constructor.prototype[key] = () => {
          throw new Error('nyo :>');
        }
      } catch {}
    }
    const GUI = createGUI(err);
  };
  const createGUI = function(err) {
    let display = 'none', removed = false;
    const GUIerrWrapper = document.createElement('div');
    GUIerrWrapper.style.position = 'sticky';
    GUIerrWrapper.style.zIndex = `${Math.pow(2, 31) - 1}`;
    GUIerrWrapper.style.backgroundColor = backgroundColor;
    GUIerrWrapper.style.width = '100vw';
    GUIerrWrapper.style.height = '100vh';
    function raf() {
      delete GUIerrWrapper.style.visibility;
      GUIerrWrapper.style.display = display;
      if (!removed) requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    GUIerrWrapper.style.justifyContent = 'center';
    GUIerrWrapper.style.alignItems = 'center';
    const GUIerrBody = document.createElement('div');
    GUIerrBody.style.width = '50%';
    GUIerrBody.style.color = '#ffffff';
    GUIerrBody.style.textAlign = 'center';
    const ErrorImage = document.createElement('img');
    ErrorImage.src = ReloadIcon;
    ErrorImage.draggable = false;
    ErrorImage.style.border = '0';
    const ErrorHeader = document.createElement('p');
    ErrorHeader.style.fontSize = '1.5rem';
    ErrorHeader.style.fontWeight = 'bold';
    const ErrorTip = document.createElement('p');
    const ErrorMessage = document.createElement('p');
    ErrorMessage.style.whiteSpace = 'pre-wrap';
    ErrorMessage.style.fontFamily = 'monospace';
    const ErrorReload = document.createElement('button');
    ErrorReload.style.border = '1px solid var(--motion-primary)';
    ErrorReload.style.borderRadius = '0.25rem';
    ErrorReload.style.padding = '0.5rem 2rem';
    ErrorReload.style.background = '#ffffff';
    ErrorReload.style.color = 'var(--motion-primary)';
    ErrorReload.style.fontWeight = 'bold';
    ErrorReload.style.fontSize = '0.875rem';
    ErrorReload.style.cursor = 'pointer';
    GUIerrWrapper.appendChild(GUIerrBody);
    GUIerrBody.appendChild(ErrorImage);
    GUIerrBody.appendChild(ErrorHeader);
    GUIerrBody.appendChild(ErrorTip);
    GUIerrBody.appendChild(ErrorMessage);
    GUIerrBody.appendChild(ErrorReload);
    ErrorHeader.appendChild(document.createTextNode('Oops! Something went wrong.'));
    ErrorTip.appendChild(document.createTextNode('We are so sorry, but it looks like the page has crashed. Please refresh your page to try again.'));
    const MessageNode = document.createElement('span');
    MessageNode.dataset.fuk = 'true';
    MessageNode.textContent = err;
    ErrorMessage.appendChild(MessageNode);
    ErrorReload.appendChild(document.createTextNode('Reload'));
    // Seperate cause we dont want people climbing into our house :)
    this[Wrapper] = {
      node: GUIerrWrapper,
    };
    const RealRemoveCall = GUIerrWrapper.remove.bind(GUIerrWrapper);
    this[Wrapper][RealRemove] = function(...args) {
      RealRemoveCall(...args);
      removed = true;
    };
    GUIerrWrapper.remove = () => {
      // I wuv u <3
      fuckVM(createGUI, err);
    }
    this.getMsg = () => {
      return ErrorMessage.querySelector('p > span[data-fuk="true"]');
    }
    let AUTHORIZED = false;
    this.show = () => {
      // We dont need authorization to show our error.
      AUTHORIZED = false;
      this[Wrapper].node.style.display = 'flex';
    };
    const trueHide = () => {
      if (!AUTHORIZED) fuckVM(createGUI, err);
      this[Wrapper].node.style.display = 'none';
      AUTHORIZED = false;
    };
    this[Wrapper].hide = () => {
      // "authorize" hiding this
      AUTHORIZED = true;
      trueHide();
    };
    document.body.appendChild(GUIerrWrapper);
  }
  class ErrorsExt {
    constructor() {
      this.GUI = new createGUI('???');
    }
    getInfo() {
      return {
        color1: '#f22222',
        id: '0znzwErrorPages',
        name: 'Fake Errors~',
        blocks: [{
          opcode: 'showErr',
          text: 'show error [MSG]',
          arguments: {
            MSG: {
              type: Scratch.ArgumentType.STRING,
            },
          },
        }, {
          opcode: 'hideErr',
          text: 'hide error',
        }, {
          opcode: 'fuckVM',
          text: 'fuck VM',
          isTerminal: true,
        }, {
          opcode: 'errMsg',
          text: 'error message',
          blockType: Scratch.BlockType.REPORTER,
        }, {
          opcode: 'errShown',
          text: 'error shown?',
          blockType: Scratch.BlockType.BOOLEAN,
        }, '---', {
          opcode: 'setBg',
          text: 'set background color to [COLOR]',
          arguments: {
            COLOR: {
              type: Scratch.ArgumentType.COLOR,
            },
          },
        }],
        menus: {},
      }
    }
    // Basic usage
    showErr({ MSG }) {
      this.GUI[Wrapper][RealRemove]();
      this.GUI = new createGUI(Scratch.Cast.toString(MSG) || '???');
      this.GUI.show();
    }
    hideErr() {
      this.GUI[Wrapper].hide();
    }
    // State
    errShown() {
      return this.GUI[Wrapper].node.style.display === 'flex';
    }
    errMsg() {
      return this.GUI.getMsg().textContent;
    }
    // Custimization
    setBg({ COLOR }) {
      backgroundColor = Scratch.Cast.toString(COLOR);
    }
    // Fuck vm
    fuckVM() {
      fuckVM(createGUI, this.errMsg());
    }
  }
  _vm.test = new ErrorsExt;
  Scratch.extensions.register(_vm.test);
// @ts-ignore
})(Scratch);