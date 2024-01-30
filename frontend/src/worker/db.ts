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

  constructor() {
    super("inspection-db");
    this.version(1).stores({
      user: "++type",
      items: "++id, [category+name], name",
      categories: "++id",
      notes: "++id, category",
      recommendations: "++id",
      jobCategories: "++id",
      jobs: "++jobNumber, id, [status+category]",
      inspectionItems: "++id, job_id, name, category, custom, previousItem",
    });
  }
}

export const DB = new InspectionDatabase();