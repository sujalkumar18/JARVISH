import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  preferences: jsonb("preferences").default({}).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  email: true,
  password: true,
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Wallet
export const wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  balance: real("balance").notNull().default(0),
});

export const insertWalletSchema = createInsertSchema(wallets).pick({
  userId: true,
  balance: true,
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // food, ticket, topup, etc.
  date: timestamp("date").defaultNow().notNull(),
  metadata: jsonb("metadata").default({}),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  description: true,
  type: true,
});

// Payment Methods
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // visa, mastercard, etc.
  last4: text("last4").notNull(),
  expiryDate: text("expiry_date").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).pick({
  userId: true,
  type: true,
  last4: true,
  expiryDate: true,
  isDefault: true,
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // user, assistant
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  content: true,
  type: true,
});

// Tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // food, ticket
  status: text("status").notNull(), // pending, confirmed, cancelled, delivered
  data: jsonb("data").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  userId: true,
  type: true,
  status: true,
  data: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  wallet: one(wallets, {
    fields: [users.id],
    references: [wallets.userId],
  }),
  transactions: many(transactions),
  paymentMethods: many(paymentMethods),
  messages: many(messages),
  tasks: many(tasks),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  user: one(users, {
    fields: [paymentMethods.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));
