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

          const inspectionItems = await DB.inspectionItems
            .where("job_id")
            .equals(job.id)
            .count();
          return {
            ...job,
            inspectionItems,
          };
        }
      );

      if (!transaction) {
        return getBadRequestResponse("No Job found");
      }
      return getSuccessResponse(transaction);
    }

    const jobs = await DB.jobs.toArray();
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
export const startInspectionController: RouteHandler = async ({ url }) => {
  const jobNumber = url.searchParams.get("jobNumber");
  if (!jobNumber) {
    return getBadRequestResponse();
  }

  try {
    const isUpdated = await DB.jobs.update(jobNumber, {
      status: "In Progress",
    });
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
}) => {
  try {
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
