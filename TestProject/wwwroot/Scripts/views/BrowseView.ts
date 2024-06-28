﻿import { turnOffOverlay, turnOnOverlay } from "../overlay.js";
import { navigateTo, router } from "../router.js";
import BaseView from "./BaseView.js"

// this file needs to be re-factored to separate some concerns.
// for a POC sure... but not Prod worth
export default class extends BaseView {

    api: string;
    fileApi: string;

    async doRender(): Promise<void> {
        const path: string = document.location.pathname.substring("/browse".length);
        this.api = document.location.origin + '/test' + path;
        this.fileApi = document.location.origin + '/test/createfile' + path;
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
                this.makeDirectoryForm();
                this.makeFileForm();
                this.makeChildren(data.children as any[]);
                turnOffOverlay(this.content);
            });

    }

    ReportError(error: string): void {
        this.newHeading("Error");
        this.newParagraph(error);
    }

    makeFileForm(): void {
        const form = this.newForm('frmCreateFile') as HTMLFormElement;
        form.action = `${this.fileApi}`;
        form.method = 'POST';
        form.enctype = "multipart/form-data";
        const fileFile = this.newFileInput('FormFile', 'FormFile', form);
        const formSubmit = this.newSpan('Upload File', form, 'btn create');

        formSubmit.addEventListener("click", (evt) => {
            evt.preventDefault();
            this.gatherFileData(form);

        })
        form.addEventListener("submit", (evt) => {
            evt.preventDefault();
            this.gatherFileData(form);
        })
    }

    makeDirectoryForm(): void {
        const form = this.newForm('frmCreateDirectory') as HTMLFormElement;
        form.action = this.api;
        form.method = 'POST';
        const txtDirectoryName = this.newTextInput('new directory name', 'DirectoryName', 'txtNewDirectory', form);
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

    async gatherFileData(form: HTMLFormElement): Promise<void> {
        turnOnOverlay(this.content);
        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                alert('Upload failed');
                turnOffOverlay(this.content);
                Promise.reject(JSON.stringify(response.statusText));
            }
        } catch (error) {

            alert(`Upload failed-${error}`);            
            Promise.reject(JSON.stringify(error));
        }
        finally {
            turnOffOverlay(this.content);
            navigateTo(document.location.href);
        }

        return;
    }
    async gatherDirectoryData(form: HTMLFormElement): Promise<void> {
        turnOnOverlay(this.content);
        //const formElement: HTMLFormElement = document.querySelector('#frmCreateDirectory');
        const data = new FormData(form);
        if (data.get('DirectoryName') === '') {
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
            body: JSON.stringify({ DirectoryName: data.get('DirectoryName') })
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
            this.ReportError('Something went wrong while trying to get the data!');
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
            const link=this.newLink(item.name, '', listItem);
            if (item.assetType.toLowerCase() === 'directory') {
                link.setAttribute('data-link', '');
                link.setAttribute('href', `/browse${item.location}`); 
            } else {
                link.setAttribute("target", '_blank');
                link.setAttribute("download", '');
                link.setAttribute('href', `/test${item.location}`); 
            }
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