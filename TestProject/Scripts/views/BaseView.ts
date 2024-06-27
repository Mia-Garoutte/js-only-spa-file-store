export default class BaseView {
    
    setTitle(title: string) {
        document.title = title;
    }

    async getHtml():Promise<string> {
        return "";
    }
}