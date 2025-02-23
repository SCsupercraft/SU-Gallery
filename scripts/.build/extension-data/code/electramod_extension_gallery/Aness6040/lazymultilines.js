(function(Scratch) {
    'use strict';
    const vm = Scratch.vm;
    
class Aness6040LazyMultilines {
    constructor() {
        this.mlvalue = ''; 
      }
      getInfo() {
        const blocks = [
            {
                opcode: 'resetmlvalue',
                blockType: Scratch.BlockType.COMMAND,
                text: 'reset text value'
            },
            {
                opcode: 'addLine',
                blockType: Scratch.BlockType.COMMAND,
                text: 'add line [LINETEXT]',
                arguments: {
                    LINETEXT: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: 'Hello, World!'
                    },
                },
            },
            {
                opcode: 'getmlvalue',
                blockType: Scratch.BlockType.REPORTER,
                text: 'text value'
            }
        ];

        // Si Scratch est unsandboxed, nous ajoutons le bloc loadinlineblocks
        if (Scratch.extensions.unsandboxed) {
            blocks.unshift({
                opcode: 'loadinlineblocks',
                blockType: Scratch.BlockType.BUTTON,
                text: 'Load Inline Blocks',
                func: 'loadinlineblocks',
            });
        }

        return {
            id: 'aness6040lazymultilines',
            name: 'Lazy Multi-lines',
            color1: '#82cc38',
            color2: '#52aa2c',
            blocks: blocks
        };
    }

    async loadinlineblocks() {
        await vm.extensionManager.loadExtensionURL('pmInlineBlocks');
      }

    resetmlvalue () {
        this.mlvalue = ''; 
      }

    addLine(args) {
        // On vérifie si mlvalue est vide pour savoir si on doit ajouter une nouvelle ligne ou non
        if(this.mlvalue !== '') {
        this.mlvalue += '\n' + args.LINETEXT; // Si mlvalue n'est pas vide, on ajoute une nouvelle ligne suivi du texte
        } else {
        this.mlvalue = args.LINETEXT; // Si mlvalue est vide, on écrit simplement le texte
        }
    }
    
    getmlvalue () {
        return this.mlvalue; 
        
      }
  }
  
  Scratch.extensions.register(new Aness6040LazyMultilines());
})(Scratch);