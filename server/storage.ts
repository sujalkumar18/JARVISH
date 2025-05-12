import { 
  User, InsertUser, 
  Transaction, InsertTransaction,
  PaymentMethod, InsertPaymentMethod,
  Message, InsertMessage,
  Task, InsertTask
} from "@shared/schema";

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

// MemStorage implementation
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
    
    // Initialize with a default user and some data
    this.initDefaultData();
  }
  
  private initDefaultData() {
    // Create default user
    const user: User = {
      id: 1,
      username: "demo",
      password: "password",
      preferences: {}
    };
    this.users.set(user.id, user);
    
    // Set initial balance
    this.balances.set(user.id, 249.5);
    
    // Add default payment methods
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
    
    // Add some initial transactions
    const transactions: Transaction[] = [
      {
        id: 1,
        userId: user.id,
        amount: -21.98,
        description: "Pizza Express",
        type: "food",
        date: new Date(Date.now() - 30 * 60000), // 30 minutes ago
        metadata: {}
      },
      {
        id: 2,
        userId: user.id,
        amount: -28.00,
        description: "Movie Tickets",
        type: "ticket",
        date: new Date(Date.now() - 24 * 60 * 60000), // 1 day ago
        metadata: {}
      },
      {
        id: 3,
        userId: user.id,
        amount: 100.00,
        description: "Added Funds",
        type: "topup",
        date: new Date(Date.now() - 5 * 24 * 60 * 60000), // 5 days ago
        metadata: {}
      }
    ];
    
    this.transactions.set(user.id, transactions);
    
    // Set next IDs
    this.currentId.users = 2;
    this.currentId.paymentMethods = 3;
    this.currentId.transactions = 4;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = { ...insertUser, id, preferences: {} };
    this.users.set(id, user);
    return user;
  }
  
  // Wallet methods
  async getUserBalance(userId: number): Promise<number> {
    return this.balances.get(userId) || 0;
  }
  
  async updateUserBalance(userId: number, amount: number): Promise<number> {
    const currentBalance = await this.getUserBalance(userId);
    const newBalance = currentBalance + amount;
    this.balances.set(userId, newBalance);
    return newBalance;
  }
  
  // Transaction methods
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
      metadata: transaction.metadata || {} 
    };
    
    const userTransactions = this.transactions.get(transaction.userId) || [];
    userTransactions.push(newTransaction);
    this.transactions.set(transaction.userId, userTransactions);
    
    return newTransaction;
  }
  
  // Payment method methods
  async getPaymentMethods(userId: number): Promise<PaymentMethod[]> {
    return this.paymentMethods.get(userId) || [];
  }
  
  async getDefaultPaymentMethod(userId: number): Promise<PaymentMethod | undefined> {
    const methods = await this.getPaymentMethods(userId);
    return methods.find(method => method.isDefault);
  }
  
  async createPaymentMethod(paymentMethod: InsertPaymentMethod): Promise<PaymentMethod> {
    const id = this.currentId.paymentMethods++;
    const newPaymentMethod: PaymentMethod = { ...paymentMethod, id };
    
    const userMethods = this.paymentMethods.get(paymentMethod.userId) || [];
    
    // If this is set as default, update other methods
    if (newPaymentMethod.isDefault) {
      userMethods.forEach(method => method.isDefault = false);
    }
    
    userMethods.push(newPaymentMethod);
    this.paymentMethods.set(paymentMethod.userId, userMethods);
    
    return newPaymentMethod;
  }
  
  async setDefaultPaymentMethod(id: number): Promise<PaymentMethod> {
    let targetMethod: PaymentMethod | undefined;
    
    // Find the method and its user
    for (const [userId, methods] of this.paymentMethods.entries()) {
      for (const method of methods) {
        if (method.id === id) {
          targetMethod = method;
          
          // Update all methods for this user
          methods.forEach(m => m.isDefault = m.id === id);
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
  
  // Message methods
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
  
  // Task methods
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

export const storage = new MemStorage();
