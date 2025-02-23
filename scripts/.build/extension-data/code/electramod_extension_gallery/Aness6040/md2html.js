(function(Scratch) {
    'use strict';
    const vm = Scratch.vm;
const extIcon = "data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIxMTkuNTkwOTEiIGhlaWdodD0iMTE4LjU1Njc4IiB2aWV3Qm94PSIwLDAsMTE5LjU5MDkxLDExOC41NTY3OCI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTE4MC4yMDQ1NSwtMTIwLjM3NjQxKSI+PGcgZGF0YS1wYXBlci1kYXRhPSJ7JnF1b3Q7aXNQYWludGluZ0xheWVyJnF1b3Q7OnRydWV9IiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZS1saW5lY2FwPSJidXR0IiBzdHJva2UtbGluZWpvaW49Im1pdGVyIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIHN0cm9rZS1kYXNoYXJyYXk9IiIgc3Ryb2tlLWRhc2hvZmZzZXQ9IjAiIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTogbm9ybWFsIj48cGF0aCBkPSJNMTgwLjIwNDU1LDIzOC42MjM2di0xMTguMjQ3MTloMTE5LjU5MDkxdjExOC4yNDcxOXoiIGZpbGw9Im5vbmUiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIwIi8+PHBhdGggZD0iTTIwNi4wMzg5MSwyMDQuODI3MDFoLTE1LjIyMzQ5di0xMS4xNDI3NmgxNy45MjU3N2w2LjY2NzMzLC0yNy4xNDQwN2gtMjQuNTkzMXYtMTEuMTQyNzZoMjcuMjk1MzlsNy44MzQ3NywtMzIuMDgwNmgxMy41MTQ4OWwtNy44MzgwMSwzMi4wODA2aDI4LjM3NDQ1bDcuODM4MDEsLTMyLjA4MDZoMTMuNjAzNWwtNy44MzgwMSwzMi4wODA4NGgxNS41ODQxOHYxMS4xNDI3NWgtMTguMjg2NjlsLTYuNzU1NzEsMjcuMTQ0MDdoMjUuMDQyNHYxMS4xNDI3NmgtMjcuNzQ0NjlsLTcuODM4MDEsMzEuODU1OTVoLTEzLjUxMTY1bDcuNzQ2MTYsLTMxLjg1NTk1aC0yOC4yODU4M2wtNy44MzgwMSwzMS44NTU5NWgtMTMuNTExNjV6TTIyMi4yNTI4NCwxOTMuNjg0NDhoMjguMjg2MDZsNi43NTU3MSwtMjcuMTQ0MDdoLTI4LjM3NDQ1eiIgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlPSIjZmZmZmZmIiBzdHJva2Utd2lkdGg9IjQuNSIvPjxwYXRoIGQ9Ik0yMDYuMDM4OSwyMDQuODI3MDFoLTE1LjIyMzQ5di0xMS4xNDI3NmgxNy45MjU3N2w2LjY2NzMzLC0yNy4xNDQwN2gtMjQuNTkzMXYtMTEuMTQyNzZoMjcuMjk1MzlsNy44MzQ3NywtMzIuMDgwNmgxMy41MTQ4OWwtNy44MzgwMSwzMi4wODA2aDI4LjM3NDQ1bDcuODM4MDEsLTMyLjA4MDZoMTMuNjAzNWwtNy44MzgwMSwzMi4wODA4NGgxNS41ODQxOHYxMS4xNDI3NWgtMTguMjg2NjlsLTYuNzU1NzEsMjcuMTQ0MDdoMjUuMDQyNHYxMS4xNDI3NmgtMjcuNzQ0NjlsLTcuODM4MDEsMzEuODU1OTVoLTEzLjUxMTY1bDcuNzQ2MTYsLTMxLjg1NTk1aC0yOC4yODU4M2wtNy44MzgwMSwzMS44NTU5NWgtMTMuNTExNjV6TTIyMi4yNTI4MywxOTMuNjg0NDhoMjguMjg2MDZsNi43NTU3MSwtMjcuMTQ0MDdoLTI4LjM3NDQ1eiIgZmlsbD0iIzAwMDAwMCIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjAiLz48L2c+PC9nPjwvc3ZnPjwhLS1yb3RhdGlvbkNlbnRlcjo1OS43OTU0NTQ1NDU0NTQzMDU6NTkuNjIzNTg1NTA1NjE4MDQtLT4=";
    class Aness6040MD2HTML {
        constructor() {
            this.defaultTagNames = {
                'ul': 'ul',
                'img': 'img',
                'block-code': 'code',
                'inline-code': 'code',
                'h3': 'h3',
                'h2': 'h2',
                'h1': 'h1',
                'strong': 'strong',
                'em': 'em',
                'li': 'li',
                'br': 'br',
                'a': 'a',
                'blockquote': 'blockquote'
            };

            // Attributs par défaut pour chaque balise
            this.defaultAdditionalAttributes = {
                'ul': '',
                'img': ' style="max-width: 100%; height: auto;"',
                'block-code': ' style="font-family: Consolas,"courier new";color: C1E5FF;background-color: #404040;padding: 2px;font-size: 105%;"',
                'inline-code': ' style="font-family: Consolas,"courier new";color: white;background-color: #404040;padding: 2px;font-size: 105%;"',
                'h3': '',
                'h2': '',
                'h1': '',
                'strong': '',
                'em': '',
                'li': '',
                'br': '',
                'a': '',
                'blockquote': '',
            };

            // Initialisation des tagNames et attributes avec les valeurs par défaut
            this.tagNames = { ...this.defaultTagNames };
            this.additionalAttributes = { ...this.defaultAdditionalAttributes };

        }


        getInfo() {
            return {
                id: 'aness6040md2html',
                name: 'Markdown to HTML',
                color1: '#dbdbdb',
                color2: '#b5b5b5',
                color3: '#949494',
                blockIconURI: extIcon,
                docsURI: 'https://electramod-extensions-gallery.vercel.app/docs/md2html',
                blocks: [
                    {
                        opcode: 'convertmd2html',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Convert markdown [markdown] to HTML',
                        arguments: {
                            markdown: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: '# [Hello World!](https://example.com)'
                            }
                        }
                    },
                    {
                        opcode: 'changeTagName',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Change [tag] name to [name]',
                        arguments: {
                            tag: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'tagNamesMenu',
                                defaultValue: 'ul'
                            },
                            name: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'newTagName'
                            }
                        }
                    },
                    {
                        opcode: 'getTagName',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get [tag] name',
                        arguments: {
                            tag: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'tagNamesMenu',
                                defaultValue: 'ul'
                            }
                        }
                    },
                    {
                        opcode: 'resetTagName',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Reset [tag] name',
                        arguments: {
                            tag: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'tagNamesMenu',
                                defaultValue: 'ul'
                            }
                        }
                    },
                    {
                        opcode: 'resetAllTagNames',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Reset all tag names'
                    },
                    {
                        opcode: 'setTagAttributes',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Set [tag] attributes to [attributes]',
                        arguments: {
                            tag: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'tagNamesMenu',
                                defaultValue: 'ul'
                            },
                            attributes: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'class="markdown-list"'
                            }
                        }
                    },
                    {
                        opcode: 'getTagAttributes',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Get [tag] attributes',
                        arguments: {
                            tag: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'tagNamesMenu',
                                defaultValue: 'ul'
                            }
                        }
                    },
                    {
                        opcode: 'resetTagAttributes',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Reset [tag] attributes',
                        arguments: {
                            tag: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'tagNamesMenu',
                                defaultValue: 'ul'
                            }
                        }
                    },
                    {
                        opcode: 'resetAllAttributes',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Reset all attributes'
                    },
                    {
                        opcode: 'clearAllAttributes',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Clear all attributes'
                    },
                    {
                        opcode: 'clearTagAttributes',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'Clear attributes of tag [tag]',
                        arguments: {
                            tag: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'tagNamesMenu',
                                defaultValue: 'ul'
                            }
                        }
                    }
                ],
                menus: {
                    tagNamesMenu: [
                        {
                            text: 'ul',
                            value: 'ul'
                        },
                        {
                            text: 'img',
                            value: 'img'
                        },
                        {
                            text: 'block-code',
                            value: 'block-code'
                        },
                        {
                            text: 'inline-code',
                            value: 'inline-code'
                        },
                        {
                            text: 'h3',
                            value: 'h3'
                        },
                        {
                            text: 'h2',
                            value: 'h2'
                        },
                        {
                            text: 'h1',
                            value: 'h1'
                        },
                        {
                            text: 'strong',
                            value: 'strong'
                        },
                        {
                            text: 'em',
                            value: 'em'
                        },
                        {
                            text: 'li',
                            value: 'li'
                        },
                        {
                            text: 'br',
                            value: 'br'
                        },
                        {
                            text: 'a',
                            value: 'a'
                        },
                        {
                            text: 'blockquote',
                            value: 'blockquote'
                        }
                    ]
                }

            };
        }

        convertmd2html({ markdown }) {
            const html = this.md2html(markdown);
            return html;
        }

        md2html(markdown) {
            function applyMarkdownReplacements(line, tagNames, additionalAttributes) {
                return line
                    .replace(/(^|\r?\n)( *)- /g, (match, newline, spaces) => {
                        return newline + spaces.replace(/^ /g, '&nbsp;') + ' ';
                    }) // List item
                    .replace(/!\[(.*?)\]\((.*?)\)/g, `<${tagNames['img']} src="$2" alt="$1"${additionalAttributes['img']}>`) // Image
                    .replace(/\[(.*?)\]\((.*?)\)/g, `<${tagNames['a']} href="$2"${additionalAttributes['a']}>$1</${tagNames['a']}>`) // Hyperlien
                    .replace(/###\s(.*?)(\r?\n|$)/g, `<${tagNames['h3']}${additionalAttributes['h3']}>$1</${tagNames['h3']}>`) // H3
                    .replace(/##\s(.*?)(\r?\n|$)/g, `<${tagNames['h2']}${additionalAttributes['h2']}>$1</${tagNames['h2']}>`) // H2
                    .replace(/#\s(.*?)(\r?\n|$)/g, `<${tagNames['h1']}${additionalAttributes['h1']}>$1</${tagNames['h1']}>`) // H1
                    .replace(/\*\*(.*?)\*\*/g, `<${tagNames['strong']}${additionalAttributes['strong']}>$1</${tagNames['strong']}>`) // Gras
                    .replace(/\*(.*?)\*/g, `<${tagNames['em']}${additionalAttributes['em']}>$1</${tagNames['em']}>`) // Italique
                    .replace(/\_\_(.*?)\_\_/g, `<${tagNames['strong']}${additionalAttributes['strong']}>$1</${tagNames['strong']}>`) // Gras
                    .replace(/\_(.*?)\_/g, `<${tagNames['em']}${additionalAttributes['em']}>$1</${tagNames['em']}>`) // Italique
                    .replace(/```(.*?)\n(.*?)```/gs, `<${tagNames['block-code']} lang="$1"${additionalAttributes['block-code']}>$2</${tagNames['block-code']}>`) // Blocs de code
                    .replace(/`(.*?)`/g, `<${tagNames['inline-code']}${additionalAttributes['inline-code']}>$1</${tagNames['inline-code']}>`); // Blocs de code en ligne
            }
        
            let html = '';
            let blockCodeCount = 0;
            let inList = false;
            let inBlockquote = false;
        
            // Diviser le markdown par ligne
            const lines = markdown.split(/\r?\n/);
        
            // Convertir chaque ligne individuellement
            lines.forEach((line, index) => {
                // Vérifier si la ligne commence par ```
                if (line.startsWith('```')) {
                    // Si le nombre de blocs de code est pair, fermer le bloc de code précédent
                    if (blockCodeCount % 2 === 0) {
                        const lang = line.substring(3).trim();
                        html += `<${this.tagNames['block-code']} lang="${lang}"${this.additionalAttributes['block-code']}>`;
                    } else {
                        // Sinon, ouvrir un nouveau bloc de code
                        html += `</${this.tagNames['block-code']}>`;
                    }
                    // Incrémenter le nombre de blocs de code
                    blockCodeCount++;
                    // Ignorer le reste du traitement de la ligne
                    return;
                }
        
                // Vérifier si la ligne commence par "> "
                if (line.startsWith('> ') && line.trim().startsWith('>')) {
                    // Si ce n'est pas déjà le cas, commencer une nouvelle citation
                    if (!inBlockquote) {
                        html += `<${this.tagNames['blockquote']}>`;
                        inBlockquote = true;
                    }
                    // Traiter tous les remplacements Markdown sur toute la ligne
                    line = applyMarkdownReplacements(line, this.tagNames, this.additionalAttributes);
        
                    // Ajouter la ligne à la citation
                    html += line.substring(2);
                    // Ignorer le reste du traitement de la ligne
                    return;
                } else {
                    // Si nous étions dans une citation, la fermer
                    if (inBlockquote) {
                        html += `</${this.tagNames['blockquote']}>`;
                        inBlockquote = false;
                    }
                }
        
        
                // Traiter tous les remplacements Markdown sur toute la ligne
                line = applyMarkdownReplacements(line, this.tagNames, this.additionalAttributes);
        
                // Si la ligne commence par `- `, commence ou continue la liste
                if (line.startsWith('- ') || line.startsWith('* ')) {
                    // Si ce n'est pas déjà le cas, commencer une nouvelle liste
                    if (!inList) {
                        html += `<${this.tagNames['ul']}>${this.additionalAttributes['ul']}`;
                        inList = true;
                    }
                    // Ajouter l'élément de liste
                    html += `<${this.tagNames['li']}${this.additionalAttributes['li']}>${line.substring(2)}</${this.tagNames['li']}>`;
                } else {
                    // Si ce n'est pas une liste, ajouter la ligne directement
                    if (inList) {
                        // Fermer la balise de liste si la ligne ne commence pas par '- '
                        html += `</${this.tagNames['ul']}>`;
                        inList = false;
                    }
                    html += line;
                }
        
                // Ajouter un saut de ligne après chaque ligne convertie, sauf pour la dernière ligne
                if (index !== lines.length - 1 && !inBlockquote) {
                    html += `<${this.tagNames['br']}${this.additionalAttributes['br']}>`;
                }
            });
        
            // Si nous sommes toujours dans une liste, fermer la balise de liste
            if (inList) {
                html += `</${this.tagNames['ul']}>`;
            }
        
            // Si le nombre de blocs de code est impair à la fin, fermer le dernier bloc de code
            if (blockCodeCount % 2 !== 0) {
                html += `</${this.tagNames['block-code']}>`;
            }
        
            // Si nous sommes encore dans une citation, la fermer
            if (inBlockquote) {
                html += `</${this.tagNames['blockquote']}>`;
            }
        
            return html;
        }       
        
        changeTagName({ tag, name }) {
            if (this.tagNames[tag]) {
                this.tagNames[tag] = name;
            }
        }
        getTagName(args) {
            const { tag } = args;
            if (tag === 'all') {
                return JSON.stringify(this.tagNames);
            }
            return this.tagNames[tag] || '';
        }
        resetTagName(args) {
            const { tag } = args;
            this.tagNames[tag] = this.defaultTagNames[tag];
        }

        resetAllTagNames() {
            this.tagNames = { ...this.defaultTagNames };
        }
        setTagAttributes(args) {
            const { tag, attributes } = args;
            this.additionalAttributes[tag] = ' ' + attributes;
        }
        getTagAttributes(args) {
            const { tag } = args;
            const attributes = this.additionalAttributes[tag];
            return attributes.slice(1);
        }
        resetTagAttributes(args) {
            const { tag } = args;
            if (this.defaultAdditionalAttributes[tag]) {
                this.additionalAttributes[tag] = this.defaultAdditionalAttributes[tag];
            }
        }

        resetAllAttributes() {
            Object.keys(this.defaultAdditionalAttributes).forEach(tag => {
                this.additionalAttributes[tag] = this.defaultAdditionalAttributes[tag];
            });
        }

        clearAllAttributes() {
            Object.keys(this.additionalAttributes).forEach(key => {
                this.additionalAttributes[key] = '';
            });
        }

        clearTagAttributes(args) {
            const { tag } = args;
            if (this.defaultAdditionalAttributes[tag]) {
                this.additionalAttributes[tag] = '';
            }
        }
    }

    Scratch.extensions.register(new Aness6040MD2HTML());
})(Scratch);
