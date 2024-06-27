import BaseView from "./BaseView.js"

export default class extends BaseView {
    constructor() {
        super();

    }

    async doRender(): Promise<void> {
        this.setTitle("401");
        this.newHeading("401");
        this.newParagraph(`Sorry, but you do not have the access required to do that.`);

    }
}