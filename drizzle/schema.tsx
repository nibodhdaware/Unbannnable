import { pgTable, serial, text, varchar, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    fullName: text("full_name"),
    username: varchar("username", { length: 64 }).notNull().unique(),
    email: varchar("email", { length: 256 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const posts = pgTable("posts", {
    id: serial("id").primaryKey(),
    userId: serial("user_id").references(() => users.id),
    title: varchar("title", { length: 300 }).notNull(),
    body: text("body"),
    createdAt: timestamp("created_at").defaultNow(),
});
