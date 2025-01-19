# PeerTalk

A modern real-time chat application with video calling capabilities. Built with React, Node.js, and WebRTC. Features instant messaging, peer-to-peer video calls, typing indicators, and real-time notifications, all wrapped in a beautiful UI.

## Overview

#### deployment link:  [https://peertalk-66wr.onrender.com](https://peertalk-66wr.onrender.com)

### Architecture

![Architecture diagram](screenshots/architecture-diagram.png)

### Database Schema

![Data Model](screenshots/er-diagram.png)

## Features

### Real-time Messaging 💬

![Real-time messaging screenshot](screenshots/messaging.png)

- **Instant Delivery**: Messages appear in real-time
- **Read Receipts**: Know when messages are seen
- **Message History**: Access complete chat history
- **Typing Indicators**: See when others are typing

### Video Calling 📹

![Video calling screenshot](screenshots/video-call.png)

- **Peer-to-Peer Connection**: Direct WebRTC connections
- **Camera/Mic Controls**: Easy audio/video management
- **Quality Indicators**: Monitor connection status
- **PiP View**: Picture-in-picture support

### Authentication & Security 🔒

![Authentication screenshot](screenshots/auth.png)

- **JWT Authentication**: Secure token-based auth
- **Password Security**: Encrypted password storage
- **Persistent Sessions**: Stay logged in across sessions

### Modern Interface 🎨

![Dark mode screenshot](screenshots/dark-mode.png)
![Mobile responsive screenshot](screenshots/mobile.png)

- **Responsive Design**: Works on all devices
- **Smooth Animations**: Polished user experience
- **Dark Mode**: Eye-friendly dark theme
- **Intuitive Layout**: Easy to navigate

### Chat Features ✨

![Chat features screenshot](screenshots/chat-features.png)

- **Typing Indicators**: Real-time typing status
- **Online Status**: See who's active
- **Message Reactions**: React to messages
- **File Sharing**: Share files securely

### Profile Management 👤

![Profile management screenshot](screenshots/profile.png)

- **Custom Profiles**: Personalize your profile
- **Profile Pictures**: Upload custom avatars
- **Status Messages**: Set custom status
- **Account Settings**: Manage preferences

## Technology Stack

### Frontend

- ⚛️ React with TypeScript
- 🎨 Tailwind CSS + Shadcn UI
- 🔄 Socket.io client
- 📹 WebRTC
- 🏪 Zustand
- 🛣️ React Router

### Backend

- 📡 Node.js + Express
- 🗄️ PostgreSQL + Prisma ORM
- 🔌 Socket.io
- 🔑 JWT
- 🐳 Docker

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Docker (optional)

### Quick Start

1. **Clone and Install**

```bash
git clone <repository-url>
cd chatApp

# Install dependencies
cd client && npm install
cd ../server && npm install
```

2. **Configure Environment**
   Create `.env` files:

Client `.env`:

```env
VITE_API_URL=http://localhost:3000
```

Server `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/chatapp"
JWT_SECRET="your-jwt-secret"
CLIENT_URL="http://localhost:5173"
```

3. **Initialize Database**

```bash
cd server
npx prisma migrate dev
```

4. **Run the Application**

Development mode:

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Using Docker:

```bash
docker-compose up
```

## Project Structure

```
chatApp/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── store/        # Zustand store
│   │   ├── pages/        # Page components
│   │   └── types/        # TypeScript types
│   └── ...
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   └── sockets/      # WebSocket handlers
│   └── ...
└── docker-compose.yml     # Docker configuration
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [Socket.io](https://socket.io/) for real-time communication
- [WebRTC](https://webrtc.org/) for video calling capabilities
