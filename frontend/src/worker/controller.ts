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

// setup recommendations
export const initRecommendationsController: RouteHandler = async ({
  request,
}) => {
  const recommendations = await request.json();
  if (!recommendations) {
    return getBadRequestResponse();
  }
  try {
    await DB.recommendations.clear();
    await DB.recommendations.bulkAdd(recommendations);
    return getSuccessResponse({
      message: "Recommendations added successfully",
    });
  } catch (err) {
    return getBadRequestResponse();
  }
};
// setup job categories
export const initJobCategoriesController: RouteHandler = async ({
  request,
}) => {
  const jobCategories = await request.json();
  if (!jobCategories) {
    return getBadRequestResponse();
  }
  try {
    await DB.jobCategories.clear();
    await DB.jobCategories.bulkAdd(jobCategories);
    return getSuccessResponse({
      message: "Job categories added successfully",
    });
  } catch (err) {
    return getBadRequestResponse();
  }
};

// setup sync
export const initSyncController: RouteHandler = async () => {
  try {
    await DB.sync.add({
      type: "sync",
      lastSync: Date.now(),
      lastSyncLibrary: Date.now(),
    });
    return getSuccessResponse({ message: "Sync successfully setup" });
  } catch (err: any) {
    return getBadRequestResponse();
  }
};

// setup jobs
export const initJobsController: RouteHandler = async ({ request }) => {
  const jobs = await request.json();
  if (!jobs) {
    return getBadRequestResponse();
  }
  try {
    await DB.jobs.clear();
    await DB.jobs.bulkAdd(jobs);
    return getSuccessResponse({
      message: "Jobs added successfully",
    });
  } catch (err) {
    return getBadRequestResponse();
  }
};

// get jobs
//get jobs
export const getJobsController: RouteHandler = async ({ url }) => {
  try {
    const jobNumber = url.searchParams.get("jobNumber");
    if (jobNumber) {
      const transaction = await DB.transaction(
        "rw",
        DB.jobs,
        DB.inspectionItems,
        async () => {
          const job = await DB.jobs.get(jobNumber);
          if (!job) {
            return null;
          }

          if (!job.report_id) {
            return {
              ...job,
              inspectionItems: 0,
            };
          }

          const newInspectionItems = await DB.inspectionItems
            .where({ report_id: job.report_id, previousItem: 0 })
            .count();
          const previousInspectionItems = await DB.inspectionItems
            .where({ report_id: job.report_id, previousItem: 1 })
            .count();
          return {
            ...job,
            newInspectionItems,
            previousInspectionItems,
          };
        }
      );

      if (!transaction) {
        return getBadRequestResponse("No Job found");
      }
      return getSuccessResponse(transaction);
    }

    const jobs = await DB.jobs.orderBy("startsAt").toArray();
    return getSuccessResponse(jobs);
  } catch (err: any) {
    return getBadRequestResponse(err);
  }
};

// Get Job categories
export const getJobCategoriesController: RouteHandler = async () => {
  try {
    const jobCategories = await DB.jobCategories.toArray();
    return getSuccessResponse(jobCategories);
  } catch (err: any) {
    return getBadRequestResponse(err);
  }
};

// Start new inspection - Update job status to "In Progress"
export const updateJobStatusController: RouteHandler = async ({
  url,
  request,
}) => {
  const jobNumber = url.searchParams.get("jobNumber");
  if (!jobNumber) {
    return getBadRequestResponse();
  }

  try {
    const body = await request.json();

    const isUpdated = await DB.jobs.update(jobNumber, body);
    if (isUpdated === 0) {
      return getBadRequestResponse("Job Not Found");
    }
    return getSuccessResponse({ message: "Job updated successfully" });
  } catch (err: any) {
    return getBadRequestResponse(err);
  }
};

// get all notes
export const getNotesController: RouteHandler = async () => {
  try {
    const notes = await DB.notes.toArray();
    return getSuccessResponse(notes);
  } catch (err: any) {
    return getBadRequestResponse(err);
  }
};

// Add inspection note to a job
export const addInspectionNoteByJobController: RouteHandler = async ({
  url,
  request,
}) => {
  const jobNumber = url.searchParams.get("jobNumber");
  if (!jobNumber) {
    return getBadRequestResponse();
  }

  const body = await request.json();

  try {
    const currentJob = await DB.jobs.get(jobNumber);
    if (!currentJob) {
      return getBadRequestResponse();
    }

    const isExists = currentJob.inspectionNotes?.find(
      (note: any) => note === body.note
    );
    if (isExists) {
      return getBadRequestResponse("Note already exists.");
    }
    const added = await DB.jobs
      .where("jobNumber")
      .equals(jobNumber)
      .modify((job) => {
        if (!job.inspectionNotes) {
          job.inspectionNotes = [body.note];
        } else {
          job.inspectionNotes.push(body.note);
        }
      });
    if (added === 0) {
      return getBadRequestResponse();
    }
    return getSuccessResponse({ message: "Note added successfully" });
  } catch (err) {
    return getBadRequestResponse();
  }
};

// Delete Inspection note by job
export const deleteInspectionNoteByJobController: RouteHandler = async ({
  url,
  request,
}) => {
  const jobNumber = url.searchParams.get("jobNumber");
  if (!jobNumber) {
    return getBadRequestResponse();
  }

  const body = await request.json();

  try {
    const deleted = await DB.jobs
      .where("jobNumber")
      .equals(jobNumber)
      .modify((job) => {
        if (job.inspectionNotes && job.inspectionNotes.length !== 0) {
          job.inspectionNotes = job.inspectionNotes.filter(
            (note: any) => note !== body.note
          );
        }
      });
    if (deleted === 0) {
      return getBadRequestResponse();
    }
    return getSuccessResponse({ message: "Note deleted successfully" });
  } catch (err) {
    return getBadRequestResponse();
  }
};

// get all categories
export const getAllCategoriesController: RouteHandler = async () => {
  try {
    const categories = await DB.categories.toArray();
    return getSuccessResponse(categories);
  } catch (err: any) {
    return getBadRequestResponse(err?.message);
  }
};

// get all library items for add items
export const getLibraryItemsIndexController: RouteHandler = async () => {
  try {
    const allitems = await DB.items.toArray();
    const items = allitems.map((item: any) => ({
      name: item.name,
      category: item.category,
      id: item.id,
    }));
    return getSuccessResponse(items);
  } catch (err: any) {
    return getBadRequestResponse(err?.message);
  }
};

// add inspection items
export const addInspectionItemsController: RouteHandler = async ({
  request,
  url,
}) => {
  try {
    const jobNumber = url.searchParams.get("jobNumber");

    if (jobNumber) {
      await DB.jobs.update(jobNumber, { status: "In Progress" });
    }
    const body = await request.json();

    const id = await DB.inspectionItems.add(body);
    if (!id) {
      return getBadRequestResponse();
    }
    return getSuccessResponse({ message: "Item added successfully" });
  } catch (err: any) {
    return getBadRequestResponse(err?.message);
  }
};

// get inspection items by job
export const getAllInspectionItemsByJobController: RouteHandler = async ({
  url,
}) => {
  try {
    const id = url.searchParams.get("id");
    if (id) {
      const transaction = await DB.transaction(
        "rw",
        DB.inspectionItems,
        DB.items,
        async () => {
          const inspectionItem = await DB.inspectionItems.get(id);
          if (!inspectionItem) {
            return null;
          }
          if (inspectionItem.custom === 0 && inspectionItem.library_item_id) {
            const libraryItem = await DB.items.get(
              inspectionItem.library_item_id
            );
            if (libraryItem) {
              inspectionItem.summary = libraryItem.summary;
              inspectionItem.embeddedImages = libraryItem.embeddedImages;
            }
          }

          return inspectionItem;
        }
      );

      if (!transaction) {
        return getBadRequestResponse();
      }
      return getSuccessResponse(transaction);
    }

    const jobNumber = url.searchParams.get("jobNumber");
    if (!jobNumber) {
      return getBadRequestResponse();
    }

    const page = url.searchParams.get("page");
    const name = url.searchParams.get("name");

    const category = url.searchParams.get("category");

    const perPage = 15;
    const pageNumber = Number(page);
    const skip = pageNumber === 0 ? 0 : (pageNumber - 1) * perPage;

    const transaction = await DB.transaction(
      "rw",
      DB.jobs,
      DB.inspectionItems,
      async () => {
        const job = await DB.jobs.get(jobNumber);
        if (!job) {
          return null;
        }
        const dbQuery = {
          report_id: job.report_id,
          previousItem: 0,
          ...(category ? { category } : {}),
        };

        const itemsCollection = DB.inspectionItems.where(dbQuery);
        if (name) {
          const allItems = await itemsCollection.toArray();
          const filteredItems = allItems.filter((item: any) =>
            item.name.toLowerCase().includes(name.toLowerCase())
          );
          return {
            data: filteredItems,
            pages: {
              current_page: 1,
              next: null,
              prev: null,
            },
          };
        }

        const total = await itemsCollection.count();
        const totalPages =
          total % perPage === 0 ? total / perPage : Math.ceil(total / perPage);

        const items = await itemsCollection
          .offset(skip)
          .limit(perPage)
          .toArray();

        const current_page = pageNumber === 0 ? 1 : pageNumber;
        return {
          data: items,
          pages: {
            current_page,
            next: current_page < totalPages ? current_page + 1 : null,
            prev: current_page > 1 ? current_page - 1 : null,
          },
        };
      }
    );

    if (!transaction) {
      return getBadRequestResponse();
    }

    return getSuccessResponse(transaction);
  } catch (err: any) {
    return getBadRequestResponse(err?.message);
  }
};

// delete inspection item
export const deleteInspectionItemController: RouteHandler = async ({ url }) => {
  try {
    const id = url.searchParams.get("id");
    if (!id) {
      return getBadRequestResponse();
    }

    await DB.inspectionItems.delete(id);
    await DB.deletedItems.add({ id });
    return getSuccessResponse({
      message: "Inspection item deleted successfully",
    });
  } catch (err: any) {
    return getBadRequestResponse(err?.message);
  }
};

export const getRecommendationsController: RouteHandler = async () => {
  try {
    const recommendations = await DB.recommendations.toArray();
    return getSuccessResponse(recommendations);
  } catch (err: any) {
    return getBadRequestResponse(err?.message);
  }
};

export const addRecommendationByJobController: RouteHandler = async ({
  request,
  url,
}) => {
  try {
    const jobNumber = url.searchParams.get("jobNumber");
    if (!jobNumber) {
      return getBadRequestResponse();
    }

    const body = await request.json();

    const updated = await DB.jobs.update(jobNumber, body);
    if (updated === 0) {
      return getBadRequestResponse("Job not found");
    }
    return getSuccessResponse({ message: "Recommendation added successfully" });
  } catch (err: any) {
    return getBadRequestResponse(err?.message);
  }
};

export const removeRecommendationController: RouteHandler = async ({ url }) => {
  try {
    const jobNumber = url.searchParams.get("jobNumber");
    if (!jobNumber) {
      return getBadRequestResponse();
    }

    const updated = await DB.jobs.update(jobNumber, { recommendation: null });
    if (updated === 0) {
      return getBadRequestResponse("Job not found");
    }
    return getSuccessResponse({
      message: "Recommendation removed successfully",
    });
  } catch (err: any) {
    return getBadRequestResponse(err?.message);
  }
};

// non synced items
export const getNonSyncedItemsController: RouteHandler = async ({ url }) => {
  try {
    const jobNumber = url.searchParams.get("jobNumber");
    if (!jobNumber) {
      return getBadRequestResponse();
    }

    const transaction = await DB.transaction(
      "rw",
      DB.jobs,
      DB.inspectionItems,
      DB.deletedItems,
      async () => {
        const job = await DB.jobs.get(jobNumber);
        if (!job) {
          return null;
        }
        const allInspectionItemsNotSynced = await DB.inspectionItems
          .where("sync")
          .equals(job.report_id)
          .toArray();

        const deletedItems = await DB.deletedItems.toArray();

        return {
          ...job,
          inspectionItems: allInspectionItemsNotSynced,
          deletedItems,
        };
      }
    );

    if (!transaction) {
      return getBadRequestResponse("Job not found");
    }

    return getSuccessResponse(transaction);
  } catch (err: any) {
    return getBadRequestResponse(err?.message);
  }
};

