import Dexie, { Table } from "dexie";
export class InspectionDatabase extends Dexie {
  user!: Table<any>;
  items!: Table<any>;
  categories!: Table<any>;
  notes!: Table<any>;

  constructor() {
    super("inspection-db");
    this.version(1).stores({
      user: "++type",
      items: "++id, [category+name], name",
      categories: "++id",
      notes: "++id, category",
    });
  }
}

export const DB = new InspectionDatabase();
