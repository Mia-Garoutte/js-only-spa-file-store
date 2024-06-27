import { handleFileClick } from './file.js';
import { navigateTo, router } from './router.js';

window.addEventListener("popstate", router);
document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", (evt: MouseEvent) => {
        const target = evt.target as HTMLElement
        if (target.matches('[data-link]')) {
            evt.preventDefault();
            navigateTo(target.getAttribute('href'));
        }
        else if (handleFileClick(evt, target)) { return; }

    });
    router();
});

