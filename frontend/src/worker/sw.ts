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
  getLibraryItemsController,
  getLibraryItemsIndexController,
  getNonSyncedItemsController,
  getNotesController,
  getPreviousItemIdController,
  getPreviousItemsController,
  getPreviousReportController,
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
  setPreviousReportController,
  updateJobStatusController,
  updateSyncedItemsController,
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
  updateJobStatusController,
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

// get library items
registerRoute(
  ({ url }) => url.pathname === "/client/items-library",
  getLibraryItemsController,
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

// get previous report and items
registerRoute(
  ({ url }) => url.pathname === "/client/previous-report",
  getPreviousReportController,
  "GET"
);
// set previous report and items in offline database
registerRoute(
  ({ url }) => url.pathname === "/client/previous-report",
  setPreviousReportController,
  "POST"
);

registerRoute(
  ({ url }) => url.pathname === "/client/previous-item-id",
  getPreviousItemIdController,
  "GET"
);

registerRoute(
  ({ url }) => url.pathname === "/client/previous-items",
  getPreviousItemsController,
  "GET"
);

// get remaining non-synced inspection items;
registerRoute(
  ({ url }) => url.pathname === "/client/non-synced-items",
  getNonSyncedItemsController,
  "GET"
);

// update synced items
registerRoute(
  ({ url }) => url.pathname === "/client/non-synced-items",
  updateSyncedItemsController,
  "PUT"
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
    if (currentTime - sync.lastSync < 540000) {
      return;
    }

    const job = await DB.jobs.where("status").equals("In Progress").first();
    if (!job) {
      return;
    }

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
    await DB.sync.update("sync", { lastSync: currentTime });
  } catch (err: any) {
    console.log(err);
  }
};

const syncLibrary = async () => {
  try {
    console.log("sync library func run now", new Date());
    if (!navigator.onLine) {
      return;
    }

    const sync = await DB.sync.get("sync");
    if (!sync) {
      console.log("not sync");
      return;
    }

    const lastSyncLibrary = sync.lastSyncLibrary;
    const currentTime = Date.now();

    if (currentTime - lastSyncLibrary < 540000) {
      return;
    }

    let date = new Date(lastSyncLibrary);

    let hours = date.getHours();
    let ampm = hours >= 12 ? "PM" : "AM";

    // Convert hours to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be displayed as 12 in 12-hour format

    let formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")} ${hours
      .toString()
      .padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")} ${ampm}`;

    const { success, data, error } = await serverApi.get(
      `/sync-library?lastSync=${formattedDate}`
    );
    if (!success) {
      console.log(error);
      return;
    }

    data.items.forEach(async (item: any) => {
      await DB.items.put(item);
    });
    data.categories.forEach(async (item: any) => {
      await DB.categories.put(item);
    });
    data.jobCategories.forEach(async (item: any) => {
      await DB.jobCategories.put(item);
    });
    data.notes.forEach(async (item: any) => {
      await DB.notes.put(item);
    });
    data.recommendations.forEach(async (item: any) => {
      await DB.recommendations.put(item);
    });

    await DB.sync.update("sync", { lastSyncLibrary: currentTime });
  } catch (err) {
    console.log(err);
  }
};

const syncJobs = async () => {
  try {
    console.log("sync jobs run on ", new Date());
    const { success, error, data } = await serverApi.get("/sync-jobs");
    if (!success) {
      console.log(error);
      return;
    }

    await DB.jobs.where("status").equals("Not Started").delete();

    await DB.jobs.bulkPut(data);
  } catch (err) {
    console.log(err);
  }
};

setInterval(() => {
  syncJobandInspectionItems();
  syncLibrary();
  syncJobs();
}, 1000 * 60 * 10);

let allowlist: undefined | RegExp[];
if (import.meta.env.DEV) allowlist = [/^\/$/];
// to allow work offline
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("index.html"), { allowlist })
);

self.skipWaiting();
clientsClaim();
