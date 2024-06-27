import { turnOffOverlay, turnOnOverlay } from "../overlay.js";
import BaseView from "./BaseView.js"

export default class extends BaseView {

    async doRender(): Promise<void> {
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

                this.makeChildren(data.children as any[]);
                turnOffOverlay(this.content);
            });

    }

    ReportError(error: string): void {
        this.newHeading("Error");
        this.newParagraph(error);
    }

    async getData(): Promise<any> {
        const path: string = document.location.pathname.substring("/browse".length);
        const api = document.location.origin + '/test' + path;

        const response = await window.fetch(api, {
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
 /*
    async getHtml(main: HTMLElement): Promise<string> {

       const path: string = document.location.pathname.substring("/browse".length);
        const api = document.location.origin + '/test' + path;
        let result: string = "";

        const response = await window.fetch(api, {
            method: 'GET',
            headers: { 'content-type': 'application/json;charset=UTF-8', }

        });
        const data = await response.json();
        if (!response.ok) {
            result = `<h2>Error </h2><p>${JSON.stringify(data)}</p>`;
            return result;
        }
        result = `<h1>${data.name}</h1>
        
<nav class='breadcrumb'><ul><li><a href='/browse' data-link>Root</a></il>`;
        let bCPath = '/browse'
        result += data.breadCrumb.map((item) => {
            const part = item;

            bCPath += `/${part}`;
            return `<li><a href='${bCPath}' data-link>${item}</a></il>`
        }).join('\n');
        
        result += `<li><input type="text" onenter=''/><span class></span></li></ul></nav><nav class='treelist'><ul>`;
        result += data.children.map((item) => {
            let html: string = `<li class='${item.assetType.toLowerCase()}' data-location='/test${item.location}'>`;
            let deleteFunctionName: string = "deleteFileFromTree";
            if (item.assetType.toLowerCase() === 'directory') {
                //its a directory
                deleteFunctionName = "confirmDeleteFromTree";
            }
            else {
                //its a file
            }

            if (item.destructiveActionAllowed) {
                html += `<span class="btn delete" data-delete-file>Delete</span>`;
            }
            html += `<a href='/browse${item.location}' data-link>${item.name}</a></li>`;
            return html;
        }).join('\n')
        result += `</ul></nav>`;
        return result;

    }
            */

}