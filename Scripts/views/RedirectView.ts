import BaseView from "./BaseView.js"

export default class extends BaseView {
    destinationUrl: string;
    constructor(url) {
        super();
        this.destinationUrl = url;
    }

    delay = ms => new Promise(res => setTimeout(res, ms));

    async getHtml() {
        console.log('waiting');
        await this.delay(5000);
        console.log('delayed');
        document.location.href = this.destinationUrl;
        //so many things we could do...return markdown, html...call a service.
        return ``;
    }
}