import {
  JobIcon,
  ItemsIcon,
  NotesIcon,
  UserIcon,
  SettingsIcon,
} from "../icons";
import * as paths from "./paths";

export default [
  {
    path: paths.JOBS,
    name: "Jobs",
  },
  {
    path: paths.ITEMS_LIBRARY,
    name: "Items Library",
  },
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
