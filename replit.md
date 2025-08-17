# Overview

Jarvish is an AI voice assistant application designed to help users perform quick tasks through natural voice commands. The app specializes in four main areas: ordering food, booking tickets, managing digital wallet payments, and fetching real-time news. Built as a full-stack web application, it features a React frontend with voice recognition capabilities and an Express backend with PostgreSQL database integration.

The application provides a conversational interface where users can speak or type commands to interact with the AI assistant. Tasks are presented as interactive cards that users can confirm or cancel, with automatic payment processing through an integrated wallet system.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client is built with **React 18** using **TypeScript** and follows a modern component-based architecture:

- **UI Framework**: Utilizes **shadcn/ui** components built on **Radix UI** primitives for consistent, accessible interface elements
- **Styling**: **Tailwind CSS** with CSS custom properties for theming, supporting both light and dark modes
- **State Management**: **React Context API** for global state (AI Assistant context, Theme context) combined with **TanStack Query** for server state management
- **Routing**: **Wouter** for lightweight client-side routing
- **Voice Integration**: Custom hooks for **Web Speech API** (SpeechRecognition and SpeechSynthesis) enabling voice input and text-to-speech responses

The frontend architecture emphasizes modularity with separate contexts for different concerns, reusable UI components, and custom hooks for complex functionality like speech processing.

## Backend Architecture

The server follows a **REST API** pattern built with **Express.js**:

- **API Layer**: Express routes handling assistant interactions, wallet operations, and task management
- **Data Access Layer**: Storage abstraction with a `DatabaseStorage` class implementing `IStorage` interface for clean separation of concerns
- **Database Integration**: **Drizzle ORM** with **Neon serverless PostgreSQL** for scalable data persistence
- **Development Setup**: **Vite** middleware integration for hot module replacement during development

The backend uses a repository pattern through the storage interface, making it easy to swap database implementations while maintaining consistent API contracts.

## Database Schema

The PostgreSQL schema supports the core application features:

- **Users**: Basic user authentication and preferences storage
- **Wallets**: User balance management with real number precision
- **Transactions**: Complete transaction history with metadata for different transaction types (food, tickets, top-ups)
- **Payment Methods**: Multiple payment method support with default selection capability
- **Messages**: Conversation history between users and the AI assistant
- **Tasks**: Structured task storage with JSON metadata for complex task data (food orders, ticket bookings)

The schema uses **Drizzle ORM** with **Zod** validation for type-safe database operations and automatic schema validation.

## Voice Processing System

The application implements a comprehensive voice interaction system:

- **Speech Recognition**: Browser-native speech-to-text with continuous listening and interim results
- **Intent Processing**: Server-side command interpretation with structured response generation
- **Task Generation**: Dynamic creation of food orders, ticket bookings, and news displays based on voice commands
- **Text-to-Speech**: Configurable voice synthesis with speed and voice selection options
- **News Integration**: Real-time news fetching with category detection (technology, sports, business, health, science, entertainment)

## Payment System Architecture

The wallet system provides seamless payment processing:

- **Balance Management**: Real-time balance tracking with automatic updates
- **Auto-Payment**: Configurable automatic top-up when insufficient funds are detected
- **Transaction Logging**: Complete audit trail of all financial transactions
- **Payment Methods**: Support for multiple payment sources with user-selectable defaults

The payment system is designed to reduce friction in the voice-first interface by handling insufficient balance scenarios automatically when enabled.

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling via `@neondatabase/serverless`
- **Drizzle Kit**: Database migration and schema management tooling

## UI and Styling
- **Radix UI**: Comprehensive collection of accessible, unstyled UI primitives for building the component system
- **Tailwind CSS**: Utility-first CSS framework with PostCSS processing for styling
- **Lucide React**: Consistent icon library for UI elements

## Voice and AI
- **Web Speech API**: Browser-native APIs for speech recognition and synthesis (no external service dependencies)
- **TanStack Query**: Server state management and caching for API interactions
- **News API**: Real-time news fetching using NewsAPI.org with the NEWS_API_KEY environment variable

## Development Tools
- **Vite**: Build tool and development server with HMR capabilities
- **TypeScript**: Static typing throughout the application
- **ESBuild**: Fast JavaScript bundling for production builds
- **Replit Integration**: Development environment optimization with runtime error handling and cartographer plugins

## Form and Validation
- **React Hook Form**: Form state management with `@hookform/resolvers`
- **Zod**: Runtime type validation and schema definition
- **Drizzle-Zod**: Integration between Drizzle ORM and Zod for database schema validation

The application is designed to minimize external API dependencies by leveraging browser capabilities for core voice functionality, with the primary external dependency being the Neon database service for data persistence.