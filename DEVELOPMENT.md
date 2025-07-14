# Development Guide - Drone AI Studio

This guide helps developers understand, modify, and extend the Drone AI Studio application.

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Routing**: Wouter (lightweight)
- **State**: TanStack Query + React state
- **UI**: shadcn/ui + Radix + Tailwind CSS
- **Database**: Drizzle ORM (memory/PostgreSQL)

### Project Structure
```
drone-ai-studio/
├── client/                     # Frontend application
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── chat-header.tsx
│   │   │   ├── chat-interface.tsx
│   │   │   ├── chat-sidebar.tsx
│   │   │   ├── interaction-panel.tsx
│   │   │   └── streaming-message.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities and API client
│   │   ├── pages/             # Route components
│   │   └── App.tsx            # Main application
│   └── index.html
├── server/                     # Backend application
│   ├── index.ts               # Express server
│   ├── routes.ts              # API endpoints
│   ├── storage.ts             # Data layer
│   └── vite.ts                # Development integration
├── shared/                     # Shared types
│   └── schema.ts              # Database schema
└── configuration files
```

## Development Setup

### Prerequisites
```bash
# Node.js 18+
node --version

# npm 8+
npm --version
```

### Quick Start
```bash
# Clone project
git clone <repository-url>
cd drone-ai-studio

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
open http://localhost:5000
```

### Development Commands
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Push database schema
npm run type-check   # TypeScript type checking
```

## Code Organization

### Frontend Architecture

#### Component Structure
```typescript
// Standard component pattern
interface ComponentProps {
  // Props with clear types
}

