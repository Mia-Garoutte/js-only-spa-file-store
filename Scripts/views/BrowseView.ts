import BaseView from "./BaseView.js"

export default class extends BaseView {

    async getHtml() {
        this.setTitle("Browse");
        //so many things we could do...return markdown, html...call a service.
        return `do stuff`;
    }
}