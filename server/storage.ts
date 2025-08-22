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
  getUserByName(firstName: string, lastName: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
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

  async getUserByName(firstName: string, lastName: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(and(eq(users.firstName, firstName), eq(users.lastName, lastName)));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
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
          password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewgTdvLNs.xKzXdq", // hashed "password123"
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

// MemStorage implementation for demo purposes
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private balances: Map<number, number>;
  private transactions: Map<number, Transaction[]>;
  private paymentMethods: Map<number, PaymentMethod[]>;
  private messages: Map<number, Message[]>;
  private tasks: Map<number, Task>;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.balances = new Map();
    this.transactions = new Map();
    this.paymentMethods = new Map();
    this.messages = new Map();
    this.tasks = new Map();
    this.currentId = {
      users: 1,
      transactions: 1,
      paymentMethods: 1,
      messages: 1,
      tasks: 1
    };
    
    this.initDefaultData();
  }
  
  private initDefaultData() {
    const user: User = {
      id: 1,
      firstName: "Demo",
      lastName: "User",
      email: "demo@example.com",
      password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewgTdvLNs.xKzXdq", // hashed "password123"
      preferences: {},
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    this.balances.set(user.id, 249.5);
    
    const paymentMethod1: PaymentMethod = {
      id: 1,
      userId: user.id,
      type: "visa",
      last4: "4242",
      expiryDate: "05/25",
      isDefault: true
    };
    
    const paymentMethod2: PaymentMethod = {
      id: 2,
      userId: user.id,
      type: "mastercard",
      last4: "8790",
      expiryDate: "11/24",
      isDefault: false
    };
    
    this.paymentMethods.set(user.id, [paymentMethod1, paymentMethod2]);
    
    const transactions: Transaction[] = [
      {
        id: 1,
        userId: user.id,
        amount: -21.98,
        description: "Pizza Express",
        type: "food",
        date: new Date(Date.now() - 30 * 60000),
        metadata: {}
      },
      {
        id: 2,
        userId: user.id,
        amount: -28.00,
        description: "Movie Tickets",
        type: "ticket",
        date: new Date(Date.now() - 24 * 60 * 60000),
        metadata: {}
      },
      {
        id: 3,
        userId: user.id,
        amount: 100.00,
        description: "Added Funds",
        type: "topup",
        date: new Date(Date.now() - 5 * 24 * 60 * 60000),
        metadata: {}
      }
    ];
    
    this.transactions.set(user.id, transactions);
    this.currentId.users = 2;
    this.currentId.paymentMethods = 3;
    this.currentId.transactions = 4;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByName(firstName: string, lastName: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firstName === firstName && user.lastName === lastName
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { 
      ...insertUser, 
      id, 
      preferences: {},
      createdAt: new Date()
    };
    this.users.set(id, user);
    
    // Create wallet for new user
    this.balances.set(id, 0);
    
    return user;
  }
  
  async getUserBalance(userId: number): Promise<number> {
    return this.balances.get(userId) || 0;
  }
  
  async updateUserBalance(userId: number, amount: number): Promise<number> {
    const currentBalance = await this.getUserBalance(userId);
    const newBalance = currentBalance + amount;
    this.balances.set(userId, newBalance);
    return newBalance;
  }
  
  async getTransactions(userId: number, limit?: number): Promise<Transaction[]> {
    const userTransactions = this.transactions.get(userId) || [];
    const sorted = [...userTransactions].sort((a, b) => b.date.getTime() - a.date.getTime());
    return limit ? sorted.slice(0, limit) : sorted;
  }
  
  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentId.transactions++;
    const newTransaction: Transaction = { 
      ...transaction, 
      id, 
      date: new Date(), 
      metadata: {} 
    };
    
    const userTransactions = this.transactions.get(transaction.userId) || [];
    userTransactions.push(newTransaction);
    this.transactions.set(transaction.userId, userTransactions);
    
    return newTransaction;
  }
  
  async getPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    return this.paymentMethods.get(userId) || [];
  }
  
  async getDefaultPaymentMethod(userId: number): Promise<PaymentMethod | undefined> {
    const methods = await this.getPaymentMethods(userId);
    return methods.find(method => method.isDefault);
  }
  
  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.currentId.paymentMethods++;
    const newPaymentMethod: PaymentMethod = { 
      ...paymentMethod, 
      id,
      isDefault: paymentMethod.isDefault ?? false
    };
    
    const userMethods = this.paymentMethods.get(paymentMethod.userId) || [];
    
    if (newPaymentMethod.isDefault) {
      userMethods.forEach(method => method.isDefault = false);
    }
    
    userMethods.push(newPaymentMethod);
    this.paymentMethods.set(paymentMethod.userId, userMethods);
    
    return newPaymentMethod;
  }
  
  async setDefaultPaymentMethod(id: number): Promise<PaymentMethod> {
    let targetMethod: PaymentMethod | undefined;
    
    for (const [userId, methods] of Array.from(this.paymentMethods.entries())) {
      for (const method of methods) {
        if (method.id === id) {
          targetMethod = method;
          methods.forEach((m: PaymentMethod) => m.isDefault = m.id === id);
          this.paymentMethods.set(userId, methods);
          break;
        }
      }
      if (targetMethod) break;
    }
    
    if (!targetMethod) {
      throw new Error("Payment method not found");
    }
    
    return targetMethod;
  }
  
  async getMessages(userId: number, limit?: number): Promise<Message[]> {
    const userMessages = this.messages.get(userId) || [];
    const sorted = [...userMessages].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return limit ? sorted.slice(0, limit) : sorted;
  }
  
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.currentId.messages++;
    const newMessage: Message = { ...message, id, timestamp: new Date() };
    
    const userMessages = this.messages.get(message.userId) || [];
    userMessages.push(newMessage);
    this.messages.set(message.userId, userMessages);
    
    return newMessage;
  }
  
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(task => task.userId === userId);
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async createTask(task: InsertTask): Promise<Task> {
    const id = this.currentId.tasks++;
    const newTask: Task = { ...task, id, timestamp: new Date() };
    this.tasks.set(id, newTask);
    return newTask;
  }
  
  async updateTaskStatus(id: number, status: string): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error("Task not found");
    }
    
    task.status = status;
    this.tasks.set(id, task);
    return task;
  }
  
  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
  }
}

// Use MemStorage for demo (works without database setup)
export const storage = new MemStorage();