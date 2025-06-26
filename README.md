# Talko AI - Complete AI Communication Platform

A comprehensive AI-powered communication platform built with modern web technologies, featuring chat, audio processing, document analysis, image generation, and advanced NLP capabilities.

## 🌟 Overview

Talko AI is a full-stack application that combines the power of OpenAI's models with a user-friendly interface to provide:

- **Intelligent Chat**: Natural conversations with AI assistants
- **Audio Processing**: Text-to-speech and speech-to-text capabilities
- **Document Intelligence**: AI-powered document analysis and summarization
- **Image Generation**: Create stunning visuals from text prompts
- **NLP Tools**: Advanced text analysis and processing
- **Deep Learning Insights**: Personalized recommendations and behavior analysis

## 🏗️ Architecture

```
TALKO-AI/
├── api/                    # Backend API Server (Node.js + Express)
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── models/         # Database models (MongoDB)
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   └── uploads/            # File storage
├── client/                 # Frontend Application (React + TypeScript)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom React hooks
│   │   └── utils/          # Client utilities
│   └── public/             # Static assets
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **pnpm**
- **OpenAI API Key**

### 1. Clone the Repository

```bash
git clone https://github.com/Mathieu-ai/TALKO-AI
cd TALKO-AI
```

### 2. Backend Setup (API)

```bash
# Navigate to API directory
cd api

# Install dependencies
npm install
# or
pnpm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required environment variables for API:**

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database
MONGODB_URI=mongodb://localhost:27017/talko-ai

# Server Configuration
PORT=3001
NODE_ENV=development

# Authentication
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# File Upload
MAX_FILE_SIZE=52428800
TEMP_DIR=./tmp
```

```bash
# Start the API server
npm run dev
# or
pnpm dev
```

The API will be available at `http://localhost:3001`

### 3. Frontend Setup (Client)

```bash
# Navigate to client directory (in a new terminal)
cd client

# Install dependencies
npm install
# or
pnpm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

**Required environment variables for Client:**

```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_SOCKET_URL=http://localhost:3001
```

```bash
# Start the client development server
npm start
# or
pnpm start
```

The client will be available at `http://localhost:3000`

### 4. Database Setup

Ensure MongoDB is running locally or provide a MongoDB Atlas connection string in your `.env` file.

The application will automatically create the necessary collections and indexes on first run.

## 📋 Features

### 🤖 AI Chat

- Real-time conversations with GPT-4
- Conversation history and management
- Context-aware responses
- Guest and authenticated user modes

### 🎵 Audio Processing