export default function Component({ 
  prop1, 
  prop2 
}: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

#### State Management
```typescript
// Server state with TanStack Query
const { data, isLoading, error } = useQuery({
  queryKey: ['/api/chats'],
  // Uses default fetcher from queryClient
});

// Mutations
const mutation = useMutation({
  mutationFn: (data) => apiRequest('/api/chats', {
    method: 'POST',
    body: data
  }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
  }
});
```

#### Routing
```typescript
// Using wouter
import { Route, Switch } from 'wouter';

<Switch>
  <Route path="/" component={ChatPage} />
  <Route path="/404" component={NotFound} />
</Switch>
```

### Backend Architecture

#### API Routes Pattern
```typescript
// In server/routes.ts
export async function registerRoutes(app: Express) {
  app.get('/api/chats', async (req, res) => {
    try {
      const chats = await storage.getChats();
      res.json(chats);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}
```

#### Storage Interface
```typescript
// server/storage.ts
export interface IStorage {
  // Define all storage operations
  getChats(): Promise<Chat[]>;
  createChat(chat: InsertChat): Promise<Chat>;
  // ... other methods
}
```

#### Data Validation
```typescript
// Using Zod schemas from shared/schema.ts
const validatedData = insertChatSchema.parse(req.body);
```

## Key Features Implementation

### 1. Streaming Responses

**Backend (Server-Sent Events):**
```typescript
// In routes.ts
app.post('/api/chats/:id/respond', async (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Stream response word by word
  const response = generateAIResponse(message, language);
  const words = response.split(' ');
  
  for (const word of words) {
    res.write(`data: ${JSON.stringify({ word })}\n\n`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});
```

**Frontend (EventSource):**
```typescript
// In chat.tsx
const handleStreamingResponse = (chatId: number) => {
  const eventSource = new EventSource(`/api/chats/${chatId}/respond`);
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.word) {
      setStreamingMessage(prev => prev + ' ' + data.word);
    }
    if (data.done) {
      eventSource.close();
    }
  };
};
```

### 2. Voice Recognition

**Implementation:**
```typescript
// In interaction-panel.tsx
useEffect(() => {
  if ('webkitSpeechRecognition' in window) {
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onresult = (event) => {
      // Process transcription
      const transcript = event.results[event.resultIndex][0].transcript;
      onTranscription(transcript);
    };
    
    setRecognition(recognition);
  }
}, []);
```

### 3. Media Capture

**Webcam Access:**
```typescript
const startWebcam = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true, 
      audio: true 
    });
    videoRef.current.srcObject = stream;
    setMediaStream(stream);
  } catch (error) {
    console.error('Camera access denied:', error);
  }
};
```

**Screen Sharing:**
```typescript
const startScreenShare = async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ 
      video: true, 
      audio: true 
    });
    videoRef.current.srcObject = stream;
    setMediaStream(stream);
  } catch (error) {
    console.error('Screen share failed:', error);
  }
};
```

## Adding New Features

### 1. New API Endpoint

**Step 1: Update Schema**
```typescript
// shared/schema.ts
export const newFeature = pgTable("features", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  // ... other fields
});

export type Feature = typeof newFeature.$inferSelect;
export type InsertFeature = z.infer<typeof insertFeatureSchema>;
```

**Step 2: Update Storage**
```typescript
// server/storage.ts
export interface IStorage {
  // Add new methods
  createFeature(feature: InsertFeature): Promise<Feature>;
  getFeatures(): Promise<Feature[]>;
}
```

**Step 3: Add Route**
```typescript
// server/routes.ts
app.get('/api/features', async (req, res) => {
  const features = await storage.getFeatures();
  res.json(features);
});
```

**Step 4: Frontend Hook**
```typescript
// client/src/hooks/use-features.ts
export function useFeatures() {
  return useQuery({
    queryKey: ['/api/features'],
  });
}
```

### 2. New UI Component

**Create Component:**
```typescript
// client/src/components/new-component.tsx
interface NewComponentProps {
  title: string;
  onAction: () => void;
}

export default function NewComponent({ title, onAction }: NewComponentProps) {
  return (
    <div className="p-4 border rounded">
      <h3>{title}</h3>
      <Button onClick={onAction}>Action</Button>
    </div>
  );
}
```

**Use in Pages:**
```typescript
// client/src/pages/some-page.tsx
import NewComponent from '@/components/new-component';

export default function SomePage() {
  return (
    <div>
      <NewComponent title="Test" onAction={() => console.log('clicked')} />
    </div>
  );
}
```

### 3. New Language Support

**Add Language:**
```typescript
// client/src/lib/chat-utils.ts
export const LANGUAGES = {
  // ... existing languages
  'fr': 'Français',
  'de': 'Deutsch',
};
```

**Update AI Responses:**
```typescript
// server/routes.ts
function generateAIResponse(message: string, language: string): string {
  // Add language-specific responses
  if (language === 'fr') {
    return `Réponse en français: ${message}`;
  }
  // ... other languages
}
```

## Testing

### Manual Testing Checklist

**Basic Functionality:**
- [ ] Create new chat
- [ ] Send messages in different languages
- [ ] Toggle streaming on/off
- [ ] Switch between interaction modes

**Voice Features:**
- [ ] Voice recognition works
- [ ] Auto-transcription accurate
- [ ] Permissions handled gracefully

**Media Features:**
- [ ] Webcam access works
- [ ] Screen sharing functions
- [ ] Video display correct
- [ ] Media cleanup on mode switch

**Browser Compatibility:**
- [ ] Chrome (recommended)
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Debugging

**Common Issues:**
```typescript
// Check browser support
if (!('webkitSpeechRecognition' in window)) {
  console.warn('Speech recognition not supported');
}

// Debug media permissions
navigator.permissions.query({ name: 'microphone' })
  .then(result => console.log('Mic permission:', result.state));

// Check streaming connection
eventSource.onerror = (error) => {
  console.error('Streaming error:', error);
};
```

**Development Tools:**
- React DevTools for component debugging
- Network tab for API monitoring
- Console for error tracking
- Lighthouse for performance analysis

## Performance Optimization

### Frontend Optimizations

**Code Splitting:**
```typescript
// Lazy load components
const LazyComponent = lazy(() => import('./LazyComponent'));

// Use with Suspense
<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
```

**Efficient Queries:**
```typescript
// Debounced search
const debouncedSearch = useMemo(
  () => debounce((query) => {
    // Search logic
  }, 300),
  []
);
```

### Backend Optimizations

**Database Queries:**
```typescript
// Efficient data fetching
const getChatsWithMessageCount = async () => {
  return await db
    .select({
      id: chats.id,
      title: chats.title,
      messageCount: sql<number>`count(${messages.id})`
    })
    .from(chats)
    .leftJoin(messages, eq(chats.id, messages.chatId))
    .groupBy(chats.id);
};
```

**Caching:**
```typescript
// Simple in-memory cache
const cache = new Map();

app.get('/api/expensive-operation', async (req, res) => {
  const cacheKey = 'expensive-data';
  
  if (cache.has(cacheKey)) {
    return res.json(cache.get(cacheKey));
  }
  
  const data = await expensiveOperation();
  cache.set(cacheKey, data);
  res.json(data);
});
```

## Security Considerations

### Input Validation
```typescript
// Always validate input
const validateMessage = z.object({
  content: z.string().min(1).max(2000),
  topic: z.string().optional()
});

app.post('/api/messages', async (req, res) => {
  try {
    const validData = validateMessage.parse(req.body);
    // Process valid data
  } catch (error) {
    res.status(400).json({ error: 'Invalid input' });
  }
});
```

### CORS Configuration
```typescript
// server/index.ts
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://yourdomain.com'
    : 'http://localhost:5173',
  credentials: true
}));
```

### Environment Variables
```typescript
// Never commit secrets
const config = {
  port: process.env.PORT || 5000,
  databaseUrl: process.env.DATABASE_URL,
  // Use environment for sensitive data
};
```

## Troubleshooting

### Common Development Issues

**Hot Reload Not Working:**
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

**TypeScript Errors:**
```bash
# Check types without running
npm run type-check

# Clear TypeScript cache
rm -rf node_modules/.cache
```

**Database Issues:**
```bash
# Reset database schema
npm run db:push

# Check database connection
psql $DATABASE_URL -c "SELECT 1;"
```

**Permission Issues (Media):**
- Ensure HTTPS in production
- Check browser settings
- Test in incognito mode
- Verify site permissions

### Error Handling Patterns

**Graceful Degradation:**
```typescript
// Component with fallback
function VoiceInput() {
  const [isSupported, setIsSupported] = useState(false);
  
  useEffect(() => {
    setIsSupported('webkitSpeechRecognition' in window);
  }, []);
  
  if (!isSupported) {
    return (
      <div className="text-yellow-600">
        Voice input not supported in this browser
      </div>
    );
  }
  
  return <VoiceRecognitionComponent />;
}
```

**API Error Boundaries:**
```typescript
// Query error handling
const { data, error } = useQuery({
  queryKey: ['/api/chats'],
  retry: 3,
  retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
});

if (error) {
  return <ErrorDisplay error={error} />;
}
```

---

This development guide should help you understand and extend the Drone AI Studio application effectively. Always test changes thoroughly across different browsers and interaction modes.