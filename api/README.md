# OpenAI Express API

This project is an Express API that integrates with OpenAI's services to provide various functionalities, including audio processing, chat interactions, document analysis, and image generation. The API is built using TypeScript and follows a modular architecture for easy maintenance and scalability.

## Features

- **Audio Processing**: Handle audio files and provide live transcription capabilities.
- **Chat Interactions**: Manage conversations with OpenAI, allowing users to send messages and receive responses.
- **Document Analysis**: Process various document types (PDF, Excel, etc.) and interact with OpenAI for analysis.
- **Image Generation**: Generate images using OpenAI's capabilities and process image files.
- **Natural Language Processing (NLP)**: Utilize NLP techniques for text analysis and processing.
- **Conversation Management**: Maintain different instances of conversations with users.

## Project Structure

```
openai-express-api
├── src
│   ├── app.ts                  # Entry point of the application
│   ├── config
│   │   └── openai.ts           # OpenAI API configuration
│   ├── controllers
│   │   ├── audioController.ts   # Audio-related request handling
│   │   ├── chatController.ts    # Chat interaction management
│   │   ├── documentController.ts # Document processing
│   │   └── imageController.ts   # Image generation and processing
│   ├── middleware
│   │   ├── auth.ts             # Authentication middleware
│   │   └── errorHandler.ts      # Global error handling middleware
│   ├── models
│   │   ├── conversation.ts      # Conversation model
│   │   └── user.ts             # User model
│   ├── routes
│   │   ├── audioRoutes.ts       # Audio-related routes
│   │   ├── chatRoutes.ts        # Chat-related routes
│   │   ├── documentRoutes.ts     # Document-related routes
│   │   └── imageRoutes.ts       # Image-related routes
│   ├── services
│   │   ├── audioService.ts      # Audio processing services
│   │   ├── chatService.ts       # Chat services
│   │   ├── documentService.ts   # Document processing services
│   │   └── imageService.ts      # Image generation services
│   ├── types
│   │   └── index.ts             # TypeScript interfaces and types
│   └── utils
│       ├── fileProcessing.ts    # File handling utilities
│       └── nlpHelpers.ts        # NLP helper functions
├── .env.example                 # Example environment variables
├── package.json                 # NPM configuration
├── tsconfig.json                # TypeScript configuration
└── README.md                    # Project documentation
```

## Getting Started

1. **Clone the repository**:

```bash
git clone https://github.com/yourusername/openai-express-api.git
cd openai-express-api
```

2. **Install dependencies**:

```bash
npm install
```

3. **Set up environment variables**:

Copy `.env.example` to `.env` and fill in your OpenAI API key and other necessary configurations.

4. **Run the application**:

```bash
npm run start
```

## API Documentation

This document provides an overview of the API endpoints and how to use them.

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   - `PORT`: The port number for the server (default: 3000)
   - `MONGO_URI`: MongoDB connection string
   - `OPENAI_API_KEY`: Your OpenAI API key

3. Start the server:
   ```bash
   npm start
   ```

### Endpoints

#### Chat

##### Send Message
- **URL**: `/api/chat`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "messages": [
      {"role": "user", "content": "Your message here"}
    ],
    "userId": "user_id",
    "conversationId": "conversation_id" // Optional, if continuing a conversation
  }
  ```
  OR
  ```json
  {
    "message": "Your message here",
    "userId": "user_id",
    "conversationId": "conversation_id" // Optional, if continuing a conversation
  }
  ```
- **Response**:
  ```json
  {
    "id": "message_id",
    "response": "AI response",
    "message": "AI response"
  }
  ```

#### Conversations

##### Get All Conversations
- **URL**: `/api/conversations`
- **Method**: `GET`
- **Response**: Array of conversation objects

##### Get Conversation
- **URL**: `/api/conversations/:id`
- **Method**: `GET`
- **Response**: Conversation object with messages

##### Delete Conversation
- **URL**: `/api/conversations/:id`
- **Method**: `DELETE`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Conversation deleted successfully"
  }
  ```

### Error Handling

1. All error responses follow this format:
   ```json
   {
     "error": "Error message"
   }
   ```

2. Common error status codes:
   - `400`: Bad request (invalid input)
   - `404`: Resource not found
   - `500`: Internal server error

3. Always check the response status code to handle errors appropriately.

4. For debugging, check the server logs as more detailed error information is logged there.

5. If you encounter authentication errors, ensure your API keys are correctly set in the .env file.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you'd like to add.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
