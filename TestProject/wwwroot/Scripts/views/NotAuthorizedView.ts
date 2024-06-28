import BaseView from "./BaseView.js"

export default class extends BaseView {
    constructor() {
        super();

    }

    async doRender(): Promise<void> {
        this.setTitle("401");
        this.addHeading("401");
        this.addParagraph(`Sorry, but you do not have the access required to do that.`);

    }
}