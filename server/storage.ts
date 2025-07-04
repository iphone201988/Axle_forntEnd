import { 
  users, 
  notifications,
  type User, 
  type InsertUser 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserNotifications(userId: number): Promise<any[]>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  createNotification(notification: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getUserNotifications(userId: number): Promise<any[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  async createNotification(notification: any): Promise<any> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }
}

export const storage = new DatabaseStorage();