import { turnOffOverlay, turnOnOverlay } from "../overlay.js";
import BaseView from "./BaseView.js"

export default class extends BaseView {

    api: string;
    theForm: HTMLFormElement;
    theDialog: HTMLDialogElement;
    constructor(triggerLocation: HTMLElement, dialogLocation: HTMLElement) {
        super();
        this.api = document.location.origin + '/test/search';
        this.theDialog = this.makeDialog(dialogLocation);
        this.makeTrigger(triggerLocation, this.theDialog);
    }


    private makeDialog(location: HTMLElement): HTMLDialogElement {
        const dialog = this.addDialog('searchDialog', location);
        
        const dialogHeader = this.addDiv(dialog);
        dialogHeader.className = 'clearfix';
        this.makeSearchForm(dialogHeader);
        this.addCloseButton(dialogHeader)
            .addEventListener('click', (evt) => {
                dialog.close();
            });

        this.content = this.addDiv(dialog);
        return dialog;
    }

    makeTrigger(location: HTMLElement, dialog: HTMLDialogElement): HTMLElement {
        const trigger = this.addSpan('Search', location, 'btn search');
        trigger.addEventListener('click', (evt) => {
            this.render(undefined);
            this.theForm.reset();
            this.content.innerHTML = '';
            this.doRender();//result the search box to default.
            dialog.showModal();
        });
        return trigger;
    }

    makeSearchForm(location: HTMLElement): void {
        this.theForm = this.addForm('frmCreateDirectory', location) as HTMLFormElement;
        this.theForm.action = document.location.origin;
        this.theForm.method = 'GET';
        const node: HTMLInputElement = this.addTextInput('Search for? .jpg', 'searchTerm', 'txtSearchTerm', this.theForm);
        const formSubmit = this.addSpan('Search', this.theForm, 'btn search');

        formSubmit.addEventListener("click", (evt) => {
            evt.preventDefault();
            this.search(node.value);

        })
        this.theForm.addEventListener("submit", (evt) => {
            evt.preventDefault();
            this.search(node.value);
        })

    }

    async search(term: string): Promise<void> {
        term = encodeURIComponent(term ?? '');
        if (term === '') {
            alert('You must supply a search term')
            return;
        }
        turnOnOverlay(this.theDialog);
        const url: string = `${this.api}/${term}`;
        let data: any = undefined;
        try {
            const response = await window.fetch(url, {
                method: 'GET',
                headers: { 'content-type': 'application/json;charset=UTF-8', }
            });
            data = await response.json();
            if (!response.ok) {
                this.ReportError('Something went wrong while trying to get the data!');
                Promise.reject(JSON.stringify(data));
                turnOffOverlay(this.theDialog);
                return;
            }
        }
        catch (error) {
            this.ReportError(`Something went wrong while trying to get the data!-${error}`);
            Promise.reject(JSON.stringify(data));
            turnOffOverlay(this.theDialog);
        }
        const div: HTMLElement = this.newDiv();
        const Oldcontent: HTMLElement = this.content;
        this.content = div;
        this.processData(data, div);
        Oldcontent.parentNode.append(div);
        Oldcontent.remove();

        turnOffOverlay(this.theDialog);
    }

    async processData(data: any, location: HTMLElement): Promise<void> {
        this.addSpan(`${data.sizeInBytes}KB in the ${data.totalFiles} found.`);
        const list = this.addUnorderedList();
        data.itemsFound.map(item => {
            this.makeAsstListItem(list, item);
        });
    }

    private makeAsstListItem(parent: HTMLElement, item: any) {
        const listItem = this.addListItem('', parent, item.assetType.toLowerCase());
        listItem.setAttribute('data-location', `/test${item.location}`);

        const link = this.addLink(item.name, '', listItem);
        if (item.assetType.toLowerCase() === 'directory') {
            link.setAttribute('data-link', '');
            link.setAttribute('href', `/browse${item.location}`);
        } else {
            link.setAttribute("target", '_blank');
            link.setAttribute("download", '');
            link.setAttribute('href', `/test${item.location}`);
            this.addSpan(`(${item.sizeInKB}KB)`, link);
        }
        this.addLink(`Go to folder`, `/browse${item.parent}`, listItem, 'data-link').addEventListener('click', (evt) => {
            this.theDialog.close();
        });
    }
    async doRender(): Promise<void> {

        this.addParagraph(`Enter a search term above and click search.`);

    }
}