import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import {
  initCategoriesController,
  initItemsController,
  initNotesController,
  initUserController,
} from "./controller";

declare let self: ServiceWorkerGlobalScope;

// // self.__WB_MANIFEST is default injection point
precacheAndRoute(self.__WB_MANIFEST);
// clean old assets
cleanupOutdatedCaches();

// Setup user in indexeddb
registerRoute(
  ({ url }) => url.pathname === "/client/init-user",
  initUserController,
  "POST"
);

// Init library items
registerRoute(
  ({ url }) => url.pathname === "/client/init-items",
  initItemsController,
  "POST"
);

// Init library item categories
registerRoute(
  ({ url }) => url.pathname === "/client/init-categories",
  initCategoriesController,
  "POST"
);
// Init notes
registerRoute(
  ({ url }) => url.pathname === "/client/init-notes",
  initNotesController,
  "POST"
);

let allowlist: undefined | RegExp[];
if (import.meta.env.DEV) allowlist = [/^\/$/];
// to allow work offline
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("index.html"), { allowlist })
);

self.skipWaiting();
clientsClaim();
