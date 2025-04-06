# PeerTalk

A modern real-time chat application with video calling capabilities. Built with React, Node.js, and WebRTC. Features instant messaging, peer-to-peer video calls, typing indicators, and real-time notifications, all wrapped in a beautiful UI.

## Overview

#### deployment link: [https://peertalk-66wr.onrender.com](https://peertalk-66wr.onrender.com)

### Architecture

![Architecture diagram](screenshots/architecture-diagram.png)

### Database Schema

![Data Model](screenshots/er-diagram.png)

## Features

### Authentication & Security 🔒

![Authentication screenshot](screenshots/auth.png)

- **Custom Google OAuth Implementation**: Built from scratch without third-party libraries
  - Complete OAuth 2.0 flow implementation
  - Secure token handling and validation
  - Profile picture import from Google
  - Automatic S3 upload for profile pictures
- **JWT Authentication**: Secure token-based auth
- **Password Security**: Encrypted password storage
- **Persistent Sessions**: Stay logged in across sessions

### Real-time Messaging 💬

![Real-time messaging screenshot](screenshots/messaging.png)

- **Instant Delivery**: Messages appear in real-time
- **Read Receipts**: Know when messages are seen
- **Message History**: Access complete chat history
- **Typing Indicators**: See when others are typing

### Video Calling 📹

![Video calling screenshot](screenshots/video-call.png)

- **Peer-to-Peer Connection**: Direct WebRTC connections
- **Quality Indicators**: Monitor connection status
- **PiP View**: Picture-in-picture support

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
  - Support for Google profile picture import
  - Automatic S3 storage and optimization
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
- ☁️ AWS S3 for file storage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Docker (optional)
- Google Developer Console Project (for OAuth)
- AWS Account (for S3)

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

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_REDIRECT_URI="http://localhost:5173/oauth/google/callback"

# AWS Configuration
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="your-region"
AWS_S3_BUCKET_NAME="your-bucket"
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
│   │   ├── services/     # Business logic services
│   │   └── sockets/      # WebSocket handlers
│   └── ...
└── docker-compose.yml     # Docker configuration
```

## OAuth Implementation Details

The Google OAuth implementation is built from scratch without relying on third-party OAuth libraries. Key components include:

1. **Frontend Flow**:
   - Custom OAuth consent screen
   - Secure state management during OAuth flow
   - Automatic token refresh handling
   - Profile picture integration

2. **Backend Services**:
   - Complete OAuth 2.0 flow implementation
   - Token validation and verification
   - User profile synchronization
   - Secure session management

3. **Security Features**:
   - CSRF protection
   - Secure token storage
   - XSS prevention
   - Rate limiting

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Shadcn UI](https://ui.shadcn.com/) for the beautiful UI components
- [Socket.io](https://socket.io/) for real-time communication
- [WebRTC](https://webrtc.org/) for video calling capabilities
