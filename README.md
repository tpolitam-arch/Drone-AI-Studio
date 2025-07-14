# Drone AI Studio

A multilingual drone AI chat application inspired by Google AI Studio with streaming responses and specialized drone knowledge. Features real-time streaming, voice input, webcam integration, and screen sharing capabilities.

## Features

- **Multi-language Support**: English + 7 Indian regional languages (Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi)
- **Real-time Streaming**: Google AI Studio-like word-by-word response streaming
- **Multi-modal Interaction**:
  - Text input (default)
  - Voice recognition for hands-free queries
  - Webcam integration for visual drone analysis
  - Screen sharing for software/simulation assistance
- **Drone Expertise**: Specialized knowledge in drone assembly, components, maintenance, regulations, and use cases
- **Modern UI**: Clean, responsive interface built with shadcn/ui components

## Technology Stack

### Frontend
- React 18 with TypeScript
- Vite for development and building
- Wouter for lightweight routing
- TanStack Query for server state management
- shadcn/ui components (built on Radix UI)
- Tailwind CSS for styling

### Backend
- Node.js with Express.js
- TypeScript with ES modules
- Drizzle ORM for database operations
- Server-Sent Events (SSE) for streaming
- In-memory storage (easily replaceable with PostgreSQL)

## Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone or download the project**
   ```bash
   git clone <your-repository-url>
   cd drone-ai-studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5000`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes (if using PostgreSQL)

## Project Structure

```
drone-ai-studio/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # React hooks
│   │   ├── lib/            # Utilities and API client
│   │   ├── pages/          # Route pages
│   │   └── App.tsx         # Main app component
│   └── index.html          # HTML template
├── server/                 # Backend Express application
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Data storage interface
│   └── vite.ts             # Vite integration
├── shared/                 # Shared TypeScript types
│   └── schema.ts           # Database schema and types
└── package.json            # Dependencies and scripts
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/droneai
```

### Database Setup (Optional)

The app uses in-memory storage by default. To use PostgreSQL:

1. Install PostgreSQL
2. Create a database
3. Set the `DATABASE_URL` environment variable
4. Run `npm run db:push` to create tables

## Usage Guide

### Basic Chat
1. Open the application
2. Select your preferred language
3. Type drone-related questions
4. Toggle streaming on/off as needed

### Voice Interaction
1. Click the microphone button in the header
2. Allow microphone permissions
3. Speak your drone questions
4. The app will auto-transcribe and send your message

### Webcam Analysis
1. Click the camera button in the header
2. Allow camera permissions
3. Show drone parts or components to the camera
4. Ask questions about what you're showing

### Screen Sharing
1. Click the monitor button in the header
2. Select the screen/window to share
3. Share drone software, simulations, or documentation
4. Get expert guidance on what you're displaying

### Quick Topics
Use the predefined topic buttons for common queries:
- Drone Assembly
- Components
- Maintenance
- Simulations (Simscape)
- DGCA Rules
- Use Cases

## Deployment

### Replit Deployment (Recommended)
1. The project is already configured for Replit
2. Click the "Deploy" button in your Replit project
3. Your app will be available at `<your-project>.replit.app`

### Manual Deployment
1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting provider
3. Ensure your server supports Node.js
4. Set production environment variables

## Development

### Adding New Languages
1. Update `LANGUAGES` object in `client/src/lib/chat-utils.ts`
2. Add language-specific responses in `server/routes.ts`

### Customizing UI
- Modify components in `client/src/components/`
- Update styling in `client/src/index.css`
- Customize colors in Tailwind config

### Adding Features
1. Update database schema in `shared/schema.ts`
2. Modify storage interface in `server/storage.ts`
3. Add API routes in `server/routes.ts`
4. Create frontend components and pages

## Browser Compatibility

- Chrome 60+ (recommended for all features)
- Firefox 60+
- Safari 12+
- Edge 79+

**Note**: Voice recognition and screen sharing require modern browsers and HTTPS in production.

## Troubleshooting

### Common Issues

**Voice recognition not working:**
- Ensure you're using HTTPS (required for voice APIs)
- Check microphone permissions
- Try Chrome or Edge browsers

**Webcam/Screen sharing not working:**
- Allow camera/screen permissions
- Use HTTPS in production
- Check browser compatibility

**Streaming not displaying:**
- Enable streaming toggle in the header
- Check browser console for errors
- Verify server connection

### Development Issues

**Port already in use:**
```bash
# Kill processes on port 5000
npx kill-port 5000
npm run dev
```

**Dependencies issues:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Ensure all permissions are granted
4. Test in different browsers

---

**Drone AI Studio** - Empowering drone enthusiasts with AI-powered assistance in multiple languages.