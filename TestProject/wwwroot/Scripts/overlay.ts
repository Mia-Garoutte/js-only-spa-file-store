function toggleOverlay(element: HTMLElement): void {
    if (element.classList.contains("overlay")) {
        turnOffOverlay(element);
    }
    else {
        turnOnOverlay(element);
    }
}

function turnOnOverlay(element: HTMLElement): void {
    element.classList.add("overlay");
}

function turnOffOverlay(element: HTMLElement): void {
    element.classList.remove("overlay");
}

export { toggleOverlay, turnOnOverlay, turnOffOverlay }
