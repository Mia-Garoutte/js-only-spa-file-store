import BaseView from "./BaseView.js"

export default class extends BaseView {
    destinationUrl: string;
    constructor(url) {
        super();
        this.destinationUrl = url;
    }

    async getHtml() {

        document.location.href = this.destinationUrl;
        //this really wont matter, but...
        return ``;
    }
}