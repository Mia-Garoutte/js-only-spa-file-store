import BaseView from "./BaseView.js"

export default class extends BaseView {
    constructor() {
        super();

    }

    async doRender(): Promise<void> {
        this.setTitle("404");

        this.addHeading("404");
        this.addParagraph(`What you are looking for was not found on in this little app.  Maybe it is elsewhere?.`);


    }
}