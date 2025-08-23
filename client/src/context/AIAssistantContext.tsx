import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { Transaction, PaymentMethod } from "@shared/schema";

export type MessageType = "user" | "assistant";

export interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
}

export interface FoodOrderTask {
  id: string;
  type: "food";
  status: "pending" | "confirmed" | "cancelled" | "delivered";
  restaurant: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
  deliveryFee: number;
  total: number;
  image: string;
  rating: number;
  deliveryTime: string;
  distance: string;
  orderNumber?: string;
}

export interface TicketTask {
  id: string;
  type: "ticket";
  status: "select" | "confirmed" | "cancelled";
  venue: string;
  options: {
    movie: string;
    time: string;
    tickets: number;
  };
  ticketPrice: number;
  serviceFee: number;
  total: number;
  image: string;
}

export interface NewsTask {
  id: string;
  type: "news";
  status: "display";
  category: string;
  articles: {
    title: string;
    description: string;
    url: string;
    urlToImage?: string;
    publishedAt: string;
    source: string;
  }[];
}

export interface DictionaryTask {
  id: string;
  type: "dictionary";
  status: "display";
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }[];
  }[];
  translations?: {
    language: string;
    languageName: string;
    translatedWord: string;
    translatedDefinitions?: string[];
  }[];
}

export interface WeatherTask {
  id: string;
  type: "weather";
  status: "display";
  location: string;
  country?: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  description: string;
  main: string;
  icon: string;
  windSpeed: number;
  visibility: string;
}

export interface CurrencyTask {
  id: string;
  type: "currency";
  status: "display";
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  exchangeRate: string;
  convertedAmount: string;
  lastUpdated: string;
}

export interface EntertainmentTask {
  id: string;
  type: "entertainment";
  status: "display";
  contentType: "joke" | "quote";
  content: string;
  author?: string;
  category?: string;
  tags?: string[];
}

export interface WikipediaTask {
  id: string;
  type: "wikipedia";
  status: "display";
  title: string;
  extract: string;
  thumbnail: string;
  pageUrl?: string;
  lang: string;
  searchTerm: string;
}

export type Task = FoodOrderTask | TicketTask | NewsTask | DictionaryTask | WeatherTask | CurrencyTask | EntertainmentTask | WikipediaTask;

export interface WalletState {
  balance: number;
  transactions: Transaction[];
  paymentMethods: PaymentMethod[];
}

export interface SettingsState {
  voiceResponses: boolean;
  voiceSpeed: number;
  autoPayment: boolean;
  paymentNotifications: boolean;
  saveHistory: boolean;
}

interface AIAssistantContextType {
  messages: Message[];
  tasks: Task[];
  isListening: boolean;
  isTyping: boolean;
  userInput: string;
  wallet: WalletState;
  settings: SettingsState;
  addMessage: (content: string, type: MessageType) => void;
  setIsListening: (value: boolean) => void;
  setIsTyping: (value: boolean) => void;
  setUserInput: (value: string) => void;
  handleSendMessage: (content: string) => Promise<void>;
  handleVoiceInput: (transcript: string) => Promise<void>;
  updateWalletBalance: (amount: number) => Promise<void>;
  confirmTask: (taskId: string) => Promise<void>;
  cancelTask: (taskId: string) => Promise<void>;
  updateSettings: (newSettings: Partial<SettingsState>) => void;
  clearHistory: () => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hi there! I'm Jarvish, your AI assistant. I can help you order food, book tickets, manage payments, and more. Just ask me anything!",
      type: "assistant",
      timestamp: new Date(),
    },
  ]);
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  
  const [wallet, setWallet] = useState<WalletState>({
    balance: 249.50,
    transactions: [],
    paymentMethods: [
      { id: 1, userId: 1, type: "visa", last4: "4242", expiryDate: "05/25", isDefault: true },
      { id: 2, userId: 1, type: "mastercard", last4: "8790", expiryDate: "11/24", isDefault: false }
    ]
  });
  
  const [settings, setSettings] = useState<SettingsState>({
    voiceResponses: true,
    voiceSpeed: 1,
    autoPayment: true,
    paymentNotifications: true,
    saveHistory: true
  });
  
  const { speak } = useSpeechSynthesis();

  const addMessage = useCallback((content: string, type: MessageType) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      type,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Speak assistant messages if voice responses are enabled
    if (type === "assistant" && settings.voiceResponses) {
      speak(content, settings.voiceSpeed);
    }
  }, [settings.voiceResponses, settings.voiceSpeed, speak]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    // Add user message
    addMessage(content, "user");
    
    // Clear input
    setUserInput("");
    
    // Show typing indicator
    setIsTyping(true);
    
    try {
      // Process message with backend API
      const response = await apiRequest("POST", "/api/assistant/message", {
        message: content
      });
      
      const data = await response.json();
      
      // Add AI response
      addMessage(data.message, "assistant");
      
      // Add task if returned
      if (data.task) {
        setTasks(prev => [...prev, data.task]);
      }
      
      // Update wallet if transaction occurred
      if (data.transaction) {
        updateWalletBalance(data.transaction.amount);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      addMessage("Sorry, I encountered an error processing your request. Please try again.", "assistant");
    } finally {
      setIsTyping(false);
    }
  }, [addMessage]);

  const handleVoiceInput = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;
    await handleSendMessage(transcript);
  }, [handleSendMessage]);

  const updateWalletBalance = useCallback(async (amount: number) => {
    try {
      const response = await apiRequest("POST", "/api/wallet/update", {
        amount
      });
      
      const data = await response.json();
      
      setWallet(prev => ({
        ...prev,
        balance: data.balance,
        transactions: data.transactions
      }));
    } catch (error) {
      console.error("Error updating wallet:", error);
    }
  }, []);

  const confirmTask = useCallback(async (taskId: string) => {
    try {
      // Find the task by ID
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        console.error("Task not found:", taskId);
        return;
      }
      
      // Use the auto top-up feature if enabled (only for tasks with payment)
      if ((task.type === 'food' || task.type === 'ticket') && settings.autoPayment && wallet.balance < task.total) {
        // Top-up notification
        addMessage(`Your wallet balance is insufficient. Auto top-up will be applied to complete this payment.`, "assistant");
      }
      
      const response = await apiRequest("POST", "/api/tasks/confirm", {
        taskId,
        autoTopUp: settings.autoPayment
      });
      
      const data = await response.json();
      
      // Update tasks
      setTasks(prev => prev.map(t => 
        t.id === taskId ? data.task : t
      ));
      
      // Update wallet if payment was made
      if (data.transaction) {
        updateWalletBalance(data.transaction.amount);
        
        // If there was an auto top-up transaction, update that as well
        if (data.topUpTransaction) {
          updateWalletBalance(data.topUpTransaction.amount);
        }
      }
      
      // Add confirmation message
      addMessage(data.message, "assistant");
    } catch (error) {
      console.error("Error confirming task:", error);
      addMessage("Sorry, there was an error processing your request. Please try again.", "assistant");
    }
  }, [addMessage, updateWalletBalance, tasks, settings.autoPayment, wallet.balance]);

  const cancelTask = useCallback(async (taskId: string) => {
    try {
      const response = await apiRequest("POST", "/api/tasks/cancel", {
        taskId
      });
      
      const data = await response.json();
      
      // Update tasks
      setTasks(prev => prev.map(task => 
        task.id === taskId ? data.task : task
      ));
      
      // Add cancellation message
      addMessage(data.message, "assistant");
    } catch (error) {
      console.error("Error cancelling task:", error);
    }
  }, [addMessage]);

  const updateSettings = useCallback((newSettings: Partial<SettingsState>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([
      {
        id: "welcome",
        content: "Hi there! I'm Jarvish, your AI assistant. I can help you order food, book tickets, manage payments, and more. Just ask me anything!",
        type: "assistant",
        timestamp: new Date(),
      },
    ]);
    setTasks([]);
  }, []);

  return (
    <AIAssistantContext.Provider
      value={{
        messages,
        tasks,
        isListening,
        isTyping,
        userInput,
        wallet,
        settings,
        addMessage,
        setIsListening,
        setIsTyping,
        setUserInput,
        handleSendMessage,
        handleVoiceInput,
        updateWalletBalance,
        confirmTask,
        cancelTask,
        updateSettings,
        clearHistory,
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistant() {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error("useAIAssistant must be used within an AIAssistantProvider");
  }
  return context;
}
