import user from "./user.js"
import { Route, RouteResult } from "./Route.js"
import HomeView from "./views/HomeView.js"
import SilverView from "./views/SilverView.js"
import NotFoundView from "./views/NotFoundView.js"
import RedirectView from "./views/RedirectView.js"
import BrowseView from "./views/BrowseView.js"
import NotAuthorizedView from "./views/NotAuthorizedView.js"
import BaseView from "./views/BaseView.js"

const navigateTo = url => {
    history.pushState(null, null, url);
    router();
};

const route404: Route =
    { path: "/404", isSecured: false, view: new NotFoundView() };

const routes: Route[] = [
    { path: "/", isSecured: false, view: new HomeView() },
    { path: "/index.html", isSecured: false, view: new RedirectView('/') },
    { path: "/browse", regEx: /\/browse\/*\S*/i, isSecured: false, view: new BrowseView() },
    route404,
    { path: "/403", isSecured: false, view: new NotAuthorizedView() },
    { path: "/silver", isSecured: true, view: new SilverView() }
];

async function router() {

    const potentialRoutes: RouteResult[] = routes.map(route => {
        return {
            route: route,
            isMatch: ((location.pathname === route.path) || (route.regEx?.test(location.pathname) ?? false))
        }
    })

    let match: RouteResult | null = potentialRoutes.find(potentialRoute =>
        potentialRoute.isMatch && (!potentialRoute.route.isSecured || user().isLoggedIn))

    if (!match) {
        match = {
            route: route404, isMatch: true
        };
    }

    updateView("#app", match.route.view);
};

function updateView(selector: string, view: BaseView) {
    const app: HTMLElement = document.querySelector(selector);
    app.classList.add("overlay");
    view.getHtml().then((value) => {
        app.innerHTML = value;
        app.classList.remove("overlay");
    });

}

export { router, navigateTo };