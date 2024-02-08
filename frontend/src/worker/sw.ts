import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { clientsClaim } from "workbox-core";
import { NavigationRoute, registerRoute } from "workbox-routing";
import {
  addInspectionItemsController,
  addInspectionNoteByJobController,
  addRecommendationByJobController,
  deleteInspectionItemController,
  deleteInspectionNoteByJobController,
  getAllCategoriesController,
  getAllInspectionItemsByJobController,
  getJobsController,
  getLibraryItemsIndexController,
  getNotesController,
  getRecommendationsController,
  initCategoriesController,
  initItemsController,
  initJobCategoriesController,
  initJobsController,
  initNotesController,
  initRecommendationsController,
  initSyncController,
  initUserController,
  removeRecommendationController,
  startInspectionController,
} from "./controller";
import { DB } from "./db";
import serverApi from "./api";

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
// Init recommendations
registerRoute(
  ({ url }) => url.pathname === "/client/init-recommendations",
  initRecommendationsController,
  "POST"
);
// Init job categories
registerRoute(
  ({ url }) => url.pathname === "/client/init-job-categories",
  initJobCategoriesController,
  "POST"
);
// Init jobs
registerRoute(
  ({ url }) => url.pathname === "/client/init-jobs",
  initJobsController,
  "POST"
);

// init sync
registerRoute(
  ({ url }) => url.pathname === "/client/init-sync",
  initSyncController,
  "POST"
);

// Get Jobs
registerRoute(
  ({ url }) => url.pathname === "/client/jobs",
  getJobsController,
  "GET"
);

// Start new inspection
registerRoute(
  ({ url }) => url.pathname === "/client/jobs",
  startInspectionController,
  "PUT"
);

// Get Jobs categories
registerRoute(
  ({ url }) => url.pathname === "/client/job-categories",
  getJobsController,
  "GET"
);

// get notes
registerRoute(
  ({ url }) => url.pathname === "/client/notes",
  getNotesController,
  "GET"
);

// Add Inspection note by job
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/note",
  addInspectionNoteByJobController,
  "POST"
);

// Delete inspection note by job
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/note",
  deleteInspectionNoteByJobController,
  "PUT"
);

// get categories
registerRoute(
  ({ url }) => url.pathname === "/client/categories",
  getAllCategoriesController,
  "GET"
);
// get items
registerRoute(
  ({ url }) => url.pathname === "/client/items-index",
  getLibraryItemsIndexController,
  "GET"
);

// Add inspection items
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/inspection-items",
  addInspectionItemsController,
  "POST"
);

// get all inspection items by job
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/inspection-items",
  getAllInspectionItemsByJobController,
  "GET"
);
// delete item by job
registerRoute(
  ({ url }) => url.pathname === "/client/jobs/inspection-items",
  deleteInspectionItemController,
  "DELETE"
);

// get all recommendations
registerRoute(
  ({ url }) => url.pathname === "/client/recommendations",
  getRecommendationsController,
  "GET"
);

// add recommendation
registerRoute(
  ({ url }) => url.pathname === "/client/recommendations",
  addRecommendationByJobController,
  "POST"
);

// remove recommendation
registerRoute(
  ({ url }) => url.pathname === "/client/recommendations",
  removeRecommendationController,
  "DELETE"
);

const syncJobandInspectionItems = async () => {
  try {
    console.log("sync function run", new Date());
    if (!navigator.onLine) {
      return;
    }

    const sync = await DB.sync.get("sync");
    if (!sync) {
      console.log("not sync");
      return;
    }

    const currentTime = Date.now();
    // if (currentTime - sync.lastSync < 120000) {
    //   return;
    // }

    const job = await DB.jobs.where("status").equals("In Progress").first();

    // for (let i = 0; i < inProgressJobs.length; i++) {

    const allInspectionItemsNotSynced = await DB.inspectionItems
      .where("sync")
      .equals(job.report_id)
      .toArray();

    const deletedItems = await DB.deletedItems.toArray();

    if (allInspectionItemsNotSynced.length === 0 && deletedItems.length === 0) {
      return;
    }

    let itemsTosync = allInspectionItemsNotSynced;
    if (allInspectionItemsNotSynced.length > 25) {
      itemsTosync = allInspectionItemsNotSynced.slice(0, 25);
    }

    const { success, error, data } = await serverApi.post(
      "/sync-inspection-items",
      {
        job_id: job.id,
        report_id: job.report_id,
        deletedItems: deletedItems,
        inspectionItems: itemsTosync,
      }
    );
    console.log(data);
    if (!success) {
      console.log(error);
      return;
    }

    await DB.deletedItems.clear();
    const syncedItemsIds = data;
    if (!Array.isArray(syncedItemsIds)) {
      return;
    }
    await DB.inspectionItems
      .where("id")
      .anyOf(syncedItemsIds)
      .modify((item: any) => {
        item.sync = "Synced Online";
      });

    // console.log(itemsTosync);
    // }
    await DB.sync.put({ lastSync: currentTime, type: "sync" }, "sync");
  } catch (err: any) {
    console.log(err);
  }
};

setInterval(() => {
  syncJobandInspectionItems();
}, 1000 * 60 * 3);

let allowlist: undefined | RegExp[];
if (import.meta.env.DEV) allowlist = [/^\/$/];
// to allow work offline
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("index.html"), { allowlist })
);

self.skipWaiting();
clientsClaim();
