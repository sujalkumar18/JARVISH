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
  status: "select" | "pending" | "confirmed" | "cancelled" | "delivered";
  // Legacy single restaurant format
  restaurant?: string;
  items?: {
    name: string;
    quantity: number;
    price: number;
  }[];
  deliveryFee?: number;
  total?: number;
  image?: string;
  rating?: number;
  deliveryTime?: string;
  distance?: string;
  orderNumber?: string;
  // New multiple restaurant format
  foodType?: string;
  searchKeyword?: string;
  options?: {
    id: string;
    platform: string;
    platformColor: string;
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
  }[];
  selectedOption?: {
    id: string;
    platform: string;
    platformColor: string;
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
  };
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

export interface TrainTask {
  id: string;
  type: "train";
  status: "pending" | "confirmed" | "cancelled" | "boarding";
  trainNumber: string;
  trainName: string;
  from: string;
  to: string;
  date: string;
  departure: string;
  arrival: string;
  duration: string;
  classType: string;
  price: number;
  seats: number;
  pnr?: string;
  coach?: string;
  seatNumbers?: number[];
  platform?: number;
  distance: string;
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

export interface YouTubeTask {
  id: string;
  type: "youtube";
  status: "display";
  searchQuery: string;
  videos: {
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    channelTitle: string;
    publishedAt: string;
  }[];
  selectedVideo: {
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    channelTitle: string;
    publishedAt: string;
  };
}

export type Task = FoodOrderTask | TicketTask | TrainTask | NewsTask | DictionaryTask | WeatherTask | CurrencyTask | EntertainmentTask | WikipediaTask | YouTubeTask;

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
      // Check if this is a task-specific command (food, ticket, etc.) or general AI chat
      const lowerContent = content.toLowerCase();
      const isTaskCommand = lowerContent.includes('order') || lowerContent.includes('book') || 
                           lowerContent.includes('ticket') || lowerContent.includes('train') ||
                           lowerContent.includes('food') || lowerContent.includes('pizza') ||
                           lowerContent.includes('news') || lowerContent.includes('dictionary') ||
                           lowerContent.includes('weather') || lowerContent.includes('currency') ||
                           lowerContent.includes('joke') || lowerContent.includes('quote') ||
                           lowerContent.includes('wikipedia') || lowerContent.includes('youtube') ||
                           (lowerContent.includes('play') && (lowerContent.includes('song') || 
                            lowerContent.includes('music') || lowerContent.includes('arijit') || 
                            lowerContent.includes('audio') || lowerContent.includes('video')));
      
      let response: Response;
      let data: any;
      
      if (isTaskCommand) {
        // Use the existing assistant API for task-specific commands
        response = await apiRequest("POST", "/api/assistant/message", {
          message: content
        });
        data = await response.json();
        
        // Add AI response
        addMessage(data.message, "assistant");
        
        // Add task if returned
        if (data.task) {
          setTasks(prev => {
            // Define task types that should replace previous instances
            const replaceableTypes = ['food', 'ticket', 'train', 'youtube', 'news', 'dictionary', 'weather', 'currency', 'entertainment', 'wikipedia'];
            
            if (replaceableTypes.includes(data.task.type)) {
              // Remove all previous tasks of the same type before adding the new one
              return [...prev.filter(task => task.type !== data.task.type), data.task];
            } else {
              // For other task types, just add to the list
              return [...prev, data.task];
            }
          });
        }
        
        // Update wallet if transaction occurred
        if (data.transaction && data.wallet) {
          setWallet(prev => ({
            ...prev,
            balance: data.wallet.balance,
            transactions: data.wallet.transactions
          }));
        }
      } else {
        // Use the new AI chat API for general conversation
        response = await apiRequest("POST", "/api/chat/ai", {
          message: content
        });
        data = await response.json();
        
        // Add AI response
        if (data.success) {
          addMessage(data.response, "assistant");
        } else {
          addMessage(data.message || "Sorry, I couldn't process your request.", "assistant");
        }
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
      
      // Update wallet with the final balance from backend
      if (data.wallet) {
        setWallet(prev => ({
          ...prev,
          balance: data.wallet.balance,
          transactions: data.wallet.transactions
        }));
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
