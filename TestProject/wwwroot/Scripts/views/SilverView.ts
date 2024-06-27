﻿import BaseView from "./BaseView.js"

export default class extends BaseView {
    constructor() {
        super();
        
    }

    async doRender(): Promise<void> {
        this.setTitle("Meow");
        //so many things we could do...return markdown, html...call a service.        
        this.newHeading("Napping");
        this.newParagraph(`Sorry, but the cats are sleeping.`);
    }
}