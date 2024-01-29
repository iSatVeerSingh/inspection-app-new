import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard, { dashboardLoader } from "../layout/Dashboard";
import {
  ITEM_CATEGORIES,
  JOB_CATEGORIES,
  LIBRARY_ITEM,
  LIBRARY_ITEMS,
  LIBRARY_NOTES,
  NEW_LIBRARY_ITEM,
  RECOMMENDATIONS,
  SETTINGS,
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
      // {
      //   path: LIBRARY_ITEMS,
      //   element: <AllItems />,
      // },
      // {
      //   path: LIBRARY_ITEM,
      //   element: <Item />,
      // },
      // {
      //   path: CATEGORIES,
      //   element: <Categories />,
      // },
      // {
      //   path: USERS,
      //   element: <Users />,
      // },

      // {
      //   path: NEW_ITEM,
      //   element: <NewItem />,
      // },
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
