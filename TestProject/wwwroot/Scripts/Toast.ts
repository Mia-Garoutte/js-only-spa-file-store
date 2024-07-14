class Toast {
    toastLocation: HTMLElement;
    constructor(toastLocation: HTMLElement) {
        this.toastLocation = toastLocation;
    }

    removeToast = (toast: HTMLElement) :void => {
        toast.classList.add("hide")
        if (toast.hasAttribute('timeoutId')) {
            clearTimeout(parseInt(toast.getAttribute('timeoutId')));
        }
        setTimeout(() => toast.remove(), 500)
    }

    createToast = (icon: string, message: string, timer:number=5000): number => {
        const toast = document.createElement("li");
        toast.className = `toast ${icon}`;
        toast.innerHTML = `<div class="column">
                         <i class="fa-solid ${icon}"></i>
                         <span>${message}</span>
                      </div>`;
        const closeMark = document.createElement("i");
        closeMark.innerHTML = `<i class="fa-solid fa-xmark".</i>`;
        toast.appendChild(closeMark);
        closeMark.addEventListener('click', () => this.removeToast(toast));
        this.toastLocation.appendChild(toast);
        const id = setTimeout(() => this.removeToast(toast), timer)
        toast.setAttribute('timeoutId', id.toString());
        return id;
    }
}

let toaster: Toast = new Toast(document.getElementById('notifications'));

export { toaster };
