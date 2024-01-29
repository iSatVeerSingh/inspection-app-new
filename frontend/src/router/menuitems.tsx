import {
  JobIcon,
  ItemsIcon,
  NotesIcon,
  UserIcon,
  SettingsIcon,
} from "../icons";
import * as paths from "./paths";

export default [
  // {
  //   path: paths.JOBS,
  //   name: "Jobs",
  //   // icon: JobIcon,
  // },
  // {
  //   path: paths.LIBRARY_ITEMS,
  //   name: "Library Items",
  //   // icon: ItemsIcon,
  // },
  // {
  //   path: paths.CATEGORIES,
  //   name: "Item Categories",
  // },
  // {
  //   path: paths.INSPECTION_NOTES,
  //   name: "Inspection Notes",
  //   // icon: NotesIcon,
  // },
  // {
  //   path: paths.USERS,
  //   name: "Users",
  //   // icon: UserIcon,
  // },
  // {
  //   path: paths.SETTINGS,
  //   name: "Settings",
  //   // icon: SettingsIcon,
  // },
  {
    path: paths.SETTINGS,
    name: "Settings",
    icon: SettingsIcon,
    children: [
      {
        path: paths.LIBRARY_ITEMS,
        name: "Items Library",
      },
      {
        path: paths.ITEM_CATEGORIES,
        name: "Item Categories",
      },
      {
        path: paths.LIBRARY_NOTES,
        name: "Notes Library",
      },
      {
        path: paths.JOB_CATEGORIES,
        name: "Job Categories",
      },
      {
        path: paths.RECOMMENDATIONS,
        name: "Recommendations",
      },
    ],
  },
];
