import Dexie, { Table } from "dexie";
export class InspectionDatabase extends Dexie {
  user!: Table<any>;
  items!: Table<any>;
  categories!: Table<any>;
  notes!: Table<any>;
  recommendations!: Table<any>;
  jobCategories!: Table<any>;
  jobs!: Table<any>;
  inspectionItems!: Table<any>;
  sync!: Table<any>;
  previousReports!: Table<any>;
  deletedItems!: Table<any>;


  constructor() {
    super("inspection-db");
    this.version(10).stores({
      user: "++type",
      items: "++id, [category+name], name",
      categories: "++id",
      notes: "++id, category",
      recommendations: "++id",
      jobCategories: "++id",
      jobs: "++jobNumber, id, [status+category], startsAt",
      inspectionItems:
        "++id, report_id, name, category, custom, previousItem, sync, [report_id+previousItem+category]",
      sync: "++type, lastSync",
      previousReports: "++jobNumber, customer_id",
      deletedItems: '++id'
    });
  }
}

export const DB = new InspectionDatabase();