// update synced items
export const updateSyncedItemsController: RouteHandler = async ({
  request,
}) => {
  try {
    const body = await request.json();

    if (body.inspectionItems && body.inspectionItems.length > 0) {
      await DB.inspectionItems
        .where("id")
        .anyOf(body.inspectionItems)
        .modify((item: any) => {
          item.sync = "Synced Online";
        });
    }

    await DB.deletedItems.clear();
    return getSuccessResponse({ message: "Items synced successfully" });
  } catch (err: any) {
    return getBadRequestResponse(err?.message);
  }
};

export const getPreviousReportController: RouteHandler = async ({ url }) => {
  try {
    const jobNumber = url.searchParams.get("jobNumber");
    if (!jobNumber) {
      return getBadRequestResponse();
    }

    const previousReport = await DB.previousReports.get(jobNumber);
    if (!previousReport) {
      return getBadRequestResponse("Report not found in offline database", 404);
    }
    return getSuccessResponse(previousReport);
  } catch (err: any) {
    return getBadRequestResponse(err?.message);
  }
};

export const setPreviousReportController: RouteHandler = async ({
  url,
  request,
}) => {
  try {
    const jobNumber = url.searchParams.get("jobNumber");
    if (!jobNumber) {
      return getBadRequestResponse();
    }

    const body = await request.json();
    if (!body) {
      return getBadRequestResponse();
    }

    await DB.previousReports.put({ ...body, jobNumber });
    return getSuccessResponse({
      message: "Previous report saved to offline database",
    });
  } catch (err: any) {
    return getBadRequestResponse(err?.message);
  }
};

export const getPreviousItemIdController: RouteHandler = async ({ url }) => {
  try {
    const report_id = url.searchParams.get("report_id");
    if (!report_id) {
      return getBadRequestResponse();
    }

    const allPreviousItems = await DB.inspectionItems
      .where({
        report_id: report_id,
        previousItem: 1,
      })
      .toArray();
    const previousItems = allPreviousItems.map((item: any) => ({
      id: item.id,
      previous_item_id: item.previous_item_id,
    }));
    return getSuccessResponse(previousItems);
  } catch (err: any) {
    return getBadRequestResponse();
  }
};

export const getPreviousItemsController: RouteHandler = async ({ url }) => {
  try {
    const report_id = url.searchParams.get("report_id");
    if (!report_id) {
      return getBadRequestResponse();
    }

    const allPreviousItems = await DB.inspectionItems
      .where({
        report_id: report_id,
        previousItem: 1,
      })
      .toArray();
    return getSuccessResponse(allPreviousItems);
  } catch (err: any) {
    return getBadRequestResponse();
  }
};

export const getLibraryItemsController: RouteHandler = async ({ url }) => {
  try {
    const id = url.searchParams.get("id");
    if (id) {
      const libraryItem = await DB.items.get(id);
      if (!libraryItem) {
        return getBadRequestResponse("Item not found");
      }
      return getSuccessResponse(libraryItem);
    }

    const page = url.searchParams.get("page");
    const name = url.searchParams.get("name");

    const category = url.searchParams.get("category");

    const perPage = 15;
    const pageNumber = Number(page);
    const skip = pageNumber === 0 ? 0 : (pageNumber - 1) * perPage;

    let itemsCollection;
    if (category) {
      itemsCollection = DB.items.where("category").equals(category);
    } else {
      itemsCollection = DB.items.toCollection();
    }

    if (name) {
      const allItems = await itemsCollection.toArray();
      const filteredItems = allItems.filter((item: any) =>
        item.name.toLowerCase().includes(name.toLowerCase())
      );
      return getSuccessResponse({
        data: filteredItems,
        pages: {
          current_page: 1,
          next: null,
          prev: null,
        },
      });
    }

    const total = await itemsCollection.count();
    const totalPages =
      total % perPage === 0 ? total / perPage : Math.ceil(total / perPage);

    const items = await itemsCollection.offset(skip).limit(perPage).toArray();

    const current_page = pageNumber === 0 ? 1 : pageNumber;
    return getSuccessResponse({
      data: items,
      pages: {
        current_page,
        next: current_page < totalPages ? current_page + 1 : null,
        prev: current_page > 1 ? current_page - 1 : null,
      },
    });
  } catch (err: any) {
    return getBadRequestResponse(err?.message);
  }
};
