# Vitasoft - Full-Stack Task Management Application

A modern, full-stack TypeScript application for managing tasks with authentication, real-time updates, and a polished user interface. Built with React, Express, Prisma, and SQLite.

## 📋 Project Overview

Vitasoft is a task management platform that enables users to create, organize, and track their tasks efficiently. The application features secure authentication, real-time task updates, and a responsive design that works seamlessly across desktop and mobile devices.

The project follows a clean architecture pattern with clear separation between client and server, ensuring maintainability and scalability.

## ✨ Features

### Authentication & Security
- User registration and login with JWT-based authentication
- Password hashing using bcrypt
- Protected routes with middleware-based authorization
- Automatic token refresh and logout handling
- Secure session management with localStorage persistence

### Task Management
- Create, read, update, and delete tasks
- Mark tasks as completed with optimistic UI updates
- Task descriptions and creation timestamps
- Visual priority indicators (low, medium, high)
- Real-time task list updates using React Query
- Empty state handling for better UX

### User Interface
- Modern glassmorphism design with gradient backgrounds
- Dark/light theme toggle with persistent preferences
- Smooth page transitions using Framer Motion
- Loading skeletons for better perceived performance
- Toast notifications for user feedback
- Responsive design optimized for mobile and desktop
- Collapsible sidebar navigation for mobile devices
- Touch-friendly button sizes and interactions

### Developer Experience
- Comprehensive API documentation with Swagger/OpenAPI
- TypeScript throughout for type safety
- Strict TypeScript configuration
- Hot module replacement for fast development
- Optimistic UI updates for instant feedback

## 🛠 Tech Stack

### Frontend
- **React 19** - Modern UI library with concurrent features
- **TypeScript** - Type-safe JavaScript for better developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **React Router** - Client-side routing for single-page application navigation
- **React Query (TanStack Query)** - Powerful data synchronization and caching
- **Zustand** - Lightweight state management for global application state
- **Axios** - HTTP client with interceptors for API communication
- **Framer Motion** - Animation library for smooth UI transitions
- **date-fns** - Date utility library for formatting timestamps
- **Sonner** - Toast notification system

### Backend
- **Node.js** - JavaScript runtime environment
- **Express 5** - Web framework for building RESTful APIs
- **TypeScript** - Type-safe server-side code
- **Prisma** - Modern ORM for database access and migrations
- **SQLite** - Lightweight, file-based database
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcrypt** - Password hashing library
- **Helmet** - Security middleware for HTTP headers
- **CORS** - Cross-origin resource sharing configuration
- **Morgan** - HTTP request logger
- **Swagger UI Express** - Interactive API documentation

## 🚀 Installation Steps

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see Environment Variables section below)

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:4000` by default.

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see Environment Variables section below)

4. Start the development server:
```bash
npm run dev
```

The client will run on `http://localhost:5173` by default.

### Production Build

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm run preview
```

## 🔐 Environment Variables

### Server (`.env` file in `server/` directory)

```env
# Server Configuration
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
```

**Important:** Replace `JWT_SECRET` with a strong, random string in production environments.

### Client (`.env` file in `client/` directory)

```env
# API Configuration
VITE_API_URL=http://localhost:4000
```

## 📚 API Documentation

Interactive API documentation is available via Swagger UI when the server is running:

**URL:** `http://localhost:4000/api-docs`

The Swagger interface provides:
- Complete endpoint documentation
- Request/response schemas
- Interactive API testing
- Authentication flow examples

All endpoints are documented with:
- Request parameters and body schemas
- Response formats and status codes
- Authentication requirements
- Error response examples

## 📦 Third-Party Libraries & Rationale

### Frontend Libraries

**@tanstack/react-query** - Provides powerful data fetching, caching, and synchronization. Chosen for its optimistic update capabilities, automatic background refetching, and excellent TypeScript support. Eliminates the need for manual loading states and error handling.

**zustand** - Minimal state management library selected for its simplicity and performance. Provides a clean API for global state (authentication tokens, theme preferences) without the boilerplate of Redux or Context API.

**axios** - HTTP client library offering interceptors for automatic token injection and centralized error handling. More feature-rich than native fetch API and provides better TypeScript support.

**framer-motion** - Animation library enabling smooth page transitions and micro-interactions. Chosen for its declarative API, performance optimizations, and excellent React integration.

**react-router-dom** - Industry-standard routing solution for React applications. Provides programmatic navigation, route guards, and nested routing capabilities essential for a multi-page application.

**date-fns** - Date utility library selected for its tree-shakeable design and functional programming approach. More modern and lightweight than Moment.js while providing comprehensive date formatting capabilities.

**sonner** - Toast notification library offering beautiful, accessible notifications with minimal configuration. Provides better UX than custom notification implementations.

**tailwindcss** - Utility-first CSS framework enabling rapid UI development without writing custom CSS. Chosen for its excellent developer experience, performance optimizations, and extensive customization options.

### Backend Libraries

**express** - Minimalist web framework providing routing, middleware support, and HTTP utilities. Industry standard for Node.js REST APIs with extensive ecosystem support.

**prisma** - Next-generation ORM offering type-safe database access, migration management, and excellent developer experience. Eliminates SQL boilerplate while maintaining performance and flexibility.

**jsonwebtoken** - JWT implementation for stateless authentication. Enables secure, scalable authentication without server-side session storage.

**bcrypt** - Password hashing library implementing industry-standard bcrypt algorithm. Essential for securely storing user passwords.

**helmet** - Security middleware setting various HTTP headers to protect against common vulnerabilities. Provides defense-in-depth security approach.

**cors** - Middleware for configuring Cross-Origin Resource Sharing. Essential for allowing frontend-backend communication in development and production.

**morgan** - HTTP request logger providing visibility into API usage. Helps with debugging and monitoring application behavior.

**swagger-ui-express** - Interactive API documentation generator. Enables developers and API consumers to understand and test endpoints without reading code.

**dotenv** - Environment variable management ensuring sensitive configuration remains outside version control. Industry standard for configuration management.

## 🔮 Future Improvements

### Short-term Enhancements
- **Task Filtering & Sorting** - Add filters for completed/pending tasks and sorting options (date, priority, alphabetical)
- **Task Categories/Tags** - Allow users to organize tasks with custom categories or tags
- **Due Dates** - Add due date functionality with reminders and notifications
- **Task Search** - Implement full-text search across task titles and descriptions
- **Bulk Operations** - Enable selecting and performing actions on multiple tasks simultaneously

### Medium-term Features
- **User Profile Management** - Allow users to update email, change password, and manage account settings
- **Task Sharing** - Enable sharing tasks between users with permission levels
- **File Attachments** - Support attaching files or images to tasks
- **Task Comments** - Add commenting system for collaboration on tasks
- **Activity Log** - Track and display task modification history

### Long-term Vision
- **Team Workspaces** - Multi-user workspaces with role-based access control
- **Calendar Integration** - Sync tasks with external calendar applications
- **Mobile Applications** - Native iOS and Android applications
- **Real-time Collaboration** - WebSocket-based real-time updates for team environments
- **Advanced Analytics** - Task completion statistics, productivity insights, and reporting
- **API Rate Limiting** - Implement rate limiting for API endpoints
- **Email Notifications** - Send email reminders for due tasks
- **Export Functionality** - Export tasks to CSV, PDF, or other formats
- **Dark Mode API** - Server-side theme preference synchronization

### Technical Improvements
- **Unit & Integration Tests** - Comprehensive test coverage for both frontend and backend
- **End-to-End Testing** - Automated E2E tests using Playwright or Cypress
- **CI/CD Pipeline** - Automated testing and deployment workflows
- **Docker Containerization** - Containerize application for easier deployment
- **Database Migration to PostgreSQL** - Migrate from SQLite to PostgreSQL for production scalability
- **Performance Monitoring** - Add application performance monitoring (APM) tools
- **Error Tracking** - Integrate error tracking service (e.g., Sentry)
- **API Versioning** - Implement API versioning strategy for backward compatibility

## 📁 Project Structure

```
Vitasoft/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── routes/        # Route configuration and guards
│   │   ├── store/         # Zustand state management
│   │   ├── lib/           # Utility functions and API client
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static assets
│   └── package.json
│
└── server/                # Express backend application
    ├── src/
    │   ├── config/        # Configuration files
    │   ├── controllers/   # Request handlers
    │   ├── middleware/    # Express middleware
    │   ├── routes/        # Route definitions
    │   ├── types/         # TypeScript type definitions
    │   └── prisma.ts      # Prisma client instance
    ├── prisma/
    │   ├── schema.prisma  # Database schema
    │   └── migrations/   # Database migrations
    └── package.json
```

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome. When contributing:

1. Follow TypeScript strict mode guidelines
2. Maintain consistent code style
3. Add comments for complex logic
4. Ensure all tests pass
5. Update documentation as needed

## 📄 License

ISC License - See LICENSE file for details

## 🙏 Acknowledgments

Built with modern web technologies and best practices. Special thanks to the open-source community for the excellent tools and libraries that made this project possible.
