import { Route } from "./routeService";

let _activeRoute: Route | null = null;

export function saveActiveRoute(route: Route) {
  _activeRoute = route;
}

export function getActiveRoute(): Route | null {
  return _activeRoute;
}

export function clearActiveRoute() {
  _activeRoute = null;
}
