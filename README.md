# Real-time Chat Application

A modern real-time chat application built with React, Node.js, and WebSocket technology. Features a responsive UI, real-time messaging, and user authentication.

## Architecture

![Architecture Diagram](./architecture.excalidraw.png)

## Features

- ⚡ Real-time messaging with Socket.IO
- 🔐 JWT Authentication
- 👥 User search and management
- ✍️ Typing indicators
- ✅ Message read status
- 📱 Responsive design
- 🌙 Dark mode support

## Tech Stack

### Frontend

- React 18 with TypeScript
- TailwindCSS for styling
- Socket.IO Client
- Shadcn UI Components
- Nginx (Production server)

### Backend

- Node.js with Express
- Socket.IO for real-time communication
- PostgreSQL with Prisma ORM
- JWT for authentication
- TypeScript

## Quick Start

1. Clone and install dependencies:

```bash
# Clone the repository
git clone <repository-url>
cd chat-app

# Install dependencies
cd client && npm install
cd ../server && npm install
```

2. Set up environment variables:

Create `.env` file in server directory:

```env
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-secret-key"
CLIENT_URL="http://localhost"
VITE_API_URL="http://localhost:3000"
```

3. Start development environment:

```bash
docker-compose up --build
```

## Development

### Client Structure

```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── store/         # State management
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
```

### Server Structure

```
server/
├── src/
│   ├── controllers/   # Route controllers
│   ├── middleware/    # Express middleware
│   ├── prisma/       # Database schema and migrations
│   ├── routes/       # API routes
│   ├── sockets/      # Socket.IO handlers
│   └── utils/        # Utility functions
```

## Docker Configuration

The application is containerized using Docker:

- **Client Container**: Nginx serving built React application
- **Server Container**: Node.js application with Socket.IO
- **Database**: External PostgreSQL instance

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/guest` - Guest login

### Chat

- `GET /chat/conversations` - Get user conversations
- `GET /chat/:id/messages` - Get conversation messages
- `POST /chat/:id/messages` - Send message
- `POST /chat/:id/read` - Mark messages as read

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
