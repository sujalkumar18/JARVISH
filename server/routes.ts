import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import session from "express-session";
import { signupSchema, loginSchema } from "@shared/schema";

// Extend Express Request interface for session
declare module "express-session" {
  interface SessionData {
    userId?: number;
    user?: { id: number; firstName: string; lastName: string; email: string };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // API Routes prefix
  const apiRouter = "/api";

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Get current user info
  const getCurrentUserId = (req: Request): number => {
    return req.session.userId || 1; // Fallback for demo purposes
  };

  // Helper function to generate PNR
  function generatePNR(): string {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  }

  // Helper function to generate realistic train options
  function generateTrainOptions(fromCity: string, toCity: string, date: string, classType: string) {
    // Indian trains database
    const indianTrains = [
      { 
        number: "12301", name: "Rajdhani Express", 
        routes: [
          { from: "New Delhi", to: "Mumbai", departure: "16:55", arrival: "08:35", duration: "15h 40m", distance: "1384 km" },
          { from: "Delhi", to: "Mumbai", departure: "16:55", arrival: "08:35", duration: "15h 40m", distance: "1384 km" },
          { from: "Mumbai", to: "Delhi", departure: "17:05", arrival: "09:55", duration: "16h 50m", distance: "1384 km" }
        ]
      },
      { 
        number: "12002", name: "Shatabdi Express", 
        routes: [
          { from: "New Delhi", to: "Chandigarh", departure: "07:20", arrival: "10:45", duration: "3h 25m", distance: "245 km" },
          { from: "Delhi", to: "Chandigarh", departure: "07:20", arrival: "10:45", duration: "3h 25m", distance: "245 km" },
          { from: "Chandigarh", to: "Delhi", departure: "18:30", arrival: "21:45", duration: "3h 15m", distance: "245 km" }
        ]
      },
      { 
        number: "12626", name: "Karnataka Express", 
        routes: [
          { from: "New Delhi", to: "Bangalore", departure: "20:15", arrival: "07:15+1", duration: "35h", distance: "2478 km" },
          { from: "Delhi", to: "Bangalore", departure: "20:15", arrival: "07:15+1", duration: "35h", distance: "2478 km" },
          { from: "Bangalore", to: "Delhi", departure: "20:30", arrival: "07:30+2", duration: "35h", distance: "2478 km" }
        ]
      },
      { 
        number: "12951", name: "Mumbai Rajdhani", 
        routes: [
          { from: "Mumbai", to: "New Delhi", departure: "17:05", arrival: "09:55+1", duration: "16h 50m", distance: "1384 km" },
          { from: "Mumbai", to: "Delhi", departure: "17:05", arrival: "09:55+1", duration: "16h 50m", distance: "1384 km" }
        ]
      },
      { 
        number: "12840", name: "Howrah Mail", 
        routes: [
          { from: "Mumbai", to: "Kolkata", departure: "21:05", arrival: "06:10+2", duration: "33h 5m", distance: "1968 km" },
          { from: "Kolkata", to: "Mumbai", departure: "22:45", arrival: "07:50+2", duration: "33h 5m", distance: "1968 km" }
        ]
      }
    ];

    // International trains
    const internationalTrains = [
      { 
        number: "9443", name: "Eurostar", 
        routes: [
          { from: "London", to: "Paris", departure: "08:31", arrival: "11:47", duration: "3h 16m", distance: "492 km" },
          { from: "Paris", to: "London", departure: "13:13", arrival: "14:39", duration: "3h 26m", distance: "492 km" }
        ]
      },
      { 
        number: "N700S", name: "Shinkansen Nozomi", 
        routes: [
          { from: "Tokyo", to: "Osaka", departure: "09:00", arrival: "11:45", duration: "2h 45m", distance: "515 km" },
          { from: "Osaka", to: "Tokyo", departure: "15:20", arrival: "18:05", duration: "2h 45m", distance: "515 km" }
        ]
      },
      { 
        number: "ICE1001", name: "ICE High Speed", 
        routes: [
          { from: "Berlin", to: "Munich", departure: "10:29", arrival: "14:28", duration: "3h 59m", distance: "504 km" },
          { from: "Munich", to: "Berlin", departure: "16:32", arrival: "20:31", duration: "3h 59m", distance: "504 km" }
        ]
      },
      { 
        number: "TGV2N2", name: "TGV High Speed", 
        routes: [
          { from: "Paris", to: "Lyon", departure: "07:03", arrival: "08:58", duration: "1h 55m", distance: "462 km" },
          { from: "Lyon", to: "Paris", departure: "18:07", arrival: "20:02", duration: "1h 55m", distance: "462 km" }
        ]
      }
    ];

    const allTrains = [...indianTrains, ...internationalTrains];
    
    // Find matching routes
    let matchingRoutes: any[] = [];
    
    for (const train of allTrains) {
      for (const route of train.routes) {
        const fromMatch = !fromCity || route.from.toLowerCase().includes(fromCity.toLowerCase()) || fromCity.toLowerCase().includes(route.from.toLowerCase());
        const toMatch = !toCity || route.to.toLowerCase().includes(toCity.toLowerCase()) || toCity.toLowerCase().includes(route.to.toLowerCase());
        
        if (fromMatch && toMatch) {
          matchingRoutes.push({
            trainNumber: train.number,
            trainName: train.name,
            ...route
          });
        }
      }
    }
    
    // If no specific route found, provide default options
    if (matchingRoutes.length === 0) {
      matchingRoutes = [
        {
          trainNumber: "12345",
          trainName: "Express Special",
          from: fromCity || "Mumbai",
          to: toCity || "Delhi", 
          departure: "15:30",
          arrival: "08:45+1",
          duration: "17h 15m",
          distance: "1200 km"
        },
        {
          trainNumber: "54321", 
          trainName: "Superfast Express",
          from: fromCity || "Delhi",
          to: toCity || "Bangalore",
          departure: "20:15",
          arrival: "06:30+1", 
          duration: "10h 15m",
          distance: "800 km"
        }
      ];
    }
    
    // Add pricing and availability based on class
    const classPricing: { [key: string]: { base: number, multiplier: number } } = {
      "general": { base: 50, multiplier: 0.5 },
      "sleeper": { base: 200, multiplier: 1 },
      "3ac": { base: 800, multiplier: 2.5 },
      "2ac": { base: 1200, multiplier: 3.5 },
      "1ac": { base: 2000, multiplier: 5 }
    };
    
    return matchingRoutes.map(route => {
      const pricing = classPricing[classType] || classPricing.sleeper;
      const basePrice = pricing.base + (Math.random() * 200);
      const distanceMultiplier = parseInt(route.distance) / 1000;
      
      return {
        ...route,
        price: Math.round(basePrice * pricing.multiplier * distanceMultiplier),
        availableSeats: Math.floor(20 + Math.random() * 50),
        coach: `${classType.toUpperCase()}${Math.floor(1 + Math.random() * 8)}`,
        seatNumbers: Array.from({length: 2}, (_, i) => Math.floor(1 + Math.random() * 72)),
        platform: Math.floor(1 + Math.random() * 12)
      };
    });
  }

