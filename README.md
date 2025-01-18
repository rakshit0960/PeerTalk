# PeerTalk 🌊
A modern real-time chat application with video calling capabilities. Built with React, Node.js, and WebRTC. Features instant messaging, peer-to-peer video calls, typing indicators, and real-time notifications, all wrapped in a beautiful UI.



## Architecture diagram
here is the architecture for this real-time application

![image.png](/.eraser/CLPp4DSYp6TvIttDBWvK___YuNASsjaCBgl2BKNG3p5hFCJeI83___athjQmR83qNok8TZhEaKx.png "image.png")

## Features
- 💬 Real-time messaging
- 📹 Video calling with WebRTC
- 🔔 Real-time notifications
- ✍️ Typing indicators
- 👤 User authentication
- 🎨 Modern UI with dark mode
- 🔒 Secure communication
## Tech Stack
### Frontend
- React with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- Socket.io client for real-time communication
- WebRTC for video calls
- Zustand for state management
- React Router for navigation
### Backend
- Node.js with Express
- PostgreSQL with Prisma ORM
- Socket.io for WebSocket communication
- JWT for authentication
- Docker for containerization
## Getting Started
### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- Docker (optional)
### Installation
1. Clone the repository:
```bash
git clone <repository-url>
cd chatApp
```
1. Install dependencies:
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```
1. Set up environment variables:
Create `.env` files in both client and server directories:

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
1. Initialize the database:
```bash
cd server
npx prisma migrate dev
```
### Running the Application
#### Development Mode
1. Start the server:
```bash
cd server
npm run dev
```
1. Start the client:
```bash
cd client
npm run dev
```
#### Using Docker
```bash
docker-compose up
```
## Features in Detail
### Real-time Messaging
- Instant message delivery
- Read receipts
- Message history
- Typing indicators
### Video Calling
- WebRTC-based peer-to-peer connection
- Camera and microphone controls
- Connection quality indicators
- Picture-in-picture view
### Authentication
- JWT-based authentication
- Secure password handling
- Persistent sessions
### User Interface
- Responsive design
- Modern animations
- Dark mode support
- Intuitive layout
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
│   │   ├── routes/      # API routes
│   │   └── sockets/     # WebSocket handlers
│   └── ...
└── docker-compose.yml    # Docker configuration
```
## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature` )
3. Commit your changes (`git commit -m 'Add some AmazingFeature'` )
4. Push to the branch (`git push origin feature/AmazingFeature` )
5. Open a Pull Request
## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- [﻿Shadcn UI](https://ui.shadcn.com/)  for the beautiful UI components
- [﻿Socket.io](https://socket.io/)  for real-time communication
- [﻿WebRTC](https://webrtc.org/)  for video calling capabilities



<!-- eraser-additional-content -->
## Diagrams
<!-- eraser-additional-files -->
<a href="/README-Real-Time Chat Application API Sequence-1.eraserdiagram" data-element-id="I1_9NjuI2yADYua0ZNeVW"><img src="/.eraser/CLPp4DSYp6TvIttDBWvK___YuNASsjaCBgl2BKNG3p5hFCJeI83___---diagram----a5b6d8f672c0b0ae068baaca1a7767eb-Real-Time-Chat-Application-API-Sequence.png" alt="" data-element-id="I1_9NjuI2yADYua0ZNeVW" /></a>
<!-- end-eraser-additional-files -->
<!-- end-eraser-additional-content -->
<!--- Eraser file: https://app.eraser.io/workspace/CLPp4DSYp6TvIttDBWvK --->
