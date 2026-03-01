# Vitasoft - Full-Stack Task Management Application

A modern, full-stack TypeScript application for managing tasks with authentication, real-time updates, and a polished user interface. Built with React, Express, Prisma, and SQLite.

## 📋 Project Overview

Vitasoft is a task management application I built to help users stay organized and productive. It lets you create tasks, set priorities, mark them complete, and find what you need quickly with search and filtering. The app includes secure user authentication, so each person has their own private task list.

I designed it with a clean split between the frontend and backend, making it easier to maintain and extend over time. Everything is built with TypeScript for better reliability and developer experience.

## ✨ Features

### Authentication & Security
- User registration and login with secure JWT tokens
- **Usernames** – create an account with a unique username and email
- Passwords are hashed with bcrypt before storage; never returned in any API response
- **Password rules** – when you sign up or change your password, it must be at least 8 characters and include at least one uppercase letter, one number, and one special character (e.g. !@#$%^&*). The same rules apply on signup and when updating your password from Profile.
- **Change password** – update your password from the Profile page. You must enter your current password first; the app verifies it before allowing a change. The new password must meet the rules above and differ from the current one.
- Protected routes that require authentication
- Automatic logout when tokens expire or are invalid
- When you enter a wrong current password on the change-password form, you stay logged in and see a clear error message
- Secure token storage in browser localStorage

### Task Management
- Create, read, update, and delete tasks
- **Task summary** – At the top of the Tasks page, four cards show total tasks, how many are done, how many are still pending, and how many are overdue (past their due date and not completed). The numbers update as you work.
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
- **Activity timeline** – every create, update, complete, and delete is logged. Open the **Activity** page from the sidebar to see a chronological list. Activity data is loaded from the server (e.g. `GET /activity` when logged in).
- **Expandable details** – click any activity row to expand it. You’ll see the task title, description (if it had one), due date, completion status, the action that was performed, and the exact time it happened. Handy for checking what changed and when. The app stores a snapshot of the task at the time of the action, so you still see full details even for tasks that were later deleted.

### User Interface
- **Profile page** – click your avatar in the top-right corner to open your profile. See your username and email, and update your password when needed. Profile is only available from the avatar; the sidebar stays focused on Tasks, Activity, and Overview.
- **Password visibility toggles** – on Login, Signup, and the Profile change-password form, you can toggle an eye icon to show or hide what you type. No more guessing whether you entered the right password.
- **Due task notification** – a bell icon in the header shows how many tasks are overdue, due today, or due in the next 48 hours. Click it to open a dropdown with those tasks grouped so you can see what needs attention without opening the Tasks page.
- **Clear all notifications** – in the due-task dropdown, a “Clear” button lets you dismiss all current notifications at once. The badge disappears until new urgent tasks appear.
- **Overview page** – a welcoming landing page with a hero section, feature highlights, and an “Included out of the box” grid. “Get started” takes you to Tasks when logged in, or to Login when not.
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

## 🚀 How to run the app

These steps work on **Windows, macOS, and Linux**. On Windows you can use Command Prompt, PowerShell, or Git Bash—the commands are the same.

**What you need:** Node.js v18 or newer (download from [nodejs.org](https://nodejs.org) if you don’t have it). Check with `node -v` in a terminal. npm comes with Node.

### First time (from scratch)

**0. Get the code**

```bash
git clone https://github.com/ESPINSHALO/Vitasoft.git
cd Vitasoft
```

(Use your own fork’s URL if you forked the repo.)

**1. Backend**

Open a terminal (or Command Prompt on Windows), go into the project folder, and run:

```bash
cd server
npm install
```

Create a file named `.env` inside the `server` folder. Paste this into it (you can change `JWT_SECRET` to any random string):

```
PORT=4000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
```

Then run:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

The server will start on port 4000. Leave this terminal running. Swagger docs: `http://localhost:4000/api-docs`

**2. Frontend**

Open a second terminal in the project folder (the first one stays running the server):

```bash
cd client
npm install
```

Create a `.env` file in the `client` folder with exactly this line (if your server uses a different port, change 4000 to match):

```
VITE_API_URL=http://localhost:4000
```

Then run:

```bash
npm run dev
```

Vite will print a URL like `http://localhost:5173`. Open that in your browser. The port can change each run, so use whatever it shows.

**3. Use the app**

Sign up or log in. From the sidebar you can open Overview, Tasks, and Activity. Profile and password change are under the avatar in the top-right. The bell icon shows due and overdue tasks.

**Stuck?** If the server says "port already in use", something else is using port 4000—close that app or change `PORT` in `server/.env`. If you see "command not found" for `node` or `npm`, install Node from nodejs.org first. If registration says the email or username is already in use, sign in with that account or pick a different email or username.

### Later (when everything is already set up)

- **Server:** `cd server && npm run dev`
- **Client:** `cd client && npm run dev`  
  Then open the URL Vite prints in the terminal.

### Production build

**Server:**
```bash
cd server
npm run build
npm start
```

**Client:**
```bash
cd client
npm run build
npm run preview
```

## 🔐 Environment Variables

The app needs two `.env` files—one in `server/`, one in `client/`. Create them if they don’t exist.

**Server** (`server/.env`):

```env
PORT=4000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=1h
```

Use a strong random value for `JWT_SECRET` if you deploy to production.

**Client** (`client/.env`):

```env
VITE_API_URL=http://localhost:4000
```

Use the same host and port as your running server (e.g. if the server is on 4000, keep it as above).

## 📚 API Documentation

With the server running, open `http://localhost:4000/api-docs` (or whatever port you set in `server/.env`) in your browser. You get the full list of endpoints, request/response shapes, and you can try calls from there. Auth-protected routes are documented too—you can pass a token and test them from Swagger.

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

## Known Limitations

- SQLite is used for local development and is not ideal for high-scale production.
- Email verification is not implemented.
- Rate limiting is not enabled.
- Backend may sleep on free hosting tiers.

## 🔮 Future Improvements

### Short-term Enhancements
- **Task Categories/Tags** - Allow users to organize tasks with custom categories or tags
- **Bulk Operations** - Enable selecting and performing actions on multiple tasks simultaneously

### Medium-term Features
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
