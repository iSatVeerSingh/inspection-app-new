import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard, { dashboardLoader } from "../layout/Dashboard";
import {
  ADD_ITEMS,
  ADD_NOTES,
  INSPECTION_ITEM_PREVIEW,
  ITEM_CATEGORIES,
  JOBS,
  JOB_CATEGORIES,
  JOB_DETAILS,
  LIBRARY_ITEM,
  LIBRARY_ITEMS,
  LIBRARY_NOTES,
  NEW_LIBRARY_ITEM,
  RECOMMENDATIONS,
  SETTINGS,
  VIEW_EDIT_ITEMS,
  VIEW_EDIT_NOTES,
} from "./paths";
import Company from "../pages/Settings/Company";
import AllItemsLibrary from "../pages/Items/AllItemsLibrary";
import LibraryItem from "../pages/Items/LibraryItem";
import NewItem from "../pages/Items/NewItem";
import Categories from "../pages/Items/Categories";
import NotesLibrary from "../pages/Settings/NotesLibrary";
import JobCategories from "../pages/Settings/JobCategories";
import Init from "../pages/Init";
import Recommendations from "../pages/Settings/Recommendations";
import Jobs from "../pages/Jobs/Jobs";
import Job from "../pages/Jobs/Job";
import AddNotes from "../pages/Jobs/AddNotes";
import ViewNotes from "../pages/Jobs/ViewNotes";
import AddItems from "../pages/Jobs/AddItems";
import ViewItems from "../pages/Jobs/ViewItems";
import ItemPreview from "../pages/Jobs/ItemPreview";
// import {
//   CATEGORIES,
//   LIBRARY_ITEM,
//   LIBRARY_ITEMS,
//   NEW_ITEM,
//   USERS,
// } from "./paths";
// import Users from "../pages/Users";
// import AllItems from "../pages/Items/AllItems";
// import NewItem from "../pages/Items/NewItem";
// import Categories from "../pages/Items/Categories";
// import Item from "../pages/Items/Item";

export default createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
    loader: dashboardLoader,
    children: [
      {
        path: JOBS,
        element: <Jobs />,
      },
      {
        path: JOB_DETAILS,
        element: <Job />,
      },
      {
        path: ADD_NOTES,
        element: <AddNotes />,
      },
      {
        path: VIEW_EDIT_NOTES,
        element: <ViewNotes />,
      },
      {
        path: ADD_ITEMS,
        element: <AddItems />,
      },
      {
        path: VIEW_EDIT_ITEMS,
        element: <ViewItems />,
      },
      {
        path: INSPECTION_ITEM_PREVIEW,
        element: <ItemPreview />,
      },
      {
        path: SETTINGS,
        children: [
          { index: true, element: <Company /> },
          {
            path: LIBRARY_ITEMS,
            element: <AllItemsLibrary />,
          },
          {
            path: LIBRARY_ITEM,
            element: <LibraryItem />,
          },
          {
            path: NEW_LIBRARY_ITEM,
            element: <NewItem />,
          },
          {
            path: ITEM_CATEGORIES,
            element: <Categories />,
          },
          {
            path: LIBRARY_NOTES,
            element: <NotesLibrary />,
          },
          {
            path: JOB_CATEGORIES,
            element: <JobCategories />,
          },
          {
            path: RECOMMENDATIONS,
            element: <Recommendations />,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/init",
    element: <Init />,
  },
]);
