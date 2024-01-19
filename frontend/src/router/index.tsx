import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard, { dashboardLoader } from "../layout/Dashboard";
import { USERS } from "./paths";
import Users from "../pages/Users";

export default createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
    loader: dashboardLoader,
    children: [
      {
        path: USERS,
        element: <Users />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);
