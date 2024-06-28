export default class BaseView {

    setTitle(title: string) {
        document.title = title;
    }
    content: HTMLElement;
    async render(main: HTMLElement): Promise<void> {
        this.content = main;
        this.content.innerHTML = ''
        this.doRender();
    }

    protected async doRender(): Promise<void> {
        return;
    }

    protected newParagraph(content: string): HTMLElement {
        return this.newNode(content, 'p');
    }
    protected newForm(id: string, parent: HTMLElement = this.content): HTMLElement {
        const node: HTMLElement = this.newNode('', 'form');
        node.setAttribute('id', id);
        return node;
    }
    protected newHeading(content: string): HTMLElement {
        return this.newNode(content, 'h1');
    }

    protected newUnorderedList(parent: HTMLElement = this.content): HTMLElement {
        return this.newNode('', 'ul', parent);
    }

    protected newNavigation(styles: string = ''): HTMLElement {
        return this.newNode('', 'nav', undefined, styles);
    }

    protected newListItem(content: string, parent: HTMLElement, styles: string = '', dataAttr: string = ''): HTMLElement {
        return this.newNode(content, 'li', parent, styles, dataAttr);
    }

    protected newLink(label: string, url: string, parent: HTMLElement = this.content, attr: string = ''): HTMLElement {
        const node: HTMLElement = this.newNode(label, 'a', parent, '', attr);
        node.setAttribute('href', url);
        return node;
    }

    protected newFileInput( name: string, id: string, parent: HTMLElement = this.content): HTMLElement {
        const node: HTMLElement = this.newNode('', 'input', parent);
        node.setAttribute('id', id);
        node.setAttribute('name', name);        
        node.setAttribute('type', 'file');
        return node;
    }

    protected newTextInput(placeholder: string, name: string, id: string, parent: HTMLElement = this.content): HTMLElement {
        const node: HTMLElement = this.newNode('', 'input',parent);
        node.setAttribute('id', id);
        node.setAttribute('name', name);
        node.setAttribute('type', 'text');
        node.setAttribute('placeholder', placeholder);

        return node;
    }
    protected newSpan(content: string, parent: HTMLElement = this.content, styles: string = '', dataAttr: string = ''): HTMLElement {
        return this.newNode(content, 'span', parent, styles, dataAttr);
    }

    private newNode(content: string, tag: string, parent: HTMLElement = this.content, styles: string = '', dataAttr: string = ''): HTMLElement {
        const node: HTMLElement = document.createElement(tag);
        if (styles !== '') {
            node.className = styles;
        }
        if (dataAttr !== '') {
            node.setAttribute(dataAttr, '');
        }
        node.textContent = content;
        parent.append(node);
        return node;
    }


}