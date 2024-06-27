import BaseView from "./BaseView.js"

export default class extends BaseView {
    destinationUrl: string;
    constructor(url) {
        super();
        this.destinationUrl = url;
    }

    async doRender(): Promise<void> {
        document.location.href = this.destinationUrl;        
    }
}