import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard, { dashboardLoader } from "../layout/Dashboard";
import { CATEGORIES, LIBRARY_ITEMS, NEW_ITEM, USERS } from "./paths";
import Users from "../pages/Users";
import AllItems from "../pages/Items/AllItems";
import NewItem from "../pages/Items/NewItem";
import Categories from "../pages/Items/Categories";

export default createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
    loader: dashboardLoader,
    children: [
      {
        path: LIBRARY_ITEMS,
        element: <AllItems />,
      },
      {
        path: CATEGORIES,
        element: <Categories />
      },
      {
        path: USERS,
        element: <Users />,
      },
      
      {
        path: NEW_ITEM,
        element: <NewItem />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);
