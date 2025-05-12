import { 
  User, InsertUser, 
  Transaction, InsertTransaction,
  PaymentMethod, InsertPaymentMethod,
  Message, InsertMessage,
  Task, InsertTask,
  users, wallets, transactions, paymentMethods, messages, tasks
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Wallet methods
  getUserBalance(userId: number): Promise<number>;
  updateUserBalance(userId: number, amount: number): Promise<number>;
  
  // Transaction methods
  getTransactions(userId: number, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  
  // Payment method methods
  getPaymentMethods(userId: number): Promise<PaymentMethod[]>;
  getDefaultPaymentMethod(userId: number): Promise<PaymentMethod | undefined>;
  createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod>;
  setDefaultPaymentMethod(id: number): Promise<PaymentMethod>;
  
  // Message methods
  getMessages(userId: number, limit?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Task methods
  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTaskStatus(id: number, status: string): Promise<Task>;
  deleteTask(id: number): Promise<void>;
}

// DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    // Create wallet for new user
    await db.insert(wallets).values({
      userId: user.id,
      balance: 0
    });
    
    return user;
  }
  
  // Wallet methods
  async getUserBalance(userId: number): Promise<number> {
    const [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    return wallet?.balance || 0;
  }
  
  async updateUserBalance(userId: number, amount: number): Promise<number> {
    // Get current wallet or create if it doesn't exist
    let [wallet] = await db
      .select()
      .from(wallets)
      .where(eq(wallets.userId, userId));
    
    if (!wallet) {
      [wallet] = await db
        .insert(wallets)
        .values({ userId, balance: 0 })
        .returning();
    }
    
    // Update balance
    const newBalance = wallet.balance + amount;
    
    const [updatedWallet] = await db
      .update(wallets)
      .set({ balance: newBalance })
      .where(eq(wallets.id, wallet.id))
      .returning();
    
    return updatedWallet.balance;
  }
  
  // Transaction methods
  async getTransactions(userId: number, limit?: number): Promise<Transaction[]> {
    const query = db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date));
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query;
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values({
        ...transaction,
        metadata: {}  // Add empty metadata object
      })
      .returning();
    
    return newTransaction;
  }
  
  // Payment method methods
  async getPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    return await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.userId, userId));
  }
  
  async getDefaultPaymentMethod(userId: number): Promise<PaymentMethod | undefined> {
    const [method] = await db
      .select()
      .from(paymentMethods)
      .where(
        and(
          eq(paymentMethods.userId, userId),
          eq(paymentMethods.isDefault, true)
        )
      );
    
    return method;
  }
  
  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    // If this is default, unset other defaults
    if (method.isDefault) {
      await db
        .update(paymentMethods)
        .set({ isDefault: false })
        .where(eq(paymentMethods.userId, method.userId));
    }
    
    const [newMethod] = await db
      .insert(paymentMethods)
      .values(method)
      .returning();
    
    return newMethod;
  }
  
  async setDefaultPaymentMethod(id: number): Promise<PaymentMethod> {
    // Get the payment method first
    const [method] = await db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id));
    
    if (!method) {
      throw new Error("Payment method not found");
    }
    
    // Unset all defaults for this user
    await db
      .update(paymentMethods)
      .set({ isDefault: false })
      .where(eq(paymentMethods.userId, method.userId));
    
    // Set this one as default
    const [updatedMethod] = await db
      .update(paymentMethods)
      .set({ isDefault: true })
      .where(eq(paymentMethods.id, id))
      .returning();
    
    return updatedMethod;
  }
  
  // Message methods
  async getMessages(userId: number, limit?: number): Promise<Message[]> {
    const query = db
      .select()
      .from(messages)
      .where(eq(messages.userId, userId))
      .orderBy(messages.timestamp);
    
    if (limit) {
      query.limit(limit);
    }
    
    return await query;
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    
    return newMessage;
  }
  
  // Task methods
  async getTasks(userId: number): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId));
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));
    
    return task;
  }
  
  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db
      .insert(tasks)
      .values(task)
      .returning();
    
    return newTask;
  }
  
  async updateTaskStatus(id: number, status: string): Promise<Task> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ status })
      .where(eq(tasks.id, id))
      .returning();
    
    if (!updatedTask) {
      throw new Error("Task not found");
    }
    
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<void> {
    await db
      .delete(tasks)
      .where(eq(tasks.id, id));
  }
  
  // This method will initialize the database with default data
  async initDefaultData() {
    try {
      // Check if we already have data
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, "demo"));
      
      if (existingUser) {
        return; // Data already exists
      }
      
      // Create default user
      const [user] = await db
        .insert(users)
        .values({
          username: "demo",
          password: "password",
          preferences: {}
        })
        .returning();
      
      // Create wallet with initial balance
      const [wallet] = await db
        .insert(wallets)
        .values({
          userId: user.id,
          balance: 249.5
        })
        .returning();
      
      // Add default payment methods
      await db
        .insert(paymentMethods)
        .values({
          userId: user.id,
          type: "visa",
          last4: "4242",
          expiryDate: "05/25",
          isDefault: true
        });
      
      await db
        .insert(paymentMethods)
        .values({
          userId: user.id,
          type: "mastercard",
          last4: "8790",
          expiryDate: "11/24",
          isDefault: false
        });
      
      // Add initial transactions
      await db
        .insert(transactions)
        .values([
          {
            userId: user.id,
            amount: -21.98,
            description: "Pizza Express",
            type: "food",
            date: new Date(Date.now() - 30 * 60000), // 30 minutes ago
            metadata: {}
          },
          {
            userId: user.id,
            amount: -28.00,
            description: "Movie Tickets",
            type: "ticket",
            date: new Date(Date.now() - 24 * 60 * 60000), // 1 day ago
            metadata: {}
          },
          {
            userId: user.id,
            amount: 100.00,
            description: "Added Funds",
            type: "topup",
            date: new Date(Date.now() - 5 * 24 * 60 * 60000), // 5 days ago
            metadata: {}
          }
        ]);
    } catch (error) {
      console.error("Error initializing default data:", error);
      throw error;
    }
  }
}

// Create instance and initialize it with default data
export const storage = new DatabaseStorage();
// Initialize the database with some data
storage.initDefaultData().catch(console.error);