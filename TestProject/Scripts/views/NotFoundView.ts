import BaseView from "./BaseView.js"

export default class extends BaseView {
    constructor() {
        super();
        
    }

    async getHtml() {
        this.setTitle("404");
        //so many things we could do...return markdown, html...call a service.
        return `<h1>404</h1>
<p>What you are looking for was not found on in this little app.  Maybe it is elsewhere?</p>`;
    }
}