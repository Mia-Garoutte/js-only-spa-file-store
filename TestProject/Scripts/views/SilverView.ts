import BaseView from "./BaseView.js"

export default class extends BaseView {
    constructor() {
        super();
        
    }

    async getHtml() {
        this.setTitle("Meow");
        //so many things we could do...return markdown, html...call a service.
        return `<h1>Napping</h1>
<p>Sorry, but the cats are sleeping.</p>`;
    }
}