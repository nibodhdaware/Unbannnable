import {
    pgTable,
    serial,
    text,
    varchar,
    timestamp,
    integer,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    clerkId: varchar("clerk_id", { length: 256 }).notNull().unique(),
    fullName: text("full_name"),
    username: varchar("username", { length: 64 }),
    email: varchar("email", { length: 256 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptions = pgTable("subscriptions", {
    id: serial("id").primaryKey(),
    subscriptionId: varchar("subscription_id", { length: 255 })
        .notNull()
        .unique(),
    customerId: varchar("customer_id", { length: 255 }),
    userId: integer("user_id").references(() => users.id, {
        onDelete: "cascade",
    }),
    clerkId: varchar("clerk_id", { length: 255 }),
    email: varchar("email", { length: 255 }).notNull(),
    status: varchar("status", { length: 50 }).notNull().default("active"), // active, on_hold, failed, cancelled
    productId: varchar("product_id", { length: 255 }).notNull(),
    amount: integer("amount").notNull(), // Amount in cents
    currency: varchar("currency", { length: 3 }).default("USD"),
    lastRenewalAt: timestamp("last_renewal_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
    id: serial("id").primaryKey(),
    paymentId: varchar("payment_id", { length: 255 }).notNull().unique(),
    subscriptionId: varchar("subscription_id", { length: 255 }).references(
        () => subscriptions.subscriptionId,
        { onDelete: "set null" },
    ),
    userId: integer("user_id").references(() => users.id, {
        onDelete: "cascade",
    }),
    amount: integer("amount").notNull(), // Amount in cents
    currency: varchar("currency", { length: 3 }).default("USD"),
    status: varchar("status", { length: 50 }).notNull(), // succeeded, failed, pending
    paymentMethod: varchar("payment_method", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
    id: serial("id").primaryKey(),
    userId: serial("user_id").references(() => users.id),
    title: varchar("title", { length: 300 }).notNull(),
    body: text("body"),
    createdAt: timestamp("created_at").defaultNow(),
});
