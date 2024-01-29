import { RouteHandler } from "workbox-core";
import { getBadRequestResponse, getSuccessResponse } from "./response";
import { DB } from "./db";

export const initUserController: RouteHandler = async ({ request }) => {
  const userData = await request.json();

  if (!userData) {
    return getBadRequestResponse();
  }

  try {
    await DB.user.clear();
    const user = await DB.user.add({ type: "user", ...userData });
    if (!user) {
      return getBadRequestResponse();
    }
    return getSuccessResponse({ message: "User added to indexeddb" });
  } catch (err) {
    console.log(err);
    return getBadRequestResponse();
  }
};

// Setup library items
export const initItemsController: RouteHandler = async ({ request }) => {
  const allItems = await request.json();
  if (!allItems) {
    return getBadRequestResponse();
  }

  try {
    await DB.items.clear();
    await DB.items.bulkAdd(allItems);
    return getSuccessResponse({ message: "Items added successfully" });
  } catch (err) {
    return getBadRequestResponse();
  }
};

// Setup library item categories
export const initCategoriesController: RouteHandler = async ({ request }) => {
  const allCategories = await request.json();
  if (!allCategories) {
    return getBadRequestResponse();
  }
  try {
    await DB.categories.clear();
    await DB.categories.bulkAdd(allCategories);
    return getSuccessResponse({ message: "Categories added successfully" });
  } catch (err) {
    return getBadRequestResponse();
  }
};

// Setup library inspection notes
export const initNotesController: RouteHandler = async ({ request }) => {
  const allInspectionNotes = await request.json();
  if (!allInspectionNotes) {
    return getBadRequestResponse();
  }
  try {
    await DB.notes.clear();
    await DB.notes.bulkAdd(allInspectionNotes);
    return getSuccessResponse({
      message: "Inspection notes added successfully",
    });
  } catch (err) {
    return getBadRequestResponse();
  }
};
