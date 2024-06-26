import BaseView from "./BaseView.js"

export default class extends BaseView {
    constructor() {
        super();

    }

    async getHtml() {
        this.setTitle("401");
        //so many things we could do...return markdown, html...call a service.
        return `<h1>401</h1>
<p>Sorry, but you do not have the access required to do that.</p>`;
    }
}