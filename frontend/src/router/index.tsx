import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard, { dashboardLoader } from "../layout/Dashboard";

export default createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
    loader: dashboardLoader,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);
