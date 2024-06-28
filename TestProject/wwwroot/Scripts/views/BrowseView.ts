import { turnOffOverlay, turnOnOverlay } from "../overlay.js";
import { navigateTo, router } from "../router.js";
import BaseView from "./BaseView.js"

// this file needs to be re-factored to separate some concerns.
// for a POC sure... but not Prod worth
export default class extends BaseView {

    api: string;

    async doRender(): Promise<void> {
        const path: string = document.location.pathname.substring("/browse".length);
        this.api = document.location.origin + '/test' + path;

        this.setTitle("Browse");
        turnOnOverlay(this.content);
        await this.getData()
            .catch((reason: string) => {
                reportError(reason);
                turnOffOverlay(this.content);
            })
            .then((data: any) => {
                this.setTitle(`Browse - ${data.location}`);
                this.newHeading(data.name);
                this.makeBreadCrumbs(data.breadCrumb as string[]);
                this.makeForm();
                this.makeChildren(data.children as any[]);
                turnOffOverlay(this.content);
            });

    }

    ReportError(error: string): void {
        this.newHeading("Error");
        this.newParagraph(error);
    }

    makeForm(): void {
        const form = this.newForm('frmCreateDirectory') as HTMLFormElement;
        form.action = this.api;
        form.method = 'POST';
        const txtDirectoryName = this.newInput('new directory name', 'directoryName', 'txtNewDirectory', form);
        const formSubmit = this.newSpan('New Directory', form, 'btn create');

        formSubmit.addEventListener("click", (evt) => {
            evt.preventDefault();
            this.gatherDirectoryData(form);

        })
        form.addEventListener("submit", (evt) => {
            evt.preventDefault();
            this.gatherDirectoryData(form);
        })

    }

    async gatherDirectoryData(form: HTMLFormElement): Promise<void> {
        turnOnOverlay(this.content);
        //const formElement: HTMLFormElement = document.querySelector('#frmCreateDirectory');
        const data = new FormData(form);
        if (data.get('directoryName') === '') {
            alert('We cant create nothing');
            turnOffOverlay(this.content);
            return;
        }
        //for (let entry of data) {
        //    console.log(entry);
        //}
        await fetch(form.action, {
            method: form.method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ directoryName: data.get('directoryName') })
        })
            .then(response => {
                if (response.status !== 201) {
                    turnOffOverlay(this.content);
                    alert("the items was not created");
                    Promise.reject(JSON.stringify(response.statusText));                    
                }
                const location = response.headers.get('location');
                navigateTo(`/browse${location}`);
            })
            .catch(error => {
                alert("the items was not created due to an error");
                Promise.reject(JSON.stringify(error));
                console.error('Unable to delete item.', error)
            });
        turnOffOverlay(this.content);
        return;
    }

    //todo: refactor the data this out of view.
    async getData(): Promise<any> {

        const response = await window.fetch(this.api, {
            method: 'GET',
            headers: { 'content-type': 'application/json;charset=UTF-8', }
        });
        const data = await response.json();
        if (!response.ok) {
            Promise.reject(JSON.stringify(data));
        }
        return data;
    }

    private makeChildren(children: any[]): HTMLElement {
        const nav = this.newNavigation('treelist');
        const list = this.newUnorderedList(nav);
        children.map((item: any) => {
            const listItem = this.newListItem('', list, item.assetType.toLowerCase());
            listItem.setAttribute('data-location', `/test${item.location}`);
            if (item.destructiveActionAllowed) {
                this.newSpan('Delete', listItem, 'btn delete', 'data-delete-file');
            }
            this.newLink(item.name, `/browse${item.location}`, listItem, 'data-link');
        });

        return list;
    }

    private makeBreadCrumbs(locations: string[]): HTMLElement {
        const breadcrumb = this.newNavigation('breadcrumb');
        const breadcrumbList = this.newUnorderedList(breadcrumb);

        let bcPath = '/browse'
        this.makeNavigationListItem(breadcrumbList, '', '', bcPath, 'Root', "data-link");
        locations.map((item: string) => {
            bcPath += `/${item}`;
            return this.makeNavigationListItem(breadcrumbList, '', '', bcPath, item, "data-link");
        })
        return breadcrumb;
    }
    private makeNavigationListItem(parent: HTMLElement, liStyles: string, liDataAttr: string, url: string, label: string, aDataAttr: string = ''): HTMLElement {
        const listItem = this.newListItem('', parent, liStyles, liDataAttr);
        this.newLink(label, url, listItem, aDataAttr);
        return listItem;

    }

}