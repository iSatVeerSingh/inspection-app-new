export const JOBS = "/jobs";
export const JOB_DETAILS = JOBS + "/:jobNumber";
export const ADD_NOTES = JOB_DETAILS + "/add-notes";
export const VIEW_EDIT_NOTES = JOB_DETAILS + "/all-notes";
export const ADD_ITEMS = JOB_DETAILS + "/add-items";
export const VIEW_EDIT_ITEMS = JOB_DETAILS + "/all-items";
export const INSPECTION_ITEM_PREVIEW = VIEW_EDIT_ITEMS + "/:uuid";
export const ADD_PREVIOUS_JOB_ITEMS =
  JOB_DETAILS + "/add-previous-items/:prevJob";
export const PREVIOUS_ITEM_PREVIEW = ADD_PREVIOUS_JOB_ITEMS + "/:id";

export const REPORT_PREVIEW = JOB_DETAILS + "/preview";

// Library items
export const LIBRARY_ITEMS = "/library-items";
export const LIBRARY_ITEM = LIBRARY_ITEMS + "/:id";
export const NEW_ITEM = LIBRARY_ITEMS + "/new";

// Inspection Notes
export const INSPECTION_NOTES = "/inspection-notes";

// Users
export const USERS = "/users";

// Settings
export const SETTINGS = "/settings";
