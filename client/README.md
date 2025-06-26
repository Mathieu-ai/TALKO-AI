# Talko AI - Client Application

A modern React-based frontend for the Talko AI platform, providing an intuitive interface for AI-powered communication features including chat, audio processing, document analysis, and image generation.

## 🚀 Features

### Core Features

- **AI Chat**: Interactive conversations with OpenAI's GPT models
- **Audio Processing**:
  - Text-to-Speech with multiple voice options
  - Speech-to-Text transcription
  - Audio history and downloads
- **Document Analysis**: Upload and analyze PDF, DOCX, and TXT files
- **Image Generation**: Create images using DALL-E 3
- **NLP Tools**: Text analysis, sentiment analysis, entity extraction, summarization
- **Deep Learning Insights**: Personalized recommendations based on usage patterns

### User Experience

- **Dark/Light Theme**: Toggle between themes with system preference detection
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Guest Access**: Limited functionality without registration
- **User Authentication**: Full features for registered users
- **Real-time Audio**: Advanced audio player with visualization

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or pnpm
- A running instance of the Talko AI API server

## 🛠️ Installation

1. **Clone the repository** (if not already done):

   ```bash
   git clone https://github.com/Mathieu-ai/TALKO-AI
   cd TALKO-AI/client
   ```

2. **Install dependencies**:

   ```bash
   # Using npm
   npm install

   # Using pnpm (recommended)
   pnpm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the client directory:

   ```env
   REACT_APP_API_URL=http://localhost:3001/api
   REACT_APP_SOCKET_URL=http://localhost:3001
   ```

4. **Start the development server**:

   ```bash
   # Using npm
   npm start

   # Using pnpm
   pnpm start
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## 🏗️ Project Structure

```
client/
├── public/                 # Static files
├── src/
│   ├── components/        # Reusable React components
│   │   ├── chat/         # Chat-related components
│   │   ├── common/       # Common UI components
│   │   ├── DeepLearning/ # AI insights components
│   │   ├── Document/     # Document processing components
│   │   ├── Image/        # Image generation components
│   │   ├── Layout/       # Layout components
│   │   ├── Navigation/   # Navigation components
│   │   ├── NLP/          # Natural language processing components
│   │   └── ui/           # Base UI components
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── index.tsx         # Application entry point
├── package.json
└── README.md
```

## 🎨 Available Scripts

- **`npm start`** / **`pnpm start`**: Start development server
- **`npm build`** / **`pnpm build`**: Build for production
- **`npm test`** / **`pnpm test`**: Run tests
- **`npm run eject`**: Eject from Create React App (irreversible)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | API server URL | `http://localhost:3001/api` |
| `REACT_APP_SOCKET_URL` | WebSocket server URL | `http://localhost:3001` |

### Theme Configuration

The application supports automatic theme detection based on system preferences and manual theme switching. Themes are persisted in localStorage.

### Feature Access

- **Guest Users**: Limited access to core features
- **Registered Users**: Full access to all features, unlimited usage, and history

## 📱 Key Components

### Audio Processing

- **Real-time Recording**: Browser-based audio recording
- **Audio Visualization**: Dynamic level meters during playback
- **Multi-format Support**: MP3, WAV, OGG audio formats
- **History Management**: Save and organize audio files

### Chat Interface

- **Streaming Responses**: Real-time AI responses
- **Message History**: Persistent conversation history
- **Rich Formatting**: Markdown support in messages

### Document Analysis

- **File Upload**: Drag-and-drop file uploads
- **Multiple Formats**: PDF, DOCX, TXT support
- **AI Analysis**: Custom prompts for document analysis

### Image Generation

- **DALL-E 3 Integration**: High-quality image generation
- **Prompt Engineering**: Advanced prompt handling
- **Download Options**: Save generated images

## 🚀 Deployment

### Production Build

1. **Create production build**:

   ```bash
   npm run build
   ```

2. **Serve static files**:
   The `build` folder contains the production-ready application that can be served by any static file server.

### Environment Setup

For production deployment, ensure:

- API URL points to your production API server
- HTTPS is enabled for secure communication
- CORS is properly configured on the API server

## 🔍 API Integration

The client communicates with the Talko AI API through:

- **REST API**: Standard HTTP requests for most operations
- **File Uploads**: Multipart form data for document and audio uploads
- **Authentication**: JWT tokens for user authentication
- **Real-time Features**: WebSocket connections for live features

### API Services

- **`authService`**: User authentication and management
- **`audioService`**: Audio processing and history
- **`documentService`**: Document upload and analysis
- **`nlpService`**: Natural language processing
- **`deepLearningService`**: AI insights and recommendations

## 🛡️ Security

- **Input Validation**: Client-side validation for all user inputs
- **Authentication**: Secure JWT token handling
- **File Upload Security**: Type and size validation
- **XSS Protection**: Sanitized content rendering

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Failed**:
   - Verify API server is running
   - Check `REACT_APP_API_URL` in `.env`
   - Ensure CORS is configured on the API

2. **Audio Not Playing**:
   - Check browser audio permissions
   - Verify audio file formats are supported
   - Ensure HTTPS for production (required for audio features)

3. **File Upload Errors**:
   - Check file size limits
   - Verify supported file formats
   - Ensure proper authentication

### Debug Mode

Enable debug logging by setting:

```javascript
localStorage.setItem('debug', 'true')
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Check the troubleshooting section
- Review the API documentation
- Contact the development team

---

Built with ❤️ using React, TypeScript, and modern web technologies.
