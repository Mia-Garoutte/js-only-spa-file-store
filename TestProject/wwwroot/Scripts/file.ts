import { turnOffOverlay, turnOnOverlay } from "./overlay.js";

async function deleteFileFromTree(item: HTMLElement): Promise<boolean> {
    const listItem: HTMLElement = item.parentElement;
    const location: string = listItem.getAttribute('data-location');
    if (listItem.classList.contains('directory') && !window.confirm("Warning! this will delete the folder and all sub contents.")) {
        return false;
    }
    if (!listItem.classList.contains('directory') && !window.confirm("Warning! this will delete the file.")) {
        return false;
    }
    turnOnOverlay(listItem);
    const response = await window.fetch(location, {
        method: 'DELETE',
        headers: { 'content-type': 'application/json;charset=UTF-8', }

    });
    const data = await response.text();
    if (response.status !== 204) {
        turnOffOverlay(listItem);
        alert('Sorry, but we were not able to delete the file.');
        return false;
    }

    turnOffOverlay(listItem);
    listItem.remove();
    return true;
}

function handleFileClick(evt: MouseEvent, target: HTMLElement): boolean {
    if (target.matches('[data-delete-file]')) {
        evt.preventDefault();
        deleteFileFromTree(target);
        return true;
    }
    return false;
}

export { deleteFileFromTree, handleFileClick }