import Toast from './Toast.js';
import { handleFileClick } from './file.js';
import { navigateTo, router } from './router.js';
import SearchView from './views/SearchView.js';

new SearchView(document.getElementById('searchTrigger'), document.getElementById('dialogs'));

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