  // ==== Authentication Routes ====
  
  // Sign up
  app.post(`${apiRouter}/auth/signup`, async (req: Request, res: Response) => {
    try {
      const validated = signupSchema.parse(req.body);
      
      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(validated.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validated.password, 12);
      
      // Create user
      const user = await storage.createUser({
        firstName: validated.firstName,
        lastName: validated.lastName,
        email: validated.email,
        password: hashedPassword
      });
      
      // Set session
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      };
      
      res.json({
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      if (error.errors) {
        return res.status(400).json({ 
          message: "Validation failed",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });
  
  // Sign in
  app.post(`${apiRouter}/auth/signin`, async (req: Request, res: Response) => {
    try {
      const validated = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validated.email);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Check password
      const isValidPassword = await bcrypt.compare(validated.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      };
      
      res.json({
        success: true,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    } catch (error: any) {
      console.error("Signin error:", error);
      if (error.errors) {
        return res.status(400).json({ 
          message: "Validation failed",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Sign in failed" });
    }
  });
  
  // Sign out
  app.post(`${apiRouter}/auth/signout`, (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not sign out" });
      }
      res.clearCookie('connect.sid');
      res.json({ success: true, message: "Signed out successfully" });
    });
  });
  
  // Get current user
  app.get(`${apiRouter}/auth/me`, (req: Request, res: Response) => {
    if (req.session.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });
  
  // ==== Assistant API ====
  
  // Process user message
  app.post(`${apiRouter}/assistant/message`, async (req: Request, res: Response) => {
    try {
      const messageSchema = z.object({
        message: z.string().min(1)
      });
      
      const validated = messageSchema.parse(req.body);
      
      // Get authenticated user ID
      const userId = getCurrentUserId(req);
      
      // Process the message (in a real app, this would use NLP/LLM)
      const userInput = validated.message.toLowerCase();
      let responseMessage = "I'm not sure how to help with that. You can ask me to order food, book tickets, or manage your wallet.";
      let task = null;
      let transaction = null;
      
      // YouTube Music requests (check this first to catch music-related requests)
      if (userInput.includes("play") && (userInput.includes("song") || userInput.includes("music") || 
          userInput.includes("video") || userInput.includes("youtube") || 
          userInput.includes("arijit") || userInput.includes("subh") || userInput.includes("audio"))) {
        
        try {
          const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
          if (!YOUTUBE_API_KEY) {
            responseMessage = "I'd love to play music for you, but the YouTube service isn't configured yet.";
          } else {
            // Extract search query
            let searchQuery = "";
            
            // Try different patterns to extract the song/artist request
            if (userInput.includes("play ")) {
              const afterPlay = userInput.split("play ")[1];
              if (afterPlay) {
                // Remove common suffixes like "song", "video", "music"
                searchQuery = afterPlay
                  .replace(/\s+(song|video|music|audio)\s*$/i, "")
                  .replace(/\s+by\s+/i, " ")
                  .trim();
              }
            }
            
            if (!searchQuery) {
              responseMessage = "Please tell me what song you'd like to play. For example: 'Play Arijit Singh song' or 'Play No love song by Subh'";
            } else {
              // Search YouTube for the song
              const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=3&q=${encodeURIComponent(searchQuery + " song")}&type=video&videoCategoryId=10&key=${YOUTUBE_API_KEY}`;
              const response = await fetch(searchUrl);
              const data = await response.json();
              
              if (response.ok && data.items && data.items.length > 0) {
                const videos = data.items.map((item: any) => ({
                  videoId: item.id.videoId,
                  title: item.snippet.title,
                  description: item.snippet.description,
                  thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
                  channelTitle: item.snippet.channelTitle,
                  publishedAt: item.snippet.publishedAt
                }));
                
                responseMessage = `Found music for "${searchQuery}". Here are your options:`;
                
                // Create a YouTube task to display the videos
                task = await storage.createTask({
                  userId,
                  type: "youtube",
                  status: "display",
                  data: {
                    id: `youtube-${randomUUID()}`,
                    type: "youtube",
                    status: "display",
                    searchQuery,
                    videos,
                    selectedVideo: videos[0] // Auto-select first video
                  }
                });
              } else {
                responseMessage = `I couldn't find any music for "${searchQuery}". Please try a different search.`;
              }
            }
          }
        } catch (error) {
          console.error("Error fetching YouTube videos:", error);
          responseMessage = "I'm having trouble searching for music right now. Please try again later.";
        }
      }
      // News related (check this first to avoid conflicts)
      else if (userInput.includes("news") || userInput.includes("headlines") || userInput.includes("breaking") ||
          userInput.includes("current events") || userInput.includes("today's news")) {
        
        try {
          const NEWS_API_KEY = process.env.NEWS_API_KEY;
          if (!NEWS_API_KEY) {
            responseMessage = "I'd love to get you the latest news, but the news service isn't configured yet.";
          } else {
            // Determine category if specified
            let category = 'general';
            if (userInput.includes("sports")) category = 'sports';
            else if (userInput.includes("tech") || userInput.includes("technology")) category = 'technology';
            else if (userInput.includes("business")) category = 'business';
            else if (userInput.includes("health")) category = 'health';
            else if (userInput.includes("science")) category = 'science';
            else if (userInput.includes("entertainment")) category = 'entertainment';
            
            const url = `https://newsapi.org/v2/top-headlines?country=us&category=${category}&pageSize=3&apiKey=${NEWS_API_KEY}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (response.ok && data.articles && data.articles.length > 0) {
              const articles = data.articles
                .filter((article: any) => article.title && article.description)
                .slice(0, 3);
              
              if (articles.length > 0) {
                responseMessage = `Here are the latest ${category === 'general' ? '' : category + ' '}headlines:`;
                
                // Create a news task to display the articles
                task = await storage.createTask({
                  userId,
                  type: "news",
                  status: "display",
                  data: {
                    id: `news-${randomUUID()}`,
                    type: "news",
                    status: "display",
                    category,
                    articles: articles.map((article: any) => ({
                      title: article.title,
                      description: article.description,
                      url: article.url,
                      urlToImage: article.urlToImage || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=250",
                      publishedAt: article.publishedAt,
                      source: article.source.name
                    }))
                  }
                });
              } else {
                responseMessage = "I couldn't find any news articles right now. Please try again later.";
              }
            } else {
              responseMessage = "I'm having trouble getting the latest news right now. Please try again later.";
            }
          }
        } catch (error) {
          console.error("Error fetching news:", error);
          responseMessage = "I'm having trouble getting the latest news right now. Please try again later.";
        }
      }
      // Dictionary lookup
      else if (userInput.includes("define") || userInput.includes("definition") || userInput.includes("meaning") ||
               userInput.includes("dictionary") || userInput.includes("what does") || userInput.includes("what is")) {
        
        try {
          // Extract the word to define
          let word = "";
          
          // Try different patterns to extract the word
          if (userInput.includes("define ")) {
            word = userInput.split("define ")[1]?.split(" ")[0];
          } else if (userInput.includes("definition of ")) {
            word = userInput.split("definition of ")[1]?.split(" ")[0];
          } else if (userInput.includes("meaning of ")) {
            word = userInput.split("meaning of ")[1]?.split(" ")[0];
          } else if (userInput.includes("what does ")) {
            const match = userInput.match(/what does (\w+) mean/);
            word = match ? match[1] : "";
          } else if (userInput.includes("what is ")) {
            const match = userInput.match(/what is (\w+)/);
            word = match ? match[1] : "";
          }
          
          if (!word) {
            responseMessage = "Please tell me which word you'd like me to define. For example: 'define happiness' or 'what does beautiful mean?'";
          } else {
            // Call the free dictionary API
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
            
            if (response.ok) {
              const data = await response.json();
              
              if (data && data.length > 0) {
                const entry = data[0];
                responseMessage = `Here's the definition of "${word}":`;
                
                // Create a dictionary task to display the word information
                task = await storage.createTask({
                  userId,
                  type: "dictionary",
                  status: "display",
                  data: {
                    id: `dictionary-${randomUUID()}`,
                    type: "dictionary",
                    status: "display",
                    word: entry.word,
                    phonetic: entry.phonetic || entry.phonetics?.[0]?.text,
                    meanings: entry.meanings?.map((meaning: any) => ({
                      partOfSpeech: meaning.partOfSpeech,
                      definitions: meaning.definitions?.slice(0, 3).map((def: any) => ({
                        definition: def.definition,
                        example: def.example,
                        synonyms: def.synonyms?.slice(0, 5) || [],
                        antonyms: def.antonyms?.slice(0, 5) || []
                      })) || []
                    })) || []
                  }
                });
              } else {
                responseMessage = `I couldn't find a definition for "${word}". Please check the spelling and try again.`;
              }
            } else {
              responseMessage = `I couldn't find a definition for "${word}". Please check the spelling and try again.`;
            }
          }
        } catch (error) {
          console.error("Error fetching dictionary definition:", error);
          responseMessage = "I'm having trouble accessing the dictionary right now. Please try again later.";
        }
      }
      // Translation requests
      else if (userInput.includes("translate") || userInput.includes("in hindi") || userInput.includes("in english") ||
               userInput.includes("hindi mein") || userInput.includes("english mein")) {
        
        try {
          let textToTranslate = "";
          let targetLanguage = "";
          let sourceLanguage = "auto";
          
          // Extract translation request patterns
          if (userInput.includes("translate")) {
            const translateMatch = userInput.match(/translate\s+(.+?)\s+(?:to|into)\s+(\w+)/);
            if (translateMatch) {
              textToTranslate = translateMatch[1].trim();
              targetLanguage = translateMatch[2].toLowerCase();
            }
          } else if (userInput.includes("in hindi") || userInput.includes("hindi mein")) {
            const hindiMatch = userInput.match(/(.+?)\s+(?:in hindi|hindi mein)/);
            if (hindiMatch) {
              textToTranslate = hindiMatch[1].trim();
              targetLanguage = "hindi";
            }
          } else if (userInput.includes("in english") || userInput.includes("english mein")) {
            const englishMatch = userInput.match(/(.+?)\s+(?:in english|english mein)/);
            if (englishMatch) {
              textToTranslate = englishMatch[1].trim();
              targetLanguage = "english";
            }
          }
          
          // Map language names to codes
          const languageCodes: { [key: string]: string } = {
            "hindi": "hi",
            "english": "en",
            "spanish": "es",
            "french": "fr",
            "german": "de",
            "chinese": "zh",
            "japanese": "ja",
            "korean": "ko",
            "arabic": "ar",
            "russian": "ru"
          };
          
          const targetCode = languageCodes[targetLanguage];
          
          if (!textToTranslate || !targetCode) {
            responseMessage = "Please tell me what you'd like to translate and to which language. For example: 'translate hello to Hindi' or 'beautiful in Hindi'";
          } else {
            // First get dictionary definition if it's a single word
            let dictionaryData = null;
            const wordCount = textToTranslate.split(/\s+/).length;
            
            if (wordCount === 1) {
              try {
                const dictResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${textToTranslate.toLowerCase()}`);
                if (dictResponse.ok) {
                  const dictData = await dictResponse.json();
                  if (dictData && dictData.length > 0) {
                    dictionaryData = dictData[0];
                  }
                }
              } catch (dictError) {
                console.log("Dictionary lookup failed, continuing with translation only");
              }
            }
            
            // Call MyMemory API (free, no auth required)
            const translateResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=en|${targetCode}`);
            
            if (translateResponse.ok) {
              const translateData = await translateResponse.json();
              const translatedText = translateData.responseData.translatedText;
              
              const languageNames: { [key: string]: string } = {
                "hi": "Hindi",
                "en": "English",
                "es": "Spanish",
                "fr": "French",
                "de": "German",
                "zh": "Chinese",
                "ja": "Japanese",
                "ko": "Korean",
                "ar": "Arabic",
                "ru": "Russian"
              };
              
              if (dictionaryData) {
                // Create dictionary task with translation
                responseMessage = `Here's "${textToTranslate}" with translation to ${languageNames[targetCode]}:`;
                
                // Also translate definitions if available
                const translatedDefinitions = [];
                if (dictionaryData.meanings && dictionaryData.meanings.length > 0) {
                  for (const meaning of dictionaryData.meanings.slice(0, 2)) {
                    for (const definition of meaning.definitions.slice(0, 2)) {
                      try {
                        const defTranslateResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(definition.definition)}&langpair=en|${targetCode}`);
                        
                        if (defTranslateResponse.ok) {
                          const defTranslateData = await defTranslateResponse.json();
                          translatedDefinitions.push(defTranslateData.responseData.translatedText);
                        }
                      } catch (defError) {
                        console.log("Definition translation failed for:", definition.definition);
                      }
                    }
                  }
                }
                
                task = await storage.createTask({
                  userId,
                  type: "dictionary",
                  status: "display",
                  data: {
                    id: `dictionary-${randomUUID()}`,
                    type: "dictionary",
                    status: "display",
                    word: dictionaryData.word,
                    phonetic: dictionaryData.phonetic || dictionaryData.phonetics?.[0]?.text,
                    meanings: dictionaryData.meanings?.slice(0, 2).map((meaning: any) => ({
                      partOfSpeech: meaning.partOfSpeech,
                      definitions: meaning.definitions?.slice(0, 2).map((def: any) => ({
                        definition: def.definition,
                        example: def.example,
                        synonyms: def.synonyms?.slice(0, 3) || [],
                        antonyms: def.antonyms?.slice(0, 3) || []
                      })) || []
                    })) || [],
                    translations: [{
                      language: targetCode,
                      languageName: languageNames[targetCode],
                      translatedWord: translatedText,
                      translatedDefinitions: translatedDefinitions.slice(0, 3)
                    }]
                  }
                });
              } else {
                // Simple translation without dictionary
                responseMessage = `Translation: "${textToTranslate}" in ${languageNames[targetCode]} is "${translatedText}"`;
                
                task = await storage.createTask({
                  userId,
                  type: "dictionary",
                  status: "display",
                  data: {
                    id: `dictionary-${randomUUID()}`,
                    type: "dictionary",
                    status: "display",
                    word: textToTranslate,
                    meanings: [],
                    translations: [{
                      language: targetCode,
                      languageName: languageNames[targetCode],
                      translatedWord: translatedText
                    }]
                  }
                });
              }
            } else {
              responseMessage = "I'm having trouble with the translation service right now. Please try again later.";
            }
          }
        } catch (error) {
          console.error("Error with translation:", error);
          responseMessage = "I'm having trouble with the translation service right now. Please try again later.";
        }
      }
      // Confirm order
      else if (userInput.includes("confirm") && userInput.includes("order")) {
        // Get the most recent pending food task
        const tasks = await storage.getTasks(userId);
        const pendingFoodTask = tasks.find(t => t.type === "food" && t.status === "pending");
        
        if (pendingFoodTask) {
          // Update task status
          const updatedTask = await storage.updateTaskStatus(pendingFoodTask.id, "confirmed");
          
          // Add order number to the task data
          const taskData = updatedTask.data as any;
          taskData.orderNumber = `PZ${Math.floor(10000 + Math.random() * 90000)}`;
          
          // Create transaction
          transaction = await storage.createTransaction({
            userId,
            amount: -taskData.total,
            description: taskData.restaurant,
            type: "food"
          });
          
          // Update user balance
          await storage.updateUserBalance(userId, -taskData.total);
          
          responseMessage = `Great! I've placed your order for a pepperoni pizza from ${taskData.restaurant}. It should arrive in ${taskData.deliveryTime}.`;
          task = updatedTask;
        } else {
          responseMessage = "I don't see any pending food orders to confirm.";
        }
      }
      // Train ticket booking (check this before movie tickets to avoid conflicts)
      else if ((userInput.includes("train") || userInput.includes("railway") || userInput.includes("irctc")) || 
               ((userInput.includes("ticket") || userInput.includes("travel")) && 
                (userInput.includes("delhi") || userInput.includes("mumbai") || userInput.includes("bangalore") || 
                 userInput.includes("chennai") || userInput.includes("kolkata") || userInput.includes("hyderabad") ||
                 userInput.includes("from") || userInput.includes("to")))) {
        
        // Extract journey details
        let fromCity = "";
        let toCity = "";
        let travelDate = "";
        let classType = "sleeper";
        
        // Try to extract cities with improved patterns
        const cityPattern = /from\s+(\w+(?:\s+\w+)*?)(?:\s+to\s+(\w+(?:\s+\w+)*?))?/i;
        const simpleCityPattern = /(\w+)\s+to\s+(\w+)/i;
        
        let cityMatch = userInput.match(cityPattern);
        if (!cityMatch) {
          cityMatch = userInput.match(simpleCityPattern);
          if (cityMatch) {
            fromCity = cityMatch[1];
            toCity = cityMatch[2];
          }
        } else {
          fromCity = cityMatch[1];
          toCity = cityMatch[2] || "";
        }
        
        // If we still don't have cities, try to detect common city names
        if (!fromCity || !toCity) {
          const cities = ["delhi", "mumbai", "bangalore", "chennai", "kolkata", "hyderabad", "pune", "ahmedabad"];
          const foundCities = cities.filter(city => userInput.toLowerCase().includes(city));
          if (foundCities.length >= 2) {
            fromCity = foundCities[0];
            toCity = foundCities[1];
          } else if (foundCities.length === 1) {
            if (userInput.toLowerCase().includes("delhi")) {
              fromCity = "Delhi";
              toCity = "Mumbai"; // default destination
            } else if (userInput.toLowerCase().includes("mumbai")) {
              fromCity = "Mumbai";
              toCity = "Delhi"; // default destination
            }
          }
        }
        
        // Extract class
        if (userInput.includes("ac") || userInput.includes("air conditioning")) classType = "3ac";
        if (userInput.includes("sleeper")) classType = "sleeper";
        if (userInput.includes("general")) classType = "general";
        if (userInput.includes("first") || userInput.includes("1st")) classType = "1ac";
        if (userInput.includes("second") || userInput.includes("2nd")) classType = "2ac";
        
        // Extract date
        if (userInput.includes("today")) {
          travelDate = new Date().toISOString().split('T')[0];
        } else if (userInput.includes("tomorrow")) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          travelDate = tomorrow.toISOString().split('T')[0];
        } else {
          // Default to tomorrow
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          travelDate = tomorrow.toISOString().split('T')[0];
        }
        
        // Generate realistic train options
        const trainOptions = generateTrainOptions(fromCity, toCity, travelDate, classType);
        const selectedTrain = trainOptions[0]; // Pick first option
        
        responseMessage = `I found a great train for your journey! Here are the details:`;
        
        task = await storage.createTask({
          userId,
          type: "train",
          status: "pending",
          data: {
            id: `train-${randomUUID()}`,
            type: "train",
            status: "pending",
            trainNumber: selectedTrain.trainNumber,
            trainName: selectedTrain.trainName,
            from: selectedTrain.from,
            to: selectedTrain.to,
            date: travelDate,
            departure: selectedTrain.departure,
            arrival: selectedTrain.arrival,
            duration: selectedTrain.duration,
            classType: classType.toUpperCase(),
            price: selectedTrain.price,
            seats: selectedTrain.availableSeats,
            pnr: generatePNR(),
            coach: selectedTrain.coach,
            seatNumbers: selectedTrain.seatNumbers,
            platform: selectedTrain.platform,
            distance: selectedTrain.distance
          }
        });
      }
      // Movie tickets (avoid conflicts with news requests and train tickets)
      else if ((userInput.includes("movie") || userInput.includes("cinema") || userInput.includes("film")) || 
               (userInput.includes("ticket") && !userInput.includes("train") && !userInput.includes("railway") && 
                !userInput.includes("delhi") && !userInput.includes("mumbai") && !userInput.includes("from") && !userInput.includes("to"))) {
        
        responseMessage = "I'd be happy to book movie tickets for you tonight. Here are some movies playing nearby:";
        
        // Create a ticket booking task
        task = await storage.createTask({
          userId,
          type: "ticket",
          status: "select",
          data: {
            id: `ticket-${randomUUID()}`,
            type: "ticket",
            status: "select",
            venue: "AMC Theaters",
            options: {
              movie: "Avengers: Endgame",
              time: "8:00 PM",
              tickets: 2
            },
            ticketPrice: 12.50,
            serviceFee: 3.00,
            total: 28.00,
            image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=250"
          }
        });
      }
      // Create food order task
      else if (userInput.includes("hungry") || userInput.includes("food") || userInput.includes("pizza") || 
          userInput.includes("order") || userInput.includes("restaurant")) {
        
        responseMessage = "I can help you order a pepperoni pizza. Let me find some options nearby.";
        
        // Create a food order task
        task = await storage.createTask({
          userId,
          type: "food",
          status: "pending",
          data: {
            id: `food-${randomUUID()}`,
            type: "food",
            status: "pending",
            restaurant: "Pizza Express",
            items: [
              {
                name: "Pepperoni Pizza (Medium)",
                quantity: 1,
                price: 18.99
              }
            ],
            deliveryFee: 2.99,
            total: 21.98,
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=250",
            rating: 4.8,
            deliveryTime: "25-35 min",
            distance: "1.2 mi"
          }
        });
      }
      // Weather API
      else if (userInput.includes("weather") || userInput.includes("temperature") || userInput.includes("forecast") ||
               userInput.includes("climate") || userInput.includes("sunny") || userInput.includes("rainy")) {
        
        try {
          // Extract location if mentioned
          let location = "New York"; // Default location
          
          // Try different patterns to extract location
          const patterns = [
            /weather (?:in|at|for) ([^?]+)/i,
            /(?:what's|whats) (?:the )?weather (?:in|at|for) ([^?]+)/i,
            /weather (?:of |for )([^?]+)/i,
            /([a-zA-Z\s,]+)\s*weather/i
          ];
          
          for (const pattern of patterns) {
            const match = userInput.match(pattern);
            if (match && match[1]) {
              location = match[1].trim();
              break;
            }
          }
          
          // Clean up location name
          location = location.replace(/weather|what's|whats|the/gi, '').trim();
          
          // Handle common country names -> major cities
          const countryToCity: Record<string, string> = {
            'india': 'Delhi,IN',
            'usa': 'New York,US',
            'uk': 'London,UK',
            'japan': 'Tokyo,JP',
            'china': 'Beijing,CN',
            'france': 'Paris,FR',
            'germany': 'Berlin,DE',
            'canada': 'Toronto,CA',
            'australia': 'Sydney,AU'
          };
          
          const lowercaseLocation = location.toLowerCase();
          if (countryToCity[lowercaseLocation]) {
            location = countryToCity[lowercaseLocation];
          }
          
          // Use free OpenWeatherMap API (requires API key)
          const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
          if (!WEATHER_API_KEY) {
            responseMessage = "I'd love to get you weather information, but the weather service isn't configured yet. Please add your WEATHER_API_KEY to get current weather updates.";
          } else {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${WEATHER_API_KEY}&units=metric`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (response.ok && data.main) {
              responseMessage = `Current weather in ${data.name}:`;
              
              task = await storage.createTask({
                userId,
                type: "weather",
                status: "display",
                data: {
                  id: `weather-${randomUUID()}`,
                  type: "weather",
                  status: "display",
                  location: data.name,
                  country: data.sys?.country,
                  temperature: Math.round(data.main.temp),
                  feelsLike: Math.round(data.main.feels_like),
                  humidity: data.main.humidity,
                  pressure: data.main.pressure,
                  description: data.weather[0].description,
                  main: data.weather[0].main,
                  icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
                  windSpeed: data.wind?.speed || 0,
                  visibility: data.visibility ? (data.visibility / 1000).toFixed(1) : 'N/A'
                }
              });
            } else {
              responseMessage = `I couldn't find weather information for "${location}". Please try a different city name.`;
            }
          }
        } catch (error) {
          console.error("Error fetching weather:", error);
          responseMessage = "I'm having trouble getting weather information right now. Please try again later.";
        }
      }
      // Currency Exchange API
      else if (userInput.includes("currency") || userInput.includes("exchange") || userInput.includes("convert") ||
               userInput.includes("dollar") || userInput.includes("euro") || userInput.includes("pound")) {
        
        try {
          // Extract currencies and amount
          let amount = 1;
          let fromCurrency = "USD";
          let toCurrency = "EUR";
          
          const amountMatch = userInput.match(/(\d+(?:\.\d+)?)/);
          if (amountMatch) {
            amount = parseFloat(amountMatch[1]);
          }
          
          // Extract currency codes
          const currencyRegex = /(usd|eur|gbp|jpy|cad|aud|chf|cny|inr|krw|bitcoin|btc|ethereum|eth)/gi;
          const currencies = userInput.match(currencyRegex) || [];
          
          if (currencies.length >= 2) {
            fromCurrency = currencies[0]?.toUpperCase() || "USD";
            toCurrency = currencies[1]?.toUpperCase() || "EUR";
          } else if (currencies.length === 1) {
            // If only one currency mentioned, assume converting from USD
            toCurrency = currencies[0]?.toUpperCase() || "EUR";
          }
          
          // Use free ExchangeRate-API (no key required)
          const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;
          const response = await fetch(url);
          const data = await response.json();
          
          if (response.ok && data.rates && data.rates[toCurrency]) {
            const exchangeRate = data.rates[toCurrency];
            const convertedAmount = (amount * exchangeRate).toFixed(2);
            
            responseMessage = `Currency conversion for ${amount} ${fromCurrency}:`;
            
            task = await storage.createTask({
              userId,
              type: "currency",
              status: "display",
              data: {
                id: `currency-${randomUUID()}`,
                type: "currency",
                status: "display",
                amount,
                fromCurrency,
                toCurrency,
                exchangeRate: exchangeRate.toFixed(4),
                convertedAmount,
                lastUpdated: data.date || new Date().toISOString().split('T')[0]
              }
            });
          } else {
            responseMessage = `I couldn't get exchange rates for ${fromCurrency} to ${toCurrency}. Please try different currency codes.`;
          }
        } catch (error) {
          console.error("Error fetching currency data:", error);
          responseMessage = "I'm having trouble getting currency exchange rates right now. Please try again later.";
        }
      }
      // Jokes and Quotes API
      else if (userInput.includes("joke") || userInput.includes("funny") || userInput.includes("laugh") ||
               userInput.includes("quote") || userInput.includes("inspiration") || userInput.includes("motivate")) {
        
        try {
          const isJoke = userInput.includes("joke") || userInput.includes("funny") || userInput.includes("laugh");
          
          if (isJoke) {
            // Use free JokesAPI
            const response = await fetch("https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=single");
            const data = await response.json();
            
            if (response.ok && data.joke) {
              responseMessage = "Here's a joke to brighten your day:";
              
              task = await storage.createTask({
                userId,
                type: "entertainment",
                status: "display",
                data: {
                  id: `entertainment-${randomUUID()}`,
                  type: "entertainment",
                  status: "display",
                  contentType: "joke",
                  content: data.joke,
                  category: data.category || "General"
                }
              });
            } else {
              responseMessage = "I couldn't fetch a joke right now. Here's one for you: Why don't scientists trust atoms? Because they make up everything!";
            }
          } else {
            // Use free quotes API
            const response = await fetch("https://api.quotable.io/random?minLength=50&maxLength=200");
            const data = await response.json();
            
            if (response.ok && data.content) {
              responseMessage = "Here's an inspirational quote for you:";
              
              task = await storage.createTask({
                userId,
                type: "entertainment",
                status: "display",
                data: {
                  id: `entertainment-${randomUUID()}`,
                  type: "entertainment",
                  status: "display",
                  contentType: "quote",
                  content: data.content,
                  author: data.author,
                  tags: data.tags || []
                }
              });
            } else {
              responseMessage = "I couldn't fetch a quote right now. Here's one for you: 'The only way to do great work is to love what you do.' - Steve Jobs";
            }
          }
        } catch (error) {
          console.error("Error fetching entertainment content:", error);
          responseMessage = "I'm having trouble getting entertainment content right now. Please try again later.";
        }
      }
      // Wikipedia API
      else if (userInput.includes("wikipedia") || userInput.includes("wiki") || userInput.includes("tell me about") ||
               userInput.includes("information about") || userInput.includes("facts about") || userInput.includes("who is") ||
               userInput.includes("what is") && !userInput.includes("define")) {
        
        try {
          // Extract search term
          let searchTerm = "";
          
          if (userInput.includes("tell me about ")) {
            searchTerm = userInput.split("tell me about ")[1]?.trim();
          } else if (userInput.includes("information about ")) {
            searchTerm = userInput.split("information about ")[1]?.trim();
          } else if (userInput.includes("facts about ")) {
            searchTerm = userInput.split("facts about ")[1]?.trim();
          } else if (userInput.includes("who is ")) {
            searchTerm = userInput.split("who is ")[1]?.trim();
          } else if (userInput.includes("what is ")) {
            searchTerm = userInput.split("what is ")[1]?.trim();
          } else if (userInput.includes("wikipedia ") || userInput.includes("wiki ")) {
            const match = userInput.match(/(?:wikipedia|wiki)\s+(.+)/i);
            if (match) searchTerm = match[1].trim();
          }
          
          if (!searchTerm) {
            responseMessage = "Please tell me what you'd like to know about. For example: 'tell me about Albert Einstein' or 'what is artificial intelligence?'";
          } else {
            // Use Wikipedia API
            const searchUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`;
            const response = await fetch(searchUrl);
            const data = await response.json();
            
            if (response.ok && data.extract) {
              responseMessage = `Here's information about ${data.title}:`;
              
              task = await storage.createTask({
                userId,
                type: "wikipedia",
                status: "display",
                data: {
                  id: `wikipedia-${randomUUID()}`,
                  type: "wikipedia",
                  status: "display",
                  title: data.title,
                  extract: data.extract,
                  thumbnail: data.thumbnail?.source || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=250",
                  pageUrl: data.content_urls?.desktop?.page,
                  lang: data.lang || "en",
                  searchTerm
                }
              });
            } else {
              responseMessage = `I couldn't find information about "${searchTerm}" on Wikipedia. Please try a different search term or check the spelling.`;
            }
          }
        } catch (error) {
          console.error("Error fetching Wikipedia data:", error);
          responseMessage = "I'm having trouble accessing Wikipedia right now. Please try again later.";
        }
      }
      // Wallet related
      else if (userInput.includes("wallet") || userInput.includes("balance") || userInput.includes("money") ||
               userInput.includes("payment") || userInput.includes("fund")) {
        
        const balance = await storage.getUserBalance(userId);
        
        responseMessage = `Your current wallet balance is $${balance.toFixed(2)}. You can add money to your wallet or view your transaction history.`;
      }
      
      // Store the messages
      await storage.createMessage({
        userId,
        content: validated.message,
        type: "user"
      });
      
      await storage.createMessage({
        userId,
        content: responseMessage,
        type: "assistant"
      });
      
      // Get user's wallet balance
      const balance = await storage.getUserBalance(userId);
      const transactions = await storage.getTransactions(userId);
      
      res.json({
        message: responseMessage,
        task: task ? task.data : null,
        transaction,
        wallet: {
          balance,
          transactions
        }
      });
    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });
  
  // Process voice commands
  app.post(`${apiRouter}/assistant/process`, async (req: Request, res: Response) => {
    try {
      const commandSchema = z.object({
        command: z.string().min(1)
      });
      
      const validated = commandSchema.parse(req.body);
      
      // Get authenticated user ID
      const userId = getCurrentUserId(req);
      
      // Simple intent detection (in a real app, would use NLP/LLM)
      const command = validated.command.toLowerCase();
      let intent = "unknown";
      let entities = {};
      
      if (command.includes("order") && (command.includes("food") || command.includes("pizza") || 
                                        command.includes("burger") || command.includes("sushi"))) {
        intent = "order_food";
        
        // Extract food type
        const foodTypes = ["pizza", "burger", "sushi", "salad", "pasta"];
        for (const type of foodTypes) {
          if (command.includes(type)) {
            entities = { foodType: type };
            break;
          }
        }
      }
      else if (command.includes("book") && (command.includes("ticket") || command.includes("movie") || 
                                           command.includes("show") || command.includes("cinema"))) {
        intent = "book_ticket";
        
        // Extract movie name (simplified)
        if (command.includes("avengers")) {
          entities = { movie: "Avengers: Endgame" };
        } else if (command.includes("dune")) {
          entities = { movie: "Dune" };
        } else {
          entities = { movie: "Avengers: Endgame" }; // Default
        }
      }
      else if (command.includes("wallet") || command.includes("balance") || command.includes("payment")) {
        intent = "check_wallet";
      }
      else if (command.includes("news") || command.includes("headlines") || command.includes("breaking")) {
        intent = "get_news";
        
        // Extract news category
        if (command.includes("sports")) {
          entities = { category: "sports" };
        } else if (command.includes("tech") || command.includes("technology")) {
          entities = { category: "technology" };
        } else if (command.includes("business")) {
          entities = { category: "business" };
        } else if (command.includes("health")) {
          entities = { category: "health" };
        } else if (command.includes("science")) {
          entities = { category: "science" };
        } else if (command.includes("entertainment")) {
          entities = { category: "entertainment" };
        } else {
          entities = { category: "general" };
        }
      }
      
      res.json({
        message: "Voice command processed",
        intent,
        entities
      });
    } catch (error) {
      console.error("Error processing voice command:", error);
      res.status(500).json({ message: "Failed to process voice command" });
    }
  });
  
  // Generate food order options
  app.post(`${apiRouter}/assistant/food-order`, async (req: Request, res: Response) => {
    try {
      const commandSchema = z.object({
        command: z.string().min(1)
      });
      
      const validated = commandSchema.parse(req.body);
      const command = validated.command.toLowerCase();
      
      // Extract food type (simplified)
      let foodType = "pizza";
      const foodTypes = ["pizza", "burger", "sushi", "salad", "pasta"];
      for (const type of foodTypes) {
        if (command.includes(type)) {
          foodType = type;
          break;
        }
      }
      
      // Generate a food order task
      const foodOrder = {
        id: `food-${randomUUID()}`,
        type: "food",
        status: "pending",
        restaurant: foodType === "pizza" ? "Pizza Express" : 
                   foodType === "burger" ? "Burger Joint" :
                   foodType === "sushi" ? "Sushi Palace" :
                   "Food Place",
        items: [
          {
            name: `${foodType.charAt(0).toUpperCase() + foodType.slice(1)}`,
            quantity: 1,
            price: 18.99
          }
        ],
        deliveryFee: 2.99,
        total: 21.98,
        image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=250",
        rating: 4.8,
        deliveryTime: "25-35 min",
        distance: "1.2 mi"
      };
      
      res.json({
        foodOrder,
        message: `Here's a ${foodType} order from ${foodOrder.restaurant}`
      });
    } catch (error) {
      console.error("Error generating food order:", error);
      res.status(500).json({ message: "Failed to generate food order" });
    }
  });
  
  // Generate ticket booking options
  app.post(`${apiRouter}/assistant/ticket-booking`, async (req: Request, res: Response) => {
    try {
      const commandSchema = z.object({
        command: z.string().min(1)
      });
      
      const validated = commandSchema.parse(req.body);
      const command = validated.command.toLowerCase();
      
      // Extract movie name (simplified)
      let movie = "Avengers: Endgame";
      if (command.includes("dune")) {
        movie = "Dune";
      } else if (command.includes("bond") || command.includes("time to die")) {
        movie = "No Time To Die";
      }
      
      // Generate a ticket booking task
      const ticketBooking = {
        id: `ticket-${randomUUID()}`,
        type: "ticket",
        status: "select",
        venue: "AMC Theaters",
        options: {
          movie,
          time: "8:00 PM",
          tickets: 2
        },
        ticketPrice: 12.50,
        serviceFee: 3.00,
        total: 28.00,
        image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=250"
      };
      
      res.json({
        ticketBooking,
        message: `Here are tickets for ${movie} at ${ticketBooking.venue}`
      });
    } catch (error) {
      console.error("Error generating ticket booking:", error);
      res.status(500).json({ message: "Failed to generate ticket booking" });
    }
  });
  
  // ==== News API ====
  
  // Get latest news
  app.get(`${apiRouter}/news`, async (req: Request, res: Response) => {
    try {
      const { category = 'general', country = 'us', pageSize = '5' } = req.query;
      
      const NEWS_API_KEY = process.env.NEWS_API_KEY;
      if (!NEWS_API_KEY) {
        return res.status(500).json({ message: "News API key not configured" });
      }
      
      const url = `https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch news');
      }
      
      // Filter out articles with null content and format them
      const articles = data.articles
        .filter((article: any) => article.title && article.description && article.url)
        .map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          urlToImage: article.urlToImage,
          publishedAt: article.publishedAt,
          source: article.source.name
        }));
      
      res.json({
        articles,
        totalResults: data.totalResults,
        status: 'success'
      });
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news" });
    }
  });
  
  // Search news by query
  app.get(`${apiRouter}/news/search`, async (req: Request, res: Response) => {
    try {
      const { q, pageSize = '5', sortBy = 'publishedAt' } = req.query;
      
      if (!q) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const NEWS_API_KEY = process.env.NEWS_API_KEY;
      if (!NEWS_API_KEY) {
        return res.status(500).json({ message: "News API key not configured" });
      }
      
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q as string)}&pageSize=${pageSize}&sortBy=${sortBy}&apiKey=${NEWS_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to search news');
      }
      
      // Filter out articles with null content and format them
      const articles = data.articles
        .filter((article: any) => article.title && article.description && article.url)
        .map((article: any) => ({
          title: article.title,
          description: article.description,
          url: article.url,
          urlToImage: article.urlToImage,
          publishedAt: article.publishedAt,
          source: article.source.name
        }));
      
      res.json({
        articles,
        totalResults: data.totalResults,
        status: 'success'
      });
    } catch (error) {
      console.error("Error searching news:", error);
      res.status(500).json({ message: "Failed to search news" });
    }
  });

  // ==== Tasks API ====
  
  // Confirm a task with auto top-up support
  app.post(`${apiRouter}/tasks/confirm`, async (req: Request, res: Response) => {
    try {
      const taskSchema = z.object({
        taskId: z.number().or(z.string()),
        autoTopUp: z.boolean().optional().default(false)
      });
      
      const validated = taskSchema.parse(req.body);
      const userId = getCurrentUserId(req);
      
      // Find the task
      const tasks = await storage.getTasks(userId);
      let targetTask;
      
      if (typeof validated.taskId === 'number') {
        targetTask = tasks.find(t => t.id === validated.taskId);
      } else {
        targetTask = tasks.find(t => (t.data as any).id === validated.taskId);
      }
      
      if (!targetTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Get the task total amount
      const taskTotal = (targetTask.data as any).total || 0;
      
      // Check if we have enough balance or need to auto top-up
      const currentBalance = await storage.getUserBalance(userId);
      let topUpTransaction = null;
      
      // Check if balance is insufficient and perform auto top-up if enabled
      if (currentBalance < taskTotal) {
        // Get user settings to check if auto top-up is enabled
        const userSettings = await storage.getUser(userId);
        const autoPaymentEnabled = (userSettings?.preferences as any)?.autoPayment === true || validated.autoTopUp;
        
        if (autoPaymentEnabled) {
          // Calculate how much to top up (round up to nearest $50 increment above the required amount)
          const requiredTopUp = taskTotal - currentBalance;
          const topUpAmount = Math.ceil(requiredTopUp / 50) * 50;
          
          // Create a top-up transaction
          topUpTransaction = await storage.createTransaction({
            userId,
            amount: topUpAmount,
            description: "Auto Top-up",
            type: "topup"
          });
          
          // Update the balance
          await storage.updateUserBalance(userId, topUpAmount);
          
          console.log(`Auto top-up for task ${targetTask.id}: $${topUpAmount}`);
        } else {
          // If auto top-up is not enabled, return error
          return res.status(400).json({
            message: "Insufficient funds. Enable auto top-up or add funds manually.",
            success: false
          });
        }
      }
      
      // Update task status
      let newStatus = '';
      let responseMessage = '';
      
      if (targetTask.type === 'food') {
        newStatus = 'confirmed';
        responseMessage = `Your food order from ${(targetTask.data as any).restaurant} has been confirmed and will be delivered in ${(targetTask.data as any).deliveryTime}.`;
        
        // Add order number
        (targetTask.data as any).orderNumber = `PZ${Math.floor(10000 + Math.random() * 90000)}`;
      } else if (targetTask.type === 'train') {
        newStatus = 'confirmed';
        responseMessage = `Your train ticket for ${(targetTask.data as any).trainName} from ${(targetTask.data as any).from} to ${(targetTask.data as any).to} has been confirmed. PNR: ${(targetTask.data as any).pnr}`;
        
        // No changes needed to task data as PNR and other details are already set
      } else if (targetTask.type === 'ticket') {
        newStatus = 'confirmed';
        responseMessage = `Your tickets for ${(targetTask.data as any).options.movie} at ${(targetTask.data as any).venue} have been booked for ${(targetTask.data as any).options.time}.`;
      }
      
      const updatedTask = await storage.updateTaskStatus(targetTask.id, newStatus);
      (updatedTask.data as any).status = newStatus;
      
      // Create payment transaction
      const amount = -taskTotal;
      const description = targetTask.type === 'food' 
        ? (targetTask.data as any).restaurant 
        : "Movie Tickets";
      
      const transaction = await storage.createTransaction({
        userId,
        amount,
        description,
        type: targetTask.type
      });
      
      // Update user balance with payment
      await storage.updateUserBalance(userId, amount);
      
      // Get updated wallet info
      const balance = await storage.getUserBalance(userId);
      const transactions = await storage.getTransactions(userId, 5);
      
      // Add auto top-up message if applicable
      if (topUpTransaction) {
        responseMessage = `Auto top-up applied: $${topUpTransaction.amount.toFixed(2)} added to your wallet. ${responseMessage}`;
      }
      
      res.json({
        message: responseMessage,
        task: updatedTask.data,
        transaction,
        topUpTransaction,
        autoTopUpApplied: topUpTransaction !== null,
        success: true,
        wallet: {
          balance,
          transactions
        }
      });
    } catch (error) {
      console.error("Error confirming task:", error);
      res.status(500).json({ message: "Failed to confirm task" });
    }
  });
  
  // Cancel a task
  app.post(`${apiRouter}/tasks/cancel`, async (req: Request, res: Response) => {
    try {
      const taskSchema = z.object({
        taskId: z.number().or(z.string())
      });
      
      const validated = taskSchema.parse(req.body);
      const userId = getCurrentUserId(req);
      
      // Find the task
      const tasks = await storage.getTasks(userId);
      let targetTask;
      
      if (typeof validated.taskId === 'number') {
        targetTask = tasks.find(t => t.id === validated.taskId);
      } else {
        targetTask = tasks.find(t => (t.data as any).id === validated.taskId);
      }
      
      if (!targetTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Update task status
      const newStatus = 'cancelled';
      (targetTask.data as any).status = newStatus;
      
      const updatedTask = await storage.updateTaskStatus(targetTask.id, newStatus);
      
      // Create response message
      let responseMessage = '';
      if (targetTask.type === 'food') {
        responseMessage = `Your food order from ${(targetTask.data as any).restaurant} has been cancelled.`;
      } else if (targetTask.type === 'train') {
        responseMessage = `Your train booking for ${(targetTask.data as any).trainName} from ${(targetTask.data as any).from} to ${(targetTask.data as any).to} has been cancelled.`;
      } else if (targetTask.type === 'ticket') {
        responseMessage = `Your ticket booking for ${(targetTask.data as any).options.movie} has been cancelled.`;
      }
      
      res.json({
        message: responseMessage,
        task: updatedTask.data
      });
    } catch (error) {
      console.error("Error cancelling task:", error);
      res.status(500).json({ message: "Failed to cancel task" });
    }
  });
  
  // ==== Wallet API ====
  
  // Update wallet balance
  app.post(`${apiRouter}/wallet/update`, async (req: Request, res: Response) => {
    try {
      const updateSchema = z.object({
        amount: z.number()
      });
      
      const validated = updateSchema.parse(req.body);
      const userId = getCurrentUserId(req);
      
      // Update balance
      const newBalance = await storage.updateUserBalance(userId, validated.amount);
      
      // If positive amount, create a top-up transaction
      if (validated.amount > 0) {
        await storage.createTransaction({
          userId,
          amount: validated.amount,
          description: "Added Funds",
          type: "topup"
        });
      }
      
      // Get latest transactions
      const transactions = await storage.getTransactions(userId, 5);
      
      res.json({
        balance: newBalance,
        transactions
      });
    } catch (error) {
      console.error("Error updating wallet:", error);
      res.status(500).json({ message: "Failed to update wallet" });
    }
  });
  
  // Process payment with auto top-up feature
  app.post(`${apiRouter}/wallet/process-payment`, async (req: Request, res: Response) => {
    try {
      const paymentSchema = z.object({
        amount: z.number(),
        description: z.string(),
        autoTopUp: z.boolean().optional().default(false)
      });
      
      const validated = paymentSchema.parse(req.body);
      const userId = getCurrentUserId(req);
      
      // Check sufficient balance
      const currentBalance = await storage.getUserBalance(userId);
      
      // Handle auto top-up if balance is insufficient and auto top-up is enabled
      let topUpTransaction = null;
      
      if (currentBalance < validated.amount && validated.autoTopUp) {
        // Calculate how much to top up (round up to nearest $50 increment above the required amount)
        const requiredTopUp = validated.amount - currentBalance;
        const topUpAmount = Math.ceil(requiredTopUp / 50) * 50;
        
        // Add funds to wallet
        topUpTransaction = await storage.createTransaction({
          userId,
          amount: topUpAmount,
          description: "Auto Top-up",
          type: "topup"
        });
        
        // Update balance with topped-up amount
        await storage.updateUserBalance(userId, topUpAmount);
        
        // Log the auto top-up
        console.log(`Auto top-up for user ${userId}: $${topUpAmount.toFixed(2)}`);
      } else if (currentBalance < validated.amount) {
        // If auto top-up is disabled and balance is insufficient
        return res.status(400).json({ 
          message: "Insufficient funds. Enable auto top-up or add funds manually.",
          success: false
        });
      }
      
      // Determine transaction type
      let type = "payment";
      if (validated.description.toLowerCase().includes("pizza") || 
          validated.description.toLowerCase().includes("burger") ||
          validated.description.toLowerCase().includes("restaurant")) {
        type = "food";
      } else if (validated.description.toLowerCase().includes("movie") || 
                validated.description.toLowerCase().includes("ticket")) {
        type = "ticket";
      }
      
      // Create transaction (negative amount for payment)
      const transaction = await storage.createTransaction({
        userId,
        amount: -Math.abs(validated.amount),
        description: validated.description,
        type
      });
      
      // Update balance
      const newBalance = await storage.updateUserBalance(userId, -Math.abs(validated.amount));
      
      // Get all transactions for response
      const transactions = await storage.getTransactions(userId, 5);
      
      res.json({
        success: true,
        transaction,
        topUpTransaction,
        balance: newBalance,
        transactions,
        autoTopUpApplied: topUpTransaction !== null
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({ message: "Failed to process payment" });
    }
  });
  
  // Add funds to wallet
  app.post(`${apiRouter}/wallet/add-funds`, async (req: Request, res: Response) => {
    try {
      const fundsSchema = z.object({
        amount: z.number().positive()
      });
      
      const validated = fundsSchema.parse(req.body);
      const userId = getCurrentUserId(req);
      
      // Create transaction
      const transaction = await storage.createTransaction({
        userId,
        amount: validated.amount,
        description: "Added Funds",
        type: "topup"
      });
      
      // Update balance
      const newBalance = await storage.updateUserBalance(userId, validated.amount);
      
      res.json({
        success: true,
        transaction,
        balance: newBalance
      });
    } catch (error) {
      console.error("Error adding funds:", error);
      res.status(500).json({ message: "Failed to add funds" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