- **Text-to-Speech**: Convert text to natural-sounding speech
  - Multiple voice options (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
  - High-quality audio generation
  - Download and history features
- **Speech-to-Text**: Transcribe audio to text
  - Real-time recording
  - Multiple audio format support
  - Export transcriptions

### 📄 Document Intelligence

- **File Upload**: Support for PDF, DOCX, TXT files
- **Text Extraction**: Automated content extraction
- **AI Analysis**: Custom prompts for document analysis
- **Summarization**: Generate concise summaries

### 🎨 Image Generation

- **DALL-E 3 Integration**: High-quality image generation
- **Prompt Engineering**: Advanced prompt handling
- **Multiple Formats**: Support for various image sizes
- **Download and Gallery**: Save and organize generated images

### 🧠 NLP & Deep Learning

- **Text Analysis**: Sentiment analysis, entity extraction
- **Keyword Extraction**: Identify important terms
- **Text Summarization**: Generate concise summaries
- **User Insights**: Behavioral analysis and recommendations

### 👤 User Management

- **Authentication**: Secure JWT-based authentication
- **Guest Mode**: Limited access for non-registered users
- **Usage Tracking**: Monitor feature usage and limits
- **Profile Management**: User settings and preferences

## 🛠️ Development

### API Development

```bash
cd api

# Development with hot reload
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

### Client Development

```bash
cd client

# Development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Serve production build locally
npx serve -s build
```

### Code Quality

Both projects include:

- **TypeScript**: Type safety and better development experience
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting (if configured)
- **Git Hooks**: Pre-commit validation (if configured)

## 🚀 Deployment

### API Deployment

1. **Environment Setup**:

   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export MONGODB_URI=your_production_mongodb_uri
   export OPENAI_API_KEY=your_openai_api_key
   ```

2. **Build and Start**:

   ```bash
   npm run build
   npm start
   ```

### Client Deployment

1. **Build for Production**:

   ```bash
   npm run build
   ```

2. **Deploy to Static Hosting**:
   - Netlify, Vercel, AWS S3, or any static hosting service
   - Configure environment variables in your hosting platform

### Docker Deployment (Optional)

```dockerfile
# Example Dockerfile for API
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔧 Configuration

### Feature Limits

The application includes configurable limits for guest users:

```typescript
// api/src/middlewares/featureAccessMiddleware.ts
export const ANONYMOUS_LIMITS: Record<FeatureType, number> = {
  CHAT: 5,                    // 5 messages
  TEXT_TO_SPEECH: 3,          // 3 conversions
  SPEECH_TO_TEXT: 3,          // 3 transcriptions
  IMAGE_GENERATION: 2,        // 2 images
  DOCUMENT_ANALYSIS: 2,       // 2 documents
  // ...
};
```

### AI Model Configuration

```typescript
// api/src/config/config.ts
const config = {
  // Model configuration
  chatModel: process.env.CHAT_MODEL || 'gpt-4',
  audioModel: process.env.AUDIO_MODEL || 'whisper-1',
  imageModel: process.env.IMAGE_MODEL || 'dall-e-3',
  // ...
};
```

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Chat

- `POST /api/chat/send` - Send message
- `GET /api/chat/history` - Get conversation history

### Audio

- `POST /api/audio/text-to-speech` - Convert text to speech
- `POST /api/audio/speech-to-text` - Transcribe audio
- `GET /api/audio/history` - Get audio history

### Documents

- `POST /api/documents/upload` - Upload document
- `POST /api/documents/analyze` - Analyze document

### Images

- `POST /api/images/generate` - Generate image
- `GET /api/images/history` - Get image history

### NLP

- `POST /api/nlp/analyze` - Text analysis
- `POST /api/nlp/sentiment` - Sentiment analysis
- `POST /api/nlp/summarize` - Text summarization

## 🛡️ Security

- **Authentication**: JWT tokens with secure storage
- **Input Validation**: Comprehensive input sanitization
- **File Upload Security**: Type and size validation
- **Rate Limiting**: API rate limiting (recommended for production)
- **CORS**: Properly configured cross-origin resource sharing
- **Environment Variables**: Sensitive data in environment variables

## 🧪 Testing

### API Testing

```bash
cd api
npm test
```

### Client Testing

```bash
cd client
npm test
```

### Integration Testing

- Test API endpoints with tools like Postman or Thunder Client
- End-to-end testing with Cypress (if configured)

## 📈 Monitoring and Logging

- **Console Logging**: Comprehensive logging throughout the application
- **Error Handling**: Graceful error handling and user feedback
- **Health Checks**: API health check endpoints
- **Usage Analytics**: Track feature usage and user behavior

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**:

   ```bash
   # Check MongoDB status
   sudo systemctl status mongod
   
   # Start MongoDB
   sudo systemctl start mongod
   ```

2. **OpenAI API Errors**:
   - Verify API key is correct and has sufficient credits
   - Check OpenAI service status
   - Ensure proper rate limiting

3. **CORS Issues**:
   - Verify client URL in API CORS configuration
   - Check browser developer tools for specific CORS errors

4. **File Upload Issues**:
   - Check file size limits
   - Verify upload directory permissions
   - Ensure proper middleware configuration

### Debug Mode

Enable debug logging:

```bash
# API
export DEBUG=talko-ai:*

# Client
localStorage.setItem('debug', 'true')
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation for new features
- Follow existing code style and conventions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Check the troubleshooting sections in both README files
- Review the API documentation
- Open an issue on GitHub
- Contact the development team

## 🙏 Acknowledgments

- **OpenAI**: For providing the powerful AI models
- **MongoDB**: For the reliable database solution
- **React Team**: For the excellent frontend framework
- **Node.js Community**: For the robust backend ecosystem

---

**Built with ❤️ by the Talko AI Team**

Combining cutting-edge AI technology with modern web development to create an exceptional user experience.
