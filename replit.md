# Drone AI Studio - Project Overview

## Overview

This is a full-stack chat application built with React and Express.js, specifically designed as a "Drone AI Studio" for answering questions about drones. The application features a modern chat interface with multi-language support, topic-based quick actions, and a clean design using shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight router)
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state, local React state for UI
- **Build Tool**: Vite with hot module replacement

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Session Storage**: Connect-pg-simple for PostgreSQL sessions
- **API Design**: RESTful endpoints under `/api` prefix

### Database Schema
The application uses three main entities:
- **Users**: Basic user management with username/password
- **Chats**: Chat sessions with title, language, and timestamps
- **Messages**: Individual messages linked to chats with role (user/assistant), content, and metadata

## Key Components

### Chat Interface Components
- **ChatHeader**: Language selector and branding
- **ChatSidebar**: Chat history with create new chat functionality
- **ChatInterface**: Main chat area with quick topic buttons and message input
- **StreamingMessage**: Animated message display with markdown-like formatting

### UI Infrastructure
- **Comprehensive UI Kit**: Full shadcn/ui component library implementation
- **Theme System**: CSS custom properties for consistent theming
- **Responsive Design**: Mobile-first approach with sidebar toggle on mobile
- **Toast Notifications**: User feedback for actions and errors

### Quick Topic System
Pre-defined topic buttons for common drone-related queries:
- Drone Assembly
- Components
- Maintenance
- Simulations (Simscape)
- DGCA Rules
- Use Cases

## Data Flow

### Chat Creation Flow
1. User clicks "New Chat" button
2. Frontend sends POST request to `/api/chats` with title and language
3. Backend creates chat record in database
4. Frontend updates chat list and switches to new chat

### Message Flow
1. User types message and sends
2. Frontend creates user message via POST to `/api/chats/:id/messages`
3. System processes message and generates AI response
4. AI response stored as assistant message
5. Frontend polls/refreshes to display new messages

### Language Support
Multi-language interface supporting:
- English, Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi
- Language preference stored per chat session
- UI elements adapt based on selected language

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Database connectivity (Neon PostgreSQL)
- **drizzle-orm & drizzle-kit**: Database ORM and migrations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Headless UI components
- **wouter**: Lightweight React routing

### Development Tools
- **Vite**: Build tool and dev server
- **tsx**: TypeScript execution for server
- **tailwindcss**: Utility-first CSS framework
- **@replit/vite-plugin-***: Replit-specific development enhancements

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Database**: Drizzle migrations in `migrations/` directory

### Environment Requirements
- **NODE_ENV**: Development/production mode switching
- **DATABASE_URL**: PostgreSQL connection string (required)

### Development vs Production
- Development: Vite dev server with HMR, Express serves API
- Production: Express serves static files and API from single process
- Database migrations run via `npm run db:push`

### Replit Integration
- Custom Vite plugins for Replit development environment
- Runtime error overlay for better debugging
- Development banner injection for external access

## Recent Changes

### July 14, 2025
- **Streaming Functionality**: Implemented real-time Server-Sent Events (SSE) streaming for AI responses, similar to Google AI Studio
- **Multi-Modal Interaction**: Added three interaction modes beyond text:
  - **Voice Input**: Speech recognition for hands-free drone queries
  - **Webcam Integration**: Video capture for visual drone part analysis
  - **Screen Sharing**: Display sharing for drone software/simulation assistance
- **Streaming Toggle**: Added UI toggle to enable/disable streaming responses
- **Enhanced Header**: Updated with interaction mode buttons and streaming controls

The application follows a clean separation of concerns with shared TypeScript types between frontend and backend, comprehensive error handling, and a scalable architecture ready for additional features like real-time messaging or AI integration.