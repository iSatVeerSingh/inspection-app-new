import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard, { dashboardLoader } from "../layout/Dashboard";
import { LIBRARY_ITEMS, SETTINGS } from "./paths";
import AllItems from "../pages/Items/AllItems";
import Company from "../pages/Settings/Company";
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
        element: <Company />,
        children: [
          {
            path: LIBRARY_ITEMS,
            element: <AllItems />,
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);
