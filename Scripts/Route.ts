import BaseView from "./views/BaseView.js"

export interface Route {
    path: string,
    isSecured: boolean,
    regEx?: RegExp,
    view: BaseView
};

export interface RouteResult {
    route: Route,
    isMatch: boolean
}
