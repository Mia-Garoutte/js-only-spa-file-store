export enum ToastTypes {
    Success = "success",
    Error = "error",
    Warning = "warning",
    Info = "info",
    Random="random"
}

enum IconType {
    success = "fa-circle-check",
    error = "fa-circle-xmark",
    warning = "fa-triangle-exclamation",
    info = "fa-circle-info",
    random = "fa-solid fa-star"
}
export default class Toast {
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

    createToast = (icon: ToastTypes, message: string, autoClose: boolean=true, timer: number = 5000): number => {
        const toast = document.createElement("li");
        toast.className = `toast ${icon} ${autoClose ? 'autoclose' : ''}`;
        toast.innerHTML = `<div class="column">
                         <i class="fa-solid ${IconType[icon]}"></i>
                         <span>${message}</span>
                      </div>`;
        const closeMark = document.createElement("i");
        closeMark.className = "fa-solid fa-xmark";
        toast.appendChild(closeMark);
        closeMark.addEventListener('click', () => this.removeToast(toast));
        this.toastLocation.appendChild(toast);
        if (!autoClose) return 0;      
        const id = setTimeout(() => this.removeToast(toast), timer)
        toast.setAttribute('timeoutId', id.toString());
        return id;
    }
}


