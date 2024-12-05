# Chat App

A real-time chat application built with TypeScript, Node.js, and Prisma. This application allows users to communicate in real-time, manage chat rooms, and store messages in a PostgreSQL database.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- Real-time messaging
- User authentication
- Chat room management
- Persistent message storage

## Technologies

- **Node.js**: JavaScript runtime for building server-side applications.
- **TypeScript**: A superset of JavaScript that adds static types.
- **Prisma**: An ORM for Node.js and TypeScript that simplifies database access.
- **PostgreSQL**: A powerful, open-source relational database system.
- **Express**: A web framework for Node.js.
- **Socket.IO**: A library for real-time web applications.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/chat-app.git
   cd chat-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your PostgreSQL database:
   - Install PostgreSQL on your machine or use a cloud service.
   - Create a new database for the chat application.

4. Set up your environment variables. Create a `.env` file in the root directory and add your configuration:
   ```plaintext
   DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name
   NODE_ENV=development
   ```

5. Run database migrations (if applicable):
   ```bash
   npx prisma migrate dev
   ```

## Usage

To start the development server, run:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository.
2. Create your feature branch:
   ```bash
   git checkout -b feature/YourFeature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/YourFeature
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.