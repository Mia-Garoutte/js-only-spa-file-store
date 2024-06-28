export default class BaseView {

    setTitle(title: string) {
        document.title = title;
    }
    content: HTMLElement;
    async render(main: HTMLElement | undefined): Promise<void> {
        if (main) {
            this.content = main;
        }
        this.content.innerHTML = ''
        this.doRender();
    }

    protected ReportError(error: string): void {
        this.addHeading("Error");
        this.addParagraph(error);
    }

    protected async doRender(): Promise<void> {
        return;
    }

    protected addParagraph(content: string, parent: HTMLElement = this.content): HTMLElement {
        return this.addNode(content, 'p',parent);
    }

    protected addDiv(parent: HTMLElement = this.content): HTMLElement {
        return this.addNode('', 'div', parent);
    }

    protected newDiv(): HTMLElement {
        return this.newNode('', 'div');
    }

    protected addCloseButton(parent: HTMLElement = this.content): HTMLElement {
        const node = this.addNode('', 'span', parent, "close");
        this.addDiv(node).className = 'close_circle';
        this.addDiv(node).className = 'close_stem';
        this.addDiv(node).className = 'close_stem2';
        return node;
    }

    protected addDialog(id: string, parent: HTMLElement = this.content): HTMLDialogElement {
        const node = this.addNode('', 'dialog', parent) as HTMLDialogElement;
        node.setAttribute('id', id);
        return node;
    }

    protected addForm(id: string, parent: HTMLElement = this.content): HTMLElement {
        const node: HTMLElement = this.addNode('', 'form', parent);
        node.setAttribute('id', id);
        return node;
    }
    protected addHeading(content: string, parent: HTMLElement = this.content): HTMLElement {
        return this.addNode(content, 'h1',parent);
    }

    protected addUnorderedList(parent: HTMLElement = this.content): HTMLElement {
        return this.addNode('', 'ul', parent);
    }

    protected addNavigation(styles: string = '', parent: HTMLElement = this.content,): HTMLElement {
        return this.addNode('', 'nav', parent, styles);
    }

    protected addListItem(content: string, parent: HTMLElement, styles: string = '', dataAttr: string = ''): HTMLElement {
        return this.addNode(content, 'li', parent, styles, dataAttr);
    }

    protected addLink(label: string, url: string, parent: HTMLElement = this.content, attr: string = ''): HTMLElement {
        const node: HTMLElement = this.addNode(label, 'a', parent, '', attr);
        node.setAttribute('href', url);
        return node;
    }

    protected addFileInput(name: string, id: string, parent: HTMLElement = this.content): HTMLElement {
        const node: HTMLElement = this.addNode('', 'input', parent);
        node.setAttribute('id', id);
        node.setAttribute('name', name);
        node.setAttribute('type', 'file');
        return node;
    }

    protected addTextInput(placeholder: string, name: string, id: string, parent: HTMLElement = this.content): HTMLInputElement {
        const node: HTMLElement = this.addNode('', 'input', parent);
        node.setAttribute('id', id);
        node.setAttribute('name', name);
        node.setAttribute('type', 'text');
        node.setAttribute('placeholder', placeholder);

        return node as HTMLInputElement;
    }
    protected addSpan(content: string, parent: HTMLElement = this.content, styles: string = '', dataAttr: string = ''): HTMLElement {
        return this.addNode(content, 'span', parent, styles, dataAttr);
    }
    private newNode(content: string, tag: string, styles: string = '', dataAttr: string = ''): HTMLElement {
        const node: HTMLElement = document.createElement(tag);
        if (styles !== '') {
            node.className = styles;
        }
        if (dataAttr !== '') {
            node.setAttribute(dataAttr, '');
        }
        node.textContent = content;
        return node;
    }

    private addNode(content: string, tag: string, parent: HTMLElement, styles: string = '', dataAttr: string = ''): HTMLElement {
        const node: HTMLElement = this.newNode(content, tag, styles, dataAttr);
        parent.append(node);
        return node;
    }


}