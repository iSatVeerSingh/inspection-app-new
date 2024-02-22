export const JOBS = "/jobs";
export const JOB_DETAILS = JOBS + "/:jobNumber";
export const ADD_NOTES = JOB_DETAILS + "/add-notes";
export const VIEW_EDIT_NOTES = JOB_DETAILS + "/all-notes";
export const ADD_ITEMS = JOB_DETAILS + "/add-items";
export const VIEW_EDIT_ITEMS = JOB_DETAILS + "/all-items";
export const INSPECTION_ITEM_PREVIEW = VIEW_EDIT_ITEMS + "/:id";
export const PREVIOUS_REPORT = JOB_DETAILS + "/previous-report";
export const PREVIOUS_ITEMS = JOB_DETAILS + "/previous-items";
export const PREVIOUS_ITEM_PREVIEW = PREVIOUS_ITEMS + "/:id";

export const ITEMS_LIBRARY = "/items-library";
export const ITEMS_LIBRARY_PREVIEW = ITEMS_LIBRARY + "/:id";
// export const ADD_PREVIOUS_JOB_ITEMS =
//   JOB_DETAILS + "/add-previous-items/:prevJob";
// export const PREVIOUS_ITEM_PREVIEW = ADD_PREVIOUS_JOB_ITEMS + "/:id";

// export const REPORT_PREVIEW = JOB_DETAILS + "/preview";

// // Library items
// export const LIBRARY_ITEMS = "/items";
// export const LIBRARY_ITEM = LIBRARY_ITEMS + "/:id";
// export const NEW_ITEM = LIBRARY_ITEMS + "/new";

// export const CATEGORIES = "/categories";

// // Inspection Notes
// export const INSPECTION_NOTES = "/inspection-notes";

// // Users
// export const USERS = "/users";

// // Settings
export const SETTINGS = "/settings";
export const LIBRARY_ITEMS = SETTINGS + "/items";
export const LIBRARY_ITEM = LIBRARY_ITEMS + "/:id";
export const NEW_LIBRARY_ITEM = LIBRARY_ITEMS + "/new";

export const ITEM_CATEGORIES = SETTINGS + "/categories";

export const LIBRARY_NOTES = SETTINGS + "/notes";

export const JOB_CATEGORIES = SETTINGS + "/job-categories";
export const RECOMMENDATIONS = SETTINGS + "/recommendations";
