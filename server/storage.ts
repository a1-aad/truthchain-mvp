import { db } from "../db";
import { newsRecords } from "@shared/schema";
import type { NewsRecord, InsertNewsRecord } from "@shared/schema";
import { desc } from "drizzle-orm";

export interface IStorage {
  getAllRecords(): Promise<NewsRecord[]>;
  createRecord(record: InsertNewsRecord): Promise<NewsRecord>;
}

export class DbStorage implements IStorage {
  async getAllRecords(): Promise<NewsRecord[]> {
    return await db.select().from(newsRecords).orderBy(desc(newsRecords.timestamp));
  }

  async createRecord(record: InsertNewsRecord): Promise<NewsRecord> {
    const [created] = await db.insert(newsRecords).values(record).returning();
    return created;
  }
}

export const storage = new DbStorage();
