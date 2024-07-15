import { turnOffOverlay, turnOnOverlay } from "../overlay.js";
import { navigateTo, router } from "../router.js";
import { ToastTypes, toaster } from "../toaster.js";
import BaseView from "./BaseView.js"

// this file needs to be re-factored to separate some concerns.
// for a POC sure... but not Prod worthy
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
                this.addHeading(data.name);
                this.makeStatics(data);
                this.makeBreadCrumbs(data.breadCrumb as string[]);
                this.makeDirectoryForm();
                this.makeFileForm();
                this.makeChildren(data.children as any[]);
                turnOffOverlay(this.content);
            });

    }


    //data should be typed...
    makeStatics(data: any): void {
        this.addSpan(`${data.name} has ${data.totalFiles} files for ${Math.ceil(data.sizeInBytes / 1024)}KB.`)
        this.addSpan(`${data.name} has ${data.totalDirectories} sub-directories.`)
    }
    makeFileForm(): void {
        const form = this.addForm('frmCreateFile') as HTMLFormElement;
        form.action = `${this.fileApi}`;
        form.method = 'POST';
        form.enctype = "multipart/form-data";
        const fileFile = this.addFileInput('FormFile', 'FormFile', form);
        const formSubmit = this.addSpan('Upload File', form, 'btn create');

        formSubmit.addEventListener("click", (evt) => {
            evt.preventDefault();
            formSubmit.setAttribute('disabled', '');
            this.gatherFileData(form);
            formSubmit.removeAttribute('disabled');
        })
        form.addEventListener("submit", (evt) => {
            evt.preventDefault();
            formSubmit.setAttribute('disabled', '');
            this.gatherFileData(form);
            formSubmit.removeAttribute('disabled');
        })
    }

    makeDirectoryForm(): void {
        const form = this.addForm('frmCreateDirectory') as HTMLFormElement;
        form.action = this.api;
        form.method = 'POST';
        const txtDirectoryName = this.addTextInput('new directory name', 'DirectoryName', 'txtNewDirectory', form);
        const formSubmit = this.addSpan('New Directory', form, 'btn create');

        formSubmit.addEventListener("click", (evt) => {
            evt.preventDefault();
            formSubmit.setAttribute('disabled', '');
            this.gatherDirectoryData(form);
           // formSubmit.removeAttribute('disabled');
        })
        form.addEventListener("submit", (evt) => {
            evt.preventDefault();
            formSubmit.setAttribute('disabled', '');
            this.gatherDirectoryData(form);
            formSubmit.removeAttribute('disabled');
        })

    }

    async gatherFileData(form: HTMLFormElement): Promise<void> {

        const formData = new FormData(form);
        if (!formData.entries().next().value[1].name) {
            toaster.createErrorToast(`No file selected`);
            return;
        }
        toaster.createInfoToast(`Upload started`);

        form.reset();
        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                toaster.createErrorToast(`Upload Failed`);

                Promise.reject(JSON.stringify(response.statusText));
            }
            else {
                toaster.createSuccessToast(`Upload succeed`);
            }
        } catch (error) {
            toaster.createErrorToast(`Upload Failed-${error}`);
            Promise.reject(JSON.stringify(error));
        }
        finally {
            navigateTo(document.location.href);
        }

        return;
    }
    async gatherDirectoryData(form: HTMLFormElement): Promise<void> {
        const data = new FormData(form);
        if (data.get('DirectoryName') === '') {
            toaster.createErrorToast('We cant create nothing');           
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
                    toaster.createErrorToast("the item was not created");
                    Promise.reject(JSON.stringify(response.statusText));
                }
                else {
                    toaster.createSuccessToast("the directory was created");
                    const location = response.headers.get('location');
                    navigateTo(`/browse${location}`);
                }
                
            })
            .catch(error => {
                toaster.createErrorToast("the item was not created due to an error");
                Promise.reject(JSON.stringify(error));               
            });       
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
        const nav = this.addNavigation('treelist');
        const list = this.addUnorderedList(nav);
        children.map((item: any) => {
            this.makeAsstListItem(list, item);
        });

        return list;
    }

    private makeAsstListItem(parent: HTMLElement, item: any) {
        const listItem = this.addListItem('', parent, item.assetType.toLowerCase());
        listItem.setAttribute('data-location', `/test${item.location}`);
        if (item.destructiveActionAllowed) {
            this.addSpan('Delete', listItem, 'btn delete', 'data-delete-file');
        }
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
    }

    private makeBreadCrumbs(locations: string[]): HTMLElement {
        const breadcrumb = this.addNavigation('breadcrumb');
        const breadcrumbList = this.addUnorderedList(breadcrumb);

        let bcPath = '/browse'
        this.makeNavigationListItem(breadcrumbList, '', '', bcPath, 'Root', "data-link");
        locations.map((item: string) => {
            bcPath += `/${item}`;
            return this.makeNavigationListItem(breadcrumbList, '', '', bcPath, item, "data-link");
        })
        return breadcrumb;
    }
    private makeNavigationListItem(parent: HTMLElement, liStyles: string, liDataAttr: string, url: string, label: string, aDataAttr: string = ''): HTMLElement {
        const listItem = this.addListItem('', parent, liStyles, liDataAttr);
        this.addLink(label, url, listItem, aDataAttr);
        return listItem;

    }

}