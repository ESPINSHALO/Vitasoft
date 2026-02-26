# Vitasoft - Full-Stack Task Management Application

A modern, full-stack TypeScript application for managing tasks with authentication, real-time updates, and a polished user interface. Built with React, Express, Prisma, and SQLite.

## 📋 Project Overview

Vitasoft is a task management application I built to help users stay organized and productive. It lets you create tasks, set priorities, mark them complete, and find what you need quickly with search and filtering. The app includes secure user authentication, so each person has their own private task list.

I designed it with a clean split between the frontend and backend, making it easier to maintain and extend over time. Everything is built with TypeScript for better reliability and developer experience.

## ✨ Features

### Authentication & Security
- User registration and login with secure JWT tokens
- Passwords are hashed with bcrypt before storage
- Protected routes that require authentication
- Automatic logout handling when tokens expire
- Secure token storage in browser localStorage

### Task Management
- Create, read, update, and delete tasks
- Mark tasks as completed with optimistic UI updates
- Task descriptions and creation timestamps
- **Due dates** – set an expected completion date on any task. The app shows “Due soon” when the date is within 48 hours and “Overdue” when it’s past. Remaining time is shown with a clear countdown (e.g. “in 5 days”).
- **Duplicate detection** – when you create a task, the app checks for similar titles (same wording, one containing the other, or a lot of shared words). If it finds matches, it shows you the list and lets you either go back and change the title or create the task anyway.
- Visual priority indicators (low, medium, high)
- Search tasks by title or description
- Filter tasks by status (all, active, completed)
- Sort tasks by date, priority, or title
- Toggle between grid and list view layouts
- Real-time task list updates using React Query
- Empty state handling for better UX

### Activity History
- **Activity timeline** – every create, update, complete, and delete is logged. Open the **Activity** page from the sidebar (when the app is running at the client URL) to see a chronological list. The data is served from the same server (e.g. `GET http://localhost:4000/activity` when logged in).
- **Expandable details** – click any activity row to expand it. You’ll see the task title, description (if it had one), due date, completion status, the action that was performed, and the exact time it happened. Handy for checking what changed and when. The app stores a snapshot of the task at the time of the action, so you still see full details even for tasks that were later deleted.

### User Interface
- **Due task notification** – a bell icon in the header shows how many tasks are overdue, due today, or due in the next 48 hours. Click it to open a dropdown with those tasks grouped so you can see what needs attention without opening the Tasks page.
- Clean, modern design with gradient backgrounds and smooth animations
- Dark and light theme toggle that remembers your preference
- Smooth page transitions and micro-interactions
- Loading states with skeleton screens for better perceived performance
- Toast notifications for immediate feedback on actions
- Fully responsive layout that works great on phones, tablets, and desktops
- Collapsible sidebar navigation for smaller screens
- Touch-friendly controls optimized for mobile use

### Developer Experience
- Complete API documentation available through Swagger UI
- Full TypeScript coverage for catching errors early
- Strict TypeScript settings for maximum type safety
- Hot reloading for instant feedback during development
- Optimistic UI updates so the interface feels instant

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
- **Lucide React** - Icon library providing consistent, customizable icons

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

### Running the app (quick reference)

1. **Start the server** (in a terminal): `cd server && npm run dev`  
   - API and server: **http://localhost:4000**  
   - Swagger UI: **http://localhost:4000/api-docs**

2. **Start the client** (in another terminal): `cd client && npm run dev`  
   - **Use the URL that Vite prints** in the terminal (e.g. **http://localhost:5198**). Always open the exact URL shown.

3. **Open the app:** In your browser, go to the client URL from step 2. Log in to see Tasks, Activity, and the due-task bell in the header.

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

The server will run on **http://localhost:4000** by default. That’s also where the API and Swagger docs live (see [API Documentation](#-api-documentation) below).

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

The client will show a **Local** URL in the terminal when it starts (e.g. **http://localhost:5198**). **Open that exact URL in your browser**—do not guess the port.

**Using the app:** After opening the client URL and logging in, you’ll see the **Tasks** page (due dates, duplicate detection, due-soon/overdue labels), the **Activity** page in the sidebar (timeline with expandable details), and the **due task notification** bell in the header. The API is at **http://localhost:4000** and Swagger at **http://localhost:4000/api-docs**.

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

When the server is running, use these links:

- **App (client):** Open the URL that `npm run dev` prints in the client terminal (e.g. **http://localhost:5198**).
- **API:** **http://localhost:4000**
- **Swagger UI:** **http://localhost:4000/api-docs** (auth: `/api/auth`, tasks: `/tasks`, activity: `/activity`)

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
- **Task Categories/Tags** - Allow users to organize tasks with custom categories or tags
- **Bulk Operations** - Enable selecting and performing actions on multiple tasks simultaneously

### Medium-term Features
- **User Profile Management** - Allow users to update email, change password, and manage account settings
- **Task Sharing** - Enable sharing tasks between users with permission levels
- **File Attachments** - Support attaching files or images to tasks
- **Task Comments** - Add commenting system for collaboration on tasks

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

This project wouldn't be possible without the amazing open-source tools and libraries available today. Thanks to everyone who builds and maintains these projects that make development so much more enjoyable.
