
import Toast, { ToastTypes } from "./Toast.js";
let toaster: Toast = new Toast(document.getElementById('notifications'));

export { toaster, ToastTypes };