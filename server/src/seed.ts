import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/database';
import { env } from './config/env';
import {
  User,
  Company,
  Course,
  Job,
  Project,
  InterviewQuestion,
  Enrollment,
  Application,
  Certificate,
  Review,
} from './models';
import { slugify } from './utils/slugify';

const log = (...args: unknown[]) => console.log(...args);

const passwordHash = bcrypt.hashSync('password123', 10);

const IMG = {
  courseNext:
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1600&q=90',
  courseJS:
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&q=90',
  courseReact:
    'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&w=1600&q=90',
  courseNode:
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&q=90',
  courseTS:
    'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?auto=format&fit=crop&w=1600&q=90',
  courseMongo:
    'https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=1600&q=90',
  courseTailwind:
    'https://images.unsplash.com/photo-1587440871875-191322ee64b0?auto=format&fit=crop&w=1600&q=90',
  courseDocker:
    'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=1600&q=90',
  courseMern:
    'https://images.unsplash.com/photo-1593642532973-d31b6557fa68?auto=format&fit=crop&w=1600&q=90',
  courseSystemDesign:
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1600&q=90',
  compTechNova:
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=90',
  compCloudPeak:
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=90',
  compCodeVerse:
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=90',
  compDataDriven:
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=90',
  compInnoStack:
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=90',
  compWebSphere:
    'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=800&q=90',
  compPixelForge:
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=90',
  compSecureNet:
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=90',
  compGameCraft:
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=90',
  compMobileMinds:
    'https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=800&q=90',
  projDevMatch:
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=90',
  projCourseForge:
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=90',
  projSkillSync:
    'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?auto=format&fit=crop&w=1600&q=90',
  projCodeQuiz:
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1600&q=90',
  projTaskFlow:
    'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=1600&q=90',
  projFitTrack:
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1600&q=90',
  projChatWave:
    'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?auto=format&fit=crop&w=1600&q=90',
  projShopEase:
    'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1600&q=90',
  projWeatherWise:
    'https://images.unsplash.com/photo-1592210454359-9043f067919b?auto=format&fit=crop&w=1600&q=90',
  projCodeCollab:
    'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1600&q=90',
  avAdmin:
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
  avSojib:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  avAyesha:
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  avMichael:
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  avSarah:
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&q=80',
  avDavid:
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  avEmma:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  avJames:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  avOlivia:
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  avAnik:
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
};

const VIDEO = {
  sintel: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
  bunny: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
  movie300: 'https://media.w3.org/2010/05/video/movie_300.mp4',
  bigBunnyClip: 'https://www.w3schools.com/html/mov_bbb.mp4',
  flower: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  sample640: 'https://filesamples.com/samples/video/mp4/sample_640x360.mp4',
  sample5s: 'https://download.samplelib.com/mp4/sample-5s.mp4',
  bigBunny10s:
    'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
};

const buildInterviewQuestions = () => {
  const qs: Array<{ question: string; answer: string; category: string; difficulty: 'Easy' | 'Medium' | 'Hard'; topic: string }> = [
    // JavaScript
    { category: 'JavaScript', difficulty: 'Easy', topic: 'Basics', question: 'What is the difference between `let`, `const` and `var`?', answer: '`var` is function-scoped and hoisted with `undefined`. `let` and `const` are block-scoped. `const` cannot be reassigned after declaration, while `let` can. Prefer `const` by default and `let` when reassignment is needed.' },
    { category: 'JavaScript', difficulty: 'Easy', topic: 'Functions', question: 'What is a closure in JavaScript?', answer: 'A closure is a function that retains access to its outer (enclosing) scope even after the outer function has finished executing. It is created when an inner function references variables from its outer function and is returned or passed elsewhere.' },
    { category: 'JavaScript', difficulty: 'Medium', topic: 'Async', question: 'Explain the event loop and how asynchronous code runs in JavaScript.', answer: 'JavaScript is single-threaded. The event loop processes the call stack first; when async operations (timers, promises, I/O) complete, their callbacks are pushed to the task/microtask queues. The event loop keeps pulling microtasks (promises) before macrotasks (setTimeout, I/O) to keep the main thread responsive.' },
    { category: 'JavaScript', difficulty: 'Medium', topic: 'Async', question: 'What is the difference between `Promise.all` and `Promise.allSettled`?', answer: '`Promise.all` rejects immediately when any promise rejects and resolves with an array of results when all succeed. `Promise.allSettled` never rejects; it waits for all promises and returns results with `status: "fulfilled" | "rejected"` for each.' },
    { category: 'JavaScript', difficulty: 'Hard', topic: 'Concurrency', question: 'What is debouncing and how would you implement it?', answer: 'Debouncing ensures a function runs only after a period of inactivity. A timer is reset on every call; the function executes after the delay has passed since the last invocation. Useful for search inputs and resize handlers.' },

    // React
    { category: 'React', difficulty: 'Easy', topic: 'Hooks', question: 'What is the difference between `useState` and `useReducer`?', answer: '`useState` is for simple state values; `useReducer` is for more complex state logic with multiple sub-values or when the next state depends on the previous state. `useReducer` gives you a `dispatch` function and a predictable reducer pattern similar to Redux.' },
    { category: 'React', difficulty: 'Medium', topic: 'Hooks', question: 'What is the purpose of `useEffect` and what are common mistakes with it?', answer: '`useEffect` runs side effects like data fetching, subscriptions, or manual DOM updates after render. Common mistakes: missing dependencies causing stale closures, running infinite loops by setting state without guards, and not cleaning up subscriptions/event listeners.' },
    { category: 'React', difficulty: 'Medium', topic: 'Performance', question: 'What is memoization in React and when should you use `React.memo` / `useMemo`?', answer: 'Memoization caches the result of a computation and only recomputes when dependencies change. `React.memo` prevents re-renders of a component when props are unchanged. `useMemo` caches values, `useCallback` caches functions. Use them only for expensive computations or components that re-render too often, as they add overhead.' },
    { category: 'React', difficulty: 'Hard', topic: 'Architecture', question: 'What is the Virtual DOM and how does reconciliation work?', answer: 'The Virtual DOM is an in-memory representation of the real DOM. On state changes, React builds a new virtual tree, diffs it against the previous one (reconciliation), computes the minimal set of changes, and applies them to the real DOM. The diffing algorithm is optimized with keys and the assumption that components of the same type/position are the same.' },

    // Next.js
    { category: 'Next.js', difficulty: 'Easy', topic: 'Rendering', question: 'What is the difference between Server Components and Client Components in Next.js?', answer: 'Server Components render on the server, can use backend resources directly, reduce client JS, and cannot use hooks/event handlers. Client Components are hydrated in the browser for interactivity. You mark a component as client with `"use client"`.' },
    { category: 'Next.js', difficulty: 'Medium', topic: 'Rendering', question: 'Explain ISR (Incremental Static Regeneration).', answer: 'ISR lets you update static pages after deployment by revalidating them on demand or at a timed interval using `revalidate`. Pages are served statically but regenerate in the background when stale, giving you the speed of static rendering with fresh data.' },

    // Node.js
    { category: 'Node.js', difficulty: 'Medium', topic: 'Server', question: 'What is middleware in Express and how does the request lifecycle work?', answer: 'Middleware are functions that run in sequence during the request-response cycle. Each middleware can modify `req`/`res`, end the response, or call `next()` to pass control. Order matters — middleware registered first runs first.' },
    { category: 'Node.js', difficulty: 'Medium', topic: 'Architecture', question: 'How would you handle errors in an Express + TypeScript app?', answer: 'Use a centralized error handler middleware at the end of the middleware chain. Create a custom `AppError` class with status codes, use async wrappers to catch promise rejections, validate inputs with Zod, and never let errors crash the process. In development, log the full stack.' },

    // MongoDB
    { category: 'MongoDB', difficulty: 'Easy', topic: 'Data Model', question: 'What is the difference between embedding and referencing in MongoDB?', answer: 'Embedding stores related data in the same document — good for one-to-many with small, frequently-read data (e.g., course lessons). Referencing stores an ID and uses joins-like queries — good for data that is large, changes independently, or is shared. Choose based on access patterns.' },
    { category: 'MongoDB', difficulty: 'Medium', topic: 'Queries', question: 'How do indexes work in MongoDB and when should you use a compound index?', answer: 'Indexes speed up queries by allowing MongoDB to find documents without scanning the whole collection. Compound indexes help when queries filter/sort by multiple fields; field order matters — place equality filters first, then sort fields.' },

    // Frontend general
    { category: 'Frontend', difficulty: 'Medium', topic: 'CSS', question: 'What is the box model and how does flexbox differ from grid?', answer: 'The box model is content, padding, border, and margin around every element. Flexbox is one-dimensional (row or column) and great for alignment and distributing items. Grid is two-dimensional (rows and columns together) and better for full page/layout structure.' },
    { category: 'Frontend', difficulty: 'Easy', topic: 'Accessibility', question: 'What are some important accessibility best practices?', answer: 'Use semantic HTML (nav, main, button, label), proper heading hierarchy, alt text on images, ARIA labels where native elements are insufficient, keyboard navigation support, visible focus states, sufficient color contrast, and test with screen readers.' },

    // Backend general
    { category: 'Backend', difficulty: 'Medium', topic: 'Security', question: 'What are common security best practices for a REST API?', answer: 'Hash passwords with bcrypt, use JWT or secure sessions, implement role-based authorization, validate all inputs, rate-limit endpoints, enable CORS correctly, set security headers with Helmet, use HTTPS, and never log or store secrets.' },

    // Behavioral
    { category: 'Behavioral', difficulty: 'Easy', topic: 'Communication', question: 'Tell me about a challenging project you built.', answer: 'Use the STAR method: Situation, Task, Action, Result. Describe the project goal, your specific role, the technical decisions you made (mention stack and trade-offs), a challenge you overcame, and the measurable result (users, performance gain, or grade).' },
    { category: 'Behavioral', difficulty: 'Easy', topic: 'Teamwork', question: 'How do you handle disagreements with a teammate?', answer: 'Focus on the problem, not the person. Listen to their perspective, share your reasoning with evidence, find common ground, and escalate only if needed. The goal is the best outcome for the product, not winning the argument.' },
  ];
  return qs;
};

const buildCourses = (instructorId: string) => [
  {
    title: 'Next.js Full Stack Development',
    description:
      'Build production-ready full-stack applications with Next.js App Router, React Server Components, and modern TypeScript.',
    thumbnail: IMG.courseNext,
    longDescription:
      'This course takes you from the fundamentals of the Next.js App Router to advanced production patterns. You will build a complete full-stack job marketplace with authentication, databases, API routes, and server components — everything you need to ship real products.',
    category: 'Web Development',
    technology: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js'],
    level: 'Intermediate',
    price: 49,
    durationHours: 18,
    featured: true,
    whatYouWillLearn: [
      'Build full-stack apps with the Next.js App Router',
      'Master React Server and Client Components',
      'Implement authentication and authorization',
      'Integrate MongoDB with your Next.js apps',
      'Deploy production applications to Vercel',
    ],
    requirements: ['Basic JavaScript knowledge', 'Familiarity with React basics'],
    modules: [
      {
        title: 'Getting Started with Next.js',
        description: 'Set up your first Next.js application and understand the App Router.',
        order: 1,
        lessons: [
          { title: 'Welcome & Course Overview', type: 'video', duration: 8, videoUrl: '', content: 'An introduction to the course structure and what you will build.', order: 1 },
          { title: 'Setting Up a Next.js Project', type: 'video', duration: 12, videoUrl: '', content: 'Create a new Next.js app, understand the folder structure, and run the dev server.', order: 2 },
          { title: 'Understanding the App Router', type: 'reading', duration: 15, videoUrl: '', content: 'Learn how file-based routing works with layout, page, loading, and error files.', order: 3 },
          { title: 'Fundamentals Quiz', type: 'quiz', duration: 10, videoUrl: '', order: 4, quiz: {
            passingScore: 60,
            questions: [
              { question: 'Which folder structure does the App Router use?', options: [{ text: 'pages/' }, { text: 'app/' }, { text: 'components/' }, { text: 'routes/' }], correctAnswer: 'app/', explanation: 'The App Router uses the app/ directory with nested layouts and pages.' },
              { question: 'What file defines the root layout?', options: [{ text: 'index.tsx' }, { text: 'layout.tsx' }, { text: 'root.tsx' }, { text: 'app.tsx' }], correctAnswer: 'layout.tsx', explanation: 'app/layout.tsx wraps all routes with shared UI like headers and fonts.' },
              { question: 'How do you mark a component as a Client Component?', options: [{ text: 'Use useClient() hook' }, { text: 'Add "use client" directive' }, { text: 'It is automatic' }, { text: 'Rename to .client.tsx' }], correctAnswer: 'Add "use client" directive', explanation: 'The "use client" directive at the top of a file marks it as a Client Component.' },
            ],
          } },
        ],
      },
      {
        title: 'Data Fetching & Server Components',
        description: 'Fetch data on the server and stream dynamic content.',
        order: 2,
        lessons: [
          { title: 'Server vs Client Components', type: 'video', duration: 14, videoUrl: '', content: 'Understand the rendering model and when to use each component type.', order: 1 },
          { title: 'Fetching Data with Server Components', type: 'reading', duration: 12, videoUrl: '', content: 'Use async server components to fetch data directly from the database or APIs.', order: 2 },
          { title: 'API Routes & Route Handlers', type: 'video', duration: 16, videoUrl: '', content: 'Build REST endpoints with Next.js Route Handlers.', order: 3 },
        ],
      },
      {
        title: 'Authentication & Database',
        description: 'Add secure auth and MongoDB to your app.',
        order: 3,
        lessons: [
          { title: 'Setting Up MongoDB with Mongoose', type: 'reading', duration: 15, videoUrl: '', content: 'Connect MongoDB, define schemas, and model your data.', order: 1 },
          { title: 'JWT Authentication Flow', type: 'video', duration: 18, videoUrl: '', content: 'Implement signup, login, and protected routes with JWT.', order: 2 },
          { title: 'Deploying to Production', type: 'video', duration: 10, videoUrl: '', content: 'Configure environment variables and deploy to Vercel.', order: 3 },
        ],
      },
    ],
  },
  {
    title: 'Complete JavaScript Mastery',
    description:
      'From JavaScript fundamentals to advanced concepts like closures, promises, and the event loop — everything in one course.',
    thumbnail: IMG.courseJS,
    longDescription:
      'A deep dive into modern JavaScript. Cover variables, functions, objects, arrays, closures, this binding, prototypes, async programming, ES6+ features, and debugging. Build real projects along the way to cement your knowledge.',
    category: 'Programming',
    technology: ['JavaScript', 'TypeScript'],
    level: 'Beginner',
    price: 29,
    durationHours: 24,
    featured: true,
    whatYouWillLearn: [
      'Write clean, modern ES6+ JavaScript',
      'Master closures, scoping, and the event loop',
      'Work confidently with promises and async/await',
      'Understand `this`, prototypes, and OOP in JS',
    ],
    requirements: ['No prior experience needed'],
    modules: [
      {
        title: 'Core Language Fundamentals',
        description: 'Variables, data types, operators, and control flow.',
        order: 1,
        lessons: [
          { title: 'Variables, let, const & var', type: 'video', duration: 10, videoUrl: '', content: 'Understand scoping, hoisting, and when to use each declaration.', order: 1 },
          { title: 'Data Types & Type Coercion', type: 'reading', duration: 12, videoUrl: '', content: 'Primitives, objects, truthiness, and coercion pitfalls.', order: 2 },
          { title: 'Functions Deep Dive', type: 'video', duration: 15, videoUrl: '', content: 'Function declarations, expressions, arrow functions, and higher-order functions.', order: 3 },
        ],
      },
      {
        title: 'Advanced Concepts',
        description: 'Closures, this, prototypes, and async.',
        order: 2,
        lessons: [
          { title: 'Closures & Scope', type: 'video', duration: 14, videoUrl: '', content: 'Lexical scoping, closures, and practical use cases.', order: 1 },
          { title: 'The Event Loop & Async JavaScript', type: 'video', duration: 17, videoUrl: '', content: 'Callbacks, promises, async/await, and how the event loop works.', order: 2 },
          { title: 'Advanced JavaScript Quiz', type: 'quiz', duration: 10, videoUrl: '', order: 3, quiz: {
            passingScore: 60,
            questions: [
              { question: 'What does `const` mean?', options: [{ text: 'The value can never change' }, { text: 'The binding cannot be reassigned' }, { text: 'It is the same as let' }, { text: 'It creates a global variable' }], correctAnswer: 'The binding cannot be reassigned', explanation: 'const prevents reassignment of the binding, but objects referenced by it can still be mutated.' },
              { question: 'Which is a truthy value?', options: [{ text: '0' }, { text: '""' }, { text: 'NaN' }, { text: '"false"' }], correctAnswer: '"false"', explanation: 'Any non-empty string is truthy, including the string "false".' },
            ],
          } },
        ],
      },
    ],
  },
  {
    title: 'React & TypeScript Masterclass',
    description:
      'Build modern, type-safe React applications with hooks, context, custom hooks, and full TypeScript integration.',
    thumbnail: IMG.courseReact,
    longDescription:
      'Learn React the right way with TypeScript. Cover components, props, state, hooks, context, forms, data fetching with TanStack Query, performance optimization, and testing. Build a complete e-commerce dashboard as your capstone project.',
    category: 'Web Development',
    technology: ['React', 'TypeScript', 'Tailwind CSS'],
    level: 'Intermediate',
    price: 39,
    durationHours: 21,
    featured: true,
    whatYouWillLearn: [
      'Build reusable, type-safe React components',
      'Master useState, useEffect, useContext and custom hooks',
      'Manage server state with TanStack Query',
      'Optimize React performance with memoization',
    ],
    requirements: ['Basic HTML/CSS', 'Fundamental JavaScript'],
    modules: [
      {
        title: 'React & TypeScript Basics',
        description: 'Components, props, and typing your UI.',
        order: 1,
        lessons: [
          { title: 'Setting Up a React + TS Project', type: 'video', duration: 11, videoUrl: '', content: 'Scaffold a Vite project and configure TypeScript strict mode.', order: 1 },
          { title: 'Typing Props & State', type: 'video', duration: 13, videoUrl: '', content: 'Interfaces, unions, and generics for components and hooks.', order: 2 },
        ],
      },
      {
        title: 'Advanced Hooks & Data',
        description: 'Custom hooks and server state.',
        order: 2,
        lessons: [
          { title: 'Custom Hooks in Depth', type: 'video', duration: 15, videoUrl: '', content: 'Extract reusable logic into custom hooks with proper types.', order: 1 },
          { title: 'Data Fetching with TanStack Query', type: 'reading', duration: 14, videoUrl: '', content: 'Caching, mutations, and optimistic updates.', order: 2 },
        ],
      },
    ],
  },
  {
    title: 'Node.js & Express Backend Bootcamp',
    description:
      'Design robust REST APIs with Express, MongoDB, authentication, validation, and production-ready architecture.',
    thumbnail: IMG.courseNode,
    longDescription:
      'Go from zero to a production-ready backend developer. Build a complete REST API with Express, learn controllers/services architecture, JWT auth, input validation with Zod, rate limiting, error handling, and deployment to Render.',
    category: 'Backend Development',
    technology: ['Node.js', 'Express', 'MongoDB', 'TypeScript'],
    level: 'Intermediate',
    price: 45,
    durationHours: 26,
    featured: true,
    whatYouWillLearn: [
      'Build and structure REST APIs with Express',
      'Design MongoDB schemas with Mongoose',
      'Implement JWT authentication and RBAC',
      'Write validators, error handling and rate limiting',
    ],
    requirements: ['Basic JavaScript', 'MongoDB basics helpful'],
    modules: [
      {
        title: 'Express Foundations',
        description: 'Your first Express server and routing.',
        order: 1,
        lessons: [
          { title: 'Introduction to Express', type: 'video', duration: 9, videoUrl: '', content: 'Create your first Express server and understand middleware.', order: 1 },
          { title: 'RESTful Routing & Controllers', type: 'reading', duration: 12, videoUrl: '', content: 'Design clean routes and keep business logic out of route files.', order: 2 },
        ],
      },
      {
        title: 'Authentication & Databases',
        description: 'Secure your API with JWT and MongoDB.',
        order: 2,
        lessons: [
          { title: 'Mongoose Models & Indexes', type: 'video', duration: 16, videoUrl: '', content: 'Model users, courses, and jobs with proper indexes.', order: 1 },
          { title: 'JWT Auth & Authorization', type: 'video', duration: 18, videoUrl: '', content: 'Hash passwords, issue JWTs, and protect routes by role.', order: 2 },
        ],
      },
    ],
  },
  {
    title: 'TypeScript Deep Dive',
    description:
      'Master static typing, generics, advanced types, and modern TypeScript patterns used in production codebases.',
    thumbnail: IMG.courseTS,
    longDescription:
      'Take your TypeScript skills to the next level. Cover the type system in depth: unions, intersections, generics, utility types, conditional types, decorators, and strict mode configuration. Learn how to design type-safe APIs and refactor existing JavaScript codebases to TypeScript.',
    category: 'Programming',
    technology: ['TypeScript', 'JavaScript', 'Node.js'],
    level: 'Intermediate',
    price: 34,
    durationHours: 20,
    featured: true,
    whatYouWillLearn: [
      'Master TypeScripts type system and inference',
      'Design reusable generics and advanced utility types',
      'Configure strict TypeScript in real projects',
      'Migrate JavaScript codebases to TypeScript safely',
    ],
    requirements: ['Solid JavaScript fundamentals'],
    modules: [
      {
        title: 'TypeScript Fundamentals',
        description: 'Core types, inference, and configuration.',
        order: 1,
        lessons: [
          { title: 'Introduction to TypeScript', type: 'video', duration: 12, videoUrl: '', content: 'Why TypeScript, how the compiler works, and setting up your first project.', order: 1 },
          { title: 'Primitives, Unions & Literals', type: 'reading', duration: 14, videoUrl: '', content: 'Basic type annotations, unions, literal types, and type inference.', order: 2 },
          { title: 'Interfaces, Types & Generics', type: 'video', duration: 18, videoUrl: '', content: 'Designing reusable types with interfaces, type aliases, and generic functions.', order: 3 },
        ],
      },
      {
        title: 'Advanced Type System',
        description: 'Advanced types and patterns for production.',
        order: 2,
        lessons: [
          { title: 'Utility Types & Conditional Types', type: 'video', duration: 20, videoUrl: '', content: 'Partial, Pick, Omit, Record, and building conditional mapped types.', order: 1 },
          { title: 'TypeScript Quiz', type: 'quiz', duration: 10, videoUrl: '', order: 2, quiz: {
            passingScore: 60,
            questions: [
              { question: 'Which keyword defines a union type?', options: [{ text: '&' }, { text: '|' }, { text: '+' }, { text: '?' }], correctAnswer: '|', explanation: 'The pipe | creates a union of multiple types.' },
              { question: 'What does Pick<T, K> do?', options: [{ text: 'Removes keys from T' }, { text: 'Selects keys K from T' }, { text: 'Makes T optional' }, { text: 'Freezes T' }], correctAnswer: 'Selects keys K from T', explanation: 'Pick constructs a type by selecting the given keys from another type.' },
            ],
          } },
        ],
      },
    ],
  },
  {
    title: 'MongoDB & Mongoose Essentials',
    description:
      'Learn schema design, indexing, aggregation, and Mongoose patterns for building scalable data layers.',
    thumbnail: IMG.courseMongo,
    longDescription:
      'Understand how MongoDB stores documents and how to model data for real applications. Cover schema design best practices (embedding vs referencing), indexes and query optimization, the aggregation pipeline, and Mongoose schemas, middleware, and population.',
    category: 'Backend Development',
    technology: ['MongoDB', 'Mongoose', 'Node.js'],
    level: 'Beginner',
    price: 27,
    durationHours: 15,
    featured: false,
    whatYouWillLearn: [
      'Design MongoDB schemas with confidence',
      'Write optimized queries using indexes',
      'Build aggregation pipelines for analytics',
      'Use Mongoose middleware and population',
    ],
    requirements: ['Basic JavaScript knowledge'],
    modules: [
      {
        title: 'Data Modeling',
        description: 'Documents, schemas, and indexes.',
        order: 1,
        lessons: [
          { title: 'Documents, Collections & BSON', type: 'video', duration: 13, videoUrl: '', content: 'How MongoDB stores data and how it differs from relational databases.', order: 1 },
          { title: 'Schema Design Patterns', type: 'reading', duration: 15, videoUrl: '', content: 'Embedding vs referencing, one-to-many, and many-to-many relationships.', order: 2 },
          { title: 'Indexes & Query Optimization', type: 'video', duration: 17, videoUrl: '', content: 'Single-field, compound, and text indexes and how to read query plans.', order: 3 },
        ],
      },
      {
        title: 'Mongoose in Practice',
        description: 'Building the data layer with Mongoose.',
        order: 2,
        lessons: [
          { title: 'Mongoose Schemas, Middleware & Population', type: 'video', duration: 19, videoUrl: '', content: 'Define schemas, use pre/post hooks, and join collections with populate.', order: 1 },
          { title: 'MongoDB Quiz', type: 'quiz', duration: 10, videoUrl: '', order: 2, quiz: {
            passingScore: 60,
            questions: [
              { question: 'Which is better for small frequently-read child data?', options: [{ text: 'Referencing' }, { text: 'Embedding' }, { text: 'Sharding' }, { text: 'Indexing' }], correctAnswer: 'Embedding', explanation: 'Embedding avoids extra queries for small, frequently-read related data.' },
              { question: 'What does a compound index help with?', options: [{ text: 'Text search only' }, { text: 'Filtering/sorting by multiple fields' }, { text: 'Data compression' }, { text: 'Authentication' }], correctAnswer: 'Filtering/sorting by multiple fields', explanation: 'Compound indexes support queries that filter or sort on multiple fields.' },
            ],
          } },
        ],
      },
    ],
  },
  {
    title: 'Tailwind CSS & Modern UI Design',
    description:
      'Build beautiful, responsive interfaces fast with Tailwind CSS, design systems, and modern layout techniques.',
    thumbnail: IMG.courseTailwind,
    longDescription:
      'Go from utility-class basics to building polished production UIs. Cover spacing, colors, typography, responsive breakpoints, flexbox and grid layouts, dark mode, custom themes, and reusable component patterns used in real products.',
    category: 'Web Development',
    technology: ['Tailwind CSS', 'CSS', 'React'],
    level: 'Beginner',
    price: 24,
    durationHours: 12,
    featured: true,
    whatYouWillLearn: [
      'Build responsive layouts with flexbox and grid',
      'Create consistent design systems with Tailwind',
      'Implement dark mode and custom themes',
      'Ship polished, accessible UI components',
    ],
    requirements: ['Basic HTML/CSS'],
    modules: [
      {
        title: 'Styling Fundamentals',
        description: 'Utilities, layout, and responsiveness.',
        order: 1,
        lessons: [
          { title: 'Utility-First CSS with Tailwind', type: 'video', duration: 11, videoUrl: '', content: 'Why utility-first works and how to compose styles without writing CSS.', order: 1 },
          { title: 'Layouts with Flexbox & Grid', type: 'video', duration: 16, videoUrl: '', content: 'Build common page layouts using flex and grid utilities.', order: 2 },
          { title: 'Responsive Design & Breakpoints', type: 'reading', duration: 12, videoUrl: '', content: 'Mobile-first classes and adaptive layouts across screen sizes.', order: 3 },
        ],
      },
      {
        title: 'Components & Themes',
        description: 'Design systems and dark mode.',
        order: 2,
        lessons: [
          { title: 'Building Reusable Components', type: 'video', duration: 15, videoUrl: '', content: 'Extract design tokens and build a small component library.', order: 1 },
          { title: 'Tailwind Quiz', type: 'quiz', duration: 10, videoUrl: '', order: 2, quiz: {
            passingScore: 60,
            questions: [
              { question: 'Which class centers content with flexbox?', options: [{ text: 'center' }, { text: 'flex justify-center items-center' }, { text: 'mx-auto block' }, { text: 'text-center' }], correctAnswer: 'flex justify-center items-center', explanation: 'display flex with justify-center (horizontal) and items-center (vertical) centers content.' },
              { question: 'How do you make an element dark-mode aware?', options: [{ text: 'dark: variant' }, { text: 'night: variant' }, { text: 'theme: variant' }, { text: 'You cannot' }], correctAnswer: 'dark: variant', explanation: 'Tailwind provides a dark: variant for dark mode styling.' },
            ],
          } },
        ],
      },
    ],
  },
  {
    title: 'Docker & DevOps Fundamentals',
    description:
      'Containerize applications, manage images and networks, and ship with CI/CD pipelines from zero to hero.',
    thumbnail: IMG.courseDocker,
    longDescription:
      'Learn the container mindset: Dockerfiles, images, volumes, networks, and Docker Compose. Then go further with CI/CD concepts, environment management, and deployment workflows that teams use to ship software reliably.',
    category: 'DevOps',
    technology: ['Docker', 'DevOps', 'CI/CD', 'Linux'],
    level: 'Intermediate',
    price: 42,
    durationHours: 16,
    featured: false,
    whatYouWillLearn: [
      'Containerize any application with Docker',
      'Orchestrate multi-service apps with Docker Compose',
      'Build CI/CD pipelines for automated deploys',
      'Manage environments and infrastructure as code',
    ],
    requirements: ['Basic terminal/command-line skills'],
    modules: [
      {
        title: 'Container Basics',
        description: 'Images, containers, and orchestration.',
        order: 1,
        lessons: [
          { title: 'What are Containers?', type: 'video', duration: 12, videoUrl: '', content: 'Containers vs VMs and how they share the host kernel.', order: 1 },
          { title: 'Images vs Containers', type: 'reading', duration: 10, videoUrl: '', content: 'Understanding image layers, tags, and container lifecycle.', order: 2 },
          { title: 'Dockerfile & Docker Compose', type: 'video', duration: 20, videoUrl: '', content: 'Write Dockerfiles and wire up multi-service apps with Compose.', order: 3 },
        ],
      },
      {
        title: 'CI/CD & Deployment',
        description: 'Automating build, test, and deploy.',
        order: 2,
        lessons: [
          { title: 'CI/CD Pipelines', type: 'video', duration: 18, videoUrl: '', content: 'Automate linting, testing, and deployment with pipeline stages.', order: 1 },
          { title: 'Docker Quiz', type: 'quiz', duration: 10, videoUrl: '', order: 2, quiz: {
            passingScore: 60,
            questions: [
              { question: 'What file defines how to build a Docker image?', options: [{ text: 'Dockerfile' }, { text: 'docker.yml' }, { text: 'config.json' }, { text: 'Containerfile.txt' }], correctAnswer: 'Dockerfile', explanation: 'A Dockerfile contains the instructions to build an image.' },
              { question: 'Docker Compose is used for:', options: [{ text: 'Single images only' }, { text: 'Multi-container apps' }, { text: 'Backups' }, { text: 'Logging only' }], correctAnswer: 'Multi-container apps', explanation: 'Compose defines and runs multi-container applications.' },
            ],
          } },
        ],
      },
    ],
  },
  {
    title: 'Full-Stack MERN Capstone',
    description:
      'Build and deploy a complete production-ready web app with MongoDB, Express, React, and Node.js end to end.',
    thumbnail: IMG.courseMern,
    longDescription:
      'Your final project course: architect, build, and deploy a full-stack application. Cover REST API design, authentication with refresh tokens, real-time updates with WebSockets, testing, performance, and deployment to cloud platforms. Finish with a portfolio-ready capstone.',
    category: 'Web Development',
    technology: ['MongoDB', 'Express', 'React', 'Node.js', 'WebSockets'],
    level: 'Advanced',
    price: 59,
    durationHours: 30,
    featured: true,
    whatYouWillLearn: [
      'Architect scalable full-stack applications',
      'Implement JWT auth with refresh tokens',
      'Add real-time features with WebSockets',
      'Deploy to production with confidence',
    ],
    requirements: ['Solid MERN stack basics', 'Intermediate JavaScript'],
    modules: [
      {
        title: 'Project Planning & Architecture',
        description: 'Set up the codebase and data layer.',
        order: 1,
        lessons: [
          { title: 'Project Setup & Architecture', type: 'video', duration: 14, videoUrl: '', content: 'Monorepo structure, env configuration, and folder conventions.', order: 1 },
          { title: 'Designing the Data Model', type: 'reading', duration: 13, videoUrl: '', content: 'Plan collections, relationships, and indexes before writing code.', order: 2 },
          { title: 'Authentication & Authorization', type: 'video', duration: 21, videoUrl: '', content: 'Access + refresh tokens, RBAC, and secure password storage.', order: 3 },
        ],
      },
      {
        title: 'Build & Deploy',
        description: 'Real-time features, testing, and deployment.',
        order: 2,
        lessons: [
          { title: 'Real-time Features with WebSockets', type: 'video', duration: 22, videoUrl: '', content: 'Push live updates to clients and handle reconnection.', order: 1 },
          { title: 'Testing & Deployment', type: 'reading', duration: 15, videoUrl: '', content: 'Write integration tests and deploy the app to production.', order: 2 },
          { title: 'MERN Capstone Quiz', type: 'quiz', duration: 10, videoUrl: '', order: 3, quiz: {
            passingScore: 60,
            questions: [
              { question: 'Why use refresh tokens?', options: [{ text: 'Faster APIs' }, { text: 'Longer-lived sessions without re-login' }, { text: 'Smaller databases' }, { text: 'They are required by HTTP' }], correctAnswer: 'Longer-lived sessions without re-login', explanation: 'Refresh tokens let the client get new access tokens without re-authenticating.' },
              { question: 'WebSockets allow:', options: [{ text: 'Server-push to clients' }, { text: 'Only client requests' }, { text: 'Static files only' }, { text: 'DNS resolution' }], correctAnswer: 'Server-push to clients', explanation: 'WebSockets enable full-duplex communication, including server push.' },
            ],
          } },
        ],
      },
    ],
  },
  {
    title: 'System Design & Interview Prep',
    description:
      'Design scalable systems and ace technical interviews with load balancing, caching, databases, and mock sessions.',
    thumbnail: IMG.courseSystemDesign,
    longDescription:
      'Learn how to approach system design interviews step by step. Cover requirements gathering, capacity estimation, load balancers, caching, CDNs, database sharding, message queues, and monitoring. Practice with real interview questions and frameworks for communicating your designs.',
    category: 'Career Development',
    technology: ['System Design', 'Architecture', 'Distributed Systems'],
    level: 'Advanced',
    price: 55,
    durationHours: 14,
    featured: false,
    whatYouWillLearn: [
      'Approach system design interviews confidently',
      'Design for scale with caches, queues, and sharding',
      'Estimate capacity and choose the right database',
      'Communicate trade-offs clearly under pressure',
    ],
    requirements: ['Basic backend experience', 'Understanding of REST APIs'],
    modules: [
      {
        title: 'Design Fundamentals',
        description: 'Building blocks of scalable systems.',
        order: 1,
        lessons: [
          { title: 'Scalability & Load Balancing', type: 'video', duration: 16, videoUrl: '', content: 'Horizontal scaling, stateless services, and load balancer strategies.', order: 1 },
          { title: 'Caching Strategies', type: 'reading', duration: 12, videoUrl: '', content: 'Cache-aside, write-through, and eviction policies like LRU.', order: 2 },
          { title: 'Databases at Scale', type: 'video', duration: 19, videoUrl: '', content: 'Replication, sharding, and SQL vs NoSQL trade-offs.', order: 3 },
        ],
      },
      {
        title: 'Interview Practice',
        description: 'Mock designs and evaluation.',
        order: 2,
        lessons: [
          { title: 'Designing a Twitter-like Feed', type: 'video', duration: 24, videoUrl: '', content: 'Walk through a full mock interview: requirements, API, storage, and scaling.', order: 1 },
          { title: 'System Design Quiz', type: 'quiz', duration: 10, videoUrl: '', order: 2, quiz: {
            passingScore: 60,
            questions: [
              { question: 'What is the main benefit of a CDN?', options: [{ text: 'Faster content delivery' }, { text: 'Stronger passwords' }, { text: 'Smaller code' }, { text: 'Cheaper DNS' }], correctAnswer: 'Faster content delivery', explanation: 'CDNs serve content from edge locations close to users, reducing latency.' },
              { question: 'Sharding means:', options: [{ text: 'Compressing data' }, { text: 'Splitting data across servers' }, { text: 'Encrypting traffic' }, { text: 'Backing up daily' }], correctAnswer: 'Splitting data across servers', explanation: 'Sharding partitions a database across multiple machines to scale horizontally.' },
            ],
          } },
        ],
      },
    ],
  },
];

const buildCompanies = (recruiterIds: string[]) => [
  { name: 'TechNova', industry: 'Software Development', size: '50-200', headquarters: 'San Francisco, CA', foundedYear: 2016, logo: IMG.compTechNova },
  { name: 'CloudPeak', industry: 'Cloud & DevOps', size: '200-500', headquarters: 'Austin, TX', foundedYear: 2014, logo: IMG.compCloudPeak },
  { name: 'CodeVerse', industry: 'Developer Tools', size: '10-50', headquarters: 'Berlin, Germany', foundedYear: 2019, logo: IMG.compCodeVerse },
  { name: 'DataDriven', industry: 'Data & Analytics', size: '200-500', headquarters: 'New York, NY', foundedYear: 2011, logo: IMG.compDataDriven },
  { name: 'InnoStack', industry: 'Fintech', size: '50-200', headquarters: 'London, UK', foundedYear: 2017, logo: IMG.compInnoStack },
  { name: 'WebSphere', industry: 'SaaS & Enterprise Software', size: '500-1000', headquarters: 'Seattle, WA', foundedYear: 2013, logo: IMG.compWebSphere },
  { name: 'PixelForge', industry: 'Digital Design & Branding', size: '10-50', headquarters: 'Toronto, Canada', foundedYear: 2018, logo: IMG.compPixelForge },
  { name: 'SecureNet', industry: 'Cybersecurity', size: '50-200', headquarters: 'Dublin, Ireland', foundedYear: 2012, logo: IMG.compSecureNet },
  { name: 'GameCraft', industry: 'Gaming & Interactive Media', size: '200-500', headquarters: 'Tokyo, Japan', foundedYear: 2010, logo: IMG.compGameCraft },
  { name: 'MobileMinds', industry: 'Mobile App Development', size: '10-50', headquarters: 'Bengaluru, India', foundedYear: 2020, logo: IMG.compMobileMinds },
];

const buildJobs = (companyIds: string[], recruiterIds: string[]) => [
  { title: 'Frontend Developer (React)', description: 'Join our product team to build delightful user interfaces for our SaaS platform. You will work closely with designers and backend engineers to ship features that users love.', responsibilities: ['Build responsive UI components with React and TypeScript', 'Collaborate with designers to implement pixel-perfect designs', 'Write tests and improve code quality', 'Optimize application performance'], requirements: ['3+ years of React experience', 'Strong TypeScript skills', 'Experience with Next.js is a plus', 'Good understanding of CSS and modern styling approaches'], skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'], salaryMin: 70000, salaryMax: 105000, location: 'Remote', jobType: 'Full-time', experienceLevel: 'Mid Level', remoteType: 'Remote', benefits: ['Health insurance', 'Stock options', 'Learning budget'] },
  { title: 'Backend Engineer (Node.js)', description: 'Design and build scalable backend services powering our platform. You will work on APIs, databases, and infrastructure.', responsibilities: ['Design and build REST APIs', 'Optimize MongoDB queries', 'Implement authentication and authorization', 'Monitor and improve service reliability'], requirements: ['3+ years of Node.js experience', 'Experience with MongoDB and Mongoose', 'Understanding of authentication and security best practices', 'Familiarity with Docker'], skills: ['Node.js', 'Express', 'MongoDB', 'Docker'], salaryMin: 80000, salaryMax: 120000, location: 'Austin, TX', jobType: 'Full-time', experienceLevel: 'Mid Level', remoteType: 'Hybrid', benefits: ['401k match', 'Remote-first culture', 'Wellness stipend'] },
  { title: 'Junior Full Stack Developer', description: 'Kickstart your career building full-stack features across our platform. Great mentorship and growth opportunities.', responsibilities: ['Build features across frontend and backend', 'Fix bugs and improve test coverage', 'Participate in code reviews'], requirements: ['1+ years of full-stack experience or strong bootcamp background', 'JavaScript, React, and Node.js fundamentals', 'Willingness to learn and grow'], skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'], salaryMin: 50000, salaryMax: 75000, location: 'Berlin, Germany', jobType: 'Internship', experienceLevel: 'Entry Level', remoteType: 'On-site', benefits: ['Mentorship program', 'Free lunch', 'Conference budget'] },
  { title: 'DevOps Engineer', description: 'Own our CI/CD pipelines, cloud infrastructure, and deployment automation.', responsibilities: ['Maintain CI/CD pipelines', 'Manage cloud infrastructure on AWS', 'Automate deployment processes', 'Improve monitoring and alerting'], requirements: ['3+ years of DevOps experience', 'Strong knowledge of AWS', 'Experience with Docker and Kubernetes'], skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform'], salaryMin: 95000, salaryMax: 140000, location: 'New York, NY', jobType: 'Full-time', experienceLevel: 'Senior Level', remoteType: 'Hybrid', benefits: ['Competitive salary', 'Health coverage', 'Remote days'] },
  { title: 'MERN Stack Developer', description: 'Build modern web applications using the MERN stack for our fintech products.', responsibilities: ['Develop features using the MERN stack', 'Integrate with payment APIs', 'Ensure high code quality'], requirements: ['2+ years MERN experience', 'Strong JavaScript and TypeScript', 'Payment integration experience a plus'], skills: ['MongoDB', 'Express', 'React', 'Node.js'], salaryMin: 65000, salaryMax: 95000, location: 'London, UK', jobType: 'Full-time', experienceLevel: 'Mid Level', remoteType: 'Remote', benefits: ['Flexible hours', 'Annual bonus', 'Training allowance'] },
  { title: 'Frontend Engineer (React)', description: 'Shape our SaaS product experience with modern React and a strong eye for design systems and performance.', responsibilities: ['Build and maintain design-system components', 'Optimize rendering and bundle performance', 'Collaborate with product and design teams'], requirements: ['4+ years of React experience', 'Experience with design systems and Storybook', 'Strong TypeScript skills'], skills: ['React', 'TypeScript', 'Design Systems', 'Vite'], salaryMin: 110000, salaryMax: 150000, location: 'Seattle, WA', jobType: 'Full-time', experienceLevel: 'Senior Level', remoteType: 'Remote', benefits: ['Generous PTO', 'Remote-first', '401k match'] },
  { title: 'UI/UX Designer', description: 'Design intuitive, beautiful product interfaces and own the end-to-end design process for client projects.', responsibilities: ['Create wireframes and high-fidelity prototypes', 'Run user research and usability tests', 'Maintain brand and design systems'], requirements: ['3+ years of product design experience', 'Proficiency with Figma', 'Strong portfolio of shipped work'], skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping'], salaryMin: 60000, salaryMax: 85000, location: 'Toronto, Canada', jobType: 'Full-time', experienceLevel: 'Mid Level', remoteType: 'Hybrid', benefits: ['Creative budget', 'Hybrid office', 'Health insurance'] },
  { title: 'Security Analyst', description: 'Protect our platform and customers by monitoring threats, running pentests, and hardening infrastructure.', responsibilities: ['Monitor and respond to security incidents', 'Conduct vulnerability assessments', 'Implement security best practices'], requirements: ['2+ years in cybersecurity', 'Experience with SIEM tools', 'Security certifications a plus'], skills: ['Cybersecurity', 'SIEM', 'Network Security', 'Penetration Testing'], salaryMin: 70000, salaryMax: 100000, location: 'Dublin, Ireland', jobType: 'Full-time', experienceLevel: 'Mid Level', remoteType: 'On-site', benefits: ['Certification budget', 'On-site gym', 'Annual bonus'] },
  { title: 'Game Developer (Unity)', description: 'Create immersive gameplay experiences for our flagship titles with Unity and C#.', responsibilities: ['Implement gameplay systems in Unity', 'Optimize performance across platforms', 'Collaborate with artists and designers'], requirements: ['3+ years Unity and C# experience', 'Shipped at least one title', 'Strong math and physics fundamentals'], skills: ['Unity', 'C#', 'Game Physics', 'Shader Programming'], salaryMin: 75000, salaryMax: 115000, location: 'Tokyo, Japan', jobType: 'Full-time', experienceLevel: 'Senior Level', remoteType: 'On-site', benefits: ['Game room', 'Relocation support', 'Annual game allowance'] },
  { title: 'Mobile Developer (React Native)', description: 'Build and scale our cross-platform mobile apps used by thousands of users worldwide.', responsibilities: ['Develop features with React Native', 'Optimize app performance and offline support', 'Ship to both iOS and Android stores'], requirements: ['2+ years React Native experience', 'Experience with app store releases', 'Strong JavaScript/TypeScript'], skills: ['React Native', 'TypeScript', 'iOS', 'Android', 'Redux'], salaryMin: 55000, salaryMax: 80000, location: 'Bengaluru, India', jobType: 'Full-time', experienceLevel: 'Mid Level', remoteType: 'Remote', benefits: ['Flexible hours', 'Health insurance', 'Learning budget'] },
];

const buildProjects = (studentId: string) => [
  { title: 'DevMatch — Developer Job Tracker', description: 'A full-stack job marketplace where developers can track applications, manage interviews, and get role-based recommendations. Built with Next.js, Express, and MongoDB.', thumbnail: IMG.projDevMatch, features: ['Kanban application tracker', 'Role-based dashboards', 'Resume builder', 'Email-style notifications'], techStack: ['Next.js', 'TypeScript', 'Express', 'MongoDB'], githubUrl: 'https://github.com/example/devmatch', liveUrl: 'https://devmatch.example.com' },
  { title: 'CourseForge LMS', description: 'A learning management system with video lessons, quizzes, progress tracking, and certificates. Features a responsive curriculum player and admin analytics.', thumbnail: IMG.projCourseForge, features: ['Curriculum player', 'Quiz engine with explanations', 'Certificate generation', 'Progress analytics'], techStack: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'], githubUrl: 'https://github.com/example/courseforge', liveUrl: 'https://courseforge.example.com' },
  { title: 'SkillSync Portfolio Hub', description: 'A portfolio platform for developers to showcase projects, manage resumes, and share their journey. Includes a live resume preview and PDF export.', thumbnail: IMG.projSkillSync, features: ['Live resume editor', 'Project showcase', 'Skill badges', 'Dark mode'], techStack: ['Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'], githubUrl: 'https://github.com/example/skillsync', liveUrl: 'https://skillsync.example.com' },
  { title: 'CodeQuiz Arena', description: 'A competitive coding quiz platform where users battle in real time across JavaScript, React, and algorithm challenges, with leaderboards and streak tracking.', thumbnail: IMG.projCodeQuiz, features: ['Real-time quiz battles', 'Global leaderboards', 'Daily challenges', 'Streak tracking'], techStack: ['Next.js', 'Socket.io', 'MongoDB', 'Redis'], githubUrl: 'https://github.com/example/codequiz', liveUrl: 'https://codequiz.example.com' },
  { title: 'TaskFlow — Kanban Board', description: 'A drag-and-drop kanban project manager with team workspaces, due dates, labels, and weekly productivity insights. Built as a PWA with offline support.', thumbnail: IMG.projTaskFlow, features: ['Drag-and-drop kanban', 'Team workspaces', 'Productivity insights', 'Offline PWA mode'], techStack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'], githubUrl: 'https://github.com/example/taskflow', liveUrl: 'https://taskflow.example.com' },
  { title: 'FitTrack — Fitness Companion', description: 'A workout and habit tracker with progress charts, custom workout plans, and community challenges. Includes Apple Health integration and dark mode.', thumbnail: IMG.projFitTrack, features: ['Workout planning', 'Progress analytics', 'Habit streaks', 'Community challenges'], techStack: ['React Native', 'TypeScript', 'Firebase', 'Recharts'], githubUrl: 'https://github.com/example/fittrack', liveUrl: 'https://fittrack.example.com' },
  { title: 'ChatWave — Realtime Chat', description: 'A real-time chat application with rooms, direct messages, typing indicators, and end-to-end encryption. Supports attachments, emojis, and message search.', thumbnail: IMG.projChatWave, features: ['Realtime messaging', 'Typing indicators', 'Message search', 'End-to-end encryption'], techStack: ['React', 'Socket.io', 'Node.js', 'MongoDB'], githubUrl: 'https://github.com/example/chatwave', liveUrl: 'https://chatwave.example.com' },
  { title: 'ShopEase — E-commerce Store', description: 'A full-featured e-commerce platform with product catalogs, cart, payments via Stripe, order tracking, and an admin dashboard for inventory management.', thumbnail: IMG.projShopEase, features: ['Product catalog & search', 'Stripe checkout', 'Order tracking', 'Admin inventory dashboard'], techStack: ['Next.js', 'Stripe', 'Prisma', 'PostgreSQL'], githubUrl: 'https://github.com/example/shopease', liveUrl: 'https://shopease.example.com' },
  { title: 'WeatherWise — Forecast App', description: 'A beautiful weather app with 7-day forecasts, hourly charts, location search, and weather alerts. Uses the OpenWeather API with geolocation support.', thumbnail: IMG.projWeatherWise, features: ['7-day forecasts', 'Hourly temperature charts', 'Location search', 'Severe weather alerts'], techStack: ['React', 'OpenWeather API', 'Chart.js', 'Tailwind CSS'], githubUrl: 'https://github.com/example/weatherwise', liveUrl: 'https://weatherwise.example.com' },
  { title: 'CodeCollab — Pair Programming', description: 'A collaborative code editor with live cursors, shared terminals, video chat, and multiplayer problem solving sessions for interview practice.', thumbnail: IMG.projCodeCollab, features: ['Live collaborative editing', 'Shared terminal', 'Video chat rooms', 'Interview practice modes'], techStack: ['React', 'WebRTC', 'CodeMirror', 'Node.js'], githubUrl: 'https://github.com/example/codecollab', liveUrl: 'https://codecollab.example.com' },
];

const ensureUniqueSlug = async (model: { findOne: (q: Record<string, unknown>) => Promise<unknown> }, text: string) => {
  const base = slugify(text);
  let slug = base;
  let i = 1;
  while (await model.findOne({ slug })) {
    i += 1;
    slug = `${base}-${i}`;
  }
  return slug;
};

const seed = async () => {
  await connectDB();

  log('🧹 Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Company.deleteMany({}),
    Course.deleteMany({}),
    Job.deleteMany({}),
    Project.deleteMany({}),
    InterviewQuestion.deleteMany({}),
    Enrollment.deleteMany({}),
    Application.deleteMany({}),
    Certificate.deleteMany({}),
    Review.deleteMany({}),
  ]);

  // Users
  const admin = await User.create({
    name: 'System Admin', email: 'admin@skillforge.dev', password: passwordHash, role: 'ADMIN', isVerified: true,
    headline: 'Platform Administrator', avatar: IMG.avAdmin,
  });

  const student1 = await User.create({
    name: 'Sojib Hasan', email: 'sojib@student.dev', password: passwordHash, role: 'STUDENT', isVerified: true,
    headline: 'Full Stack Developer in training',
    bio: 'Passionate about building full-stack applications and preparing for a career in software development.',
    location: 'Dhaka, Bangladesh',
    skills: ['JavaScript', 'React', 'Next.js', 'Node.js', 'MongoDB', 'TypeScript'],
    avatar: IMG.avSojib,
  });

  const student2 = await User.create({
    name: 'Ayesha Rahman', email: 'ayesha@student.dev', password: passwordHash, role: 'STUDENT', isVerified: true,
    headline: 'Frontend Developer', location: 'Mumbai, India',
    skills: ['React', 'TypeScript', 'Tailwind CSS'], avatar: IMG.avAyesha,
  });

  const student3 = await User.create({
    name: 'Michael Chen', email: 'michael@student.dev', password: passwordHash, role: 'STUDENT', isVerified: true,
    headline: 'Backend Engineer', location: 'Toronto, Canada',
    skills: ['Node.js', 'Express', 'MongoDB', 'AWS'], avatar: IMG.avMichael,
  });

  const recruiterAvatars = [IMG.avSarah, IMG.avDavid, IMG.avEmma, IMG.avJames, IMG.avOlivia];

  const recruiters = [];
  for (let i = 0; i < 5; i += 1) {
    const r = await User.create({
      name: `Recruiter ${['Sarah', 'David', 'Emma', 'James', 'Olivia'][i]}`,
      email: `recruiter${i + 1}@company.dev`,
      password: passwordHash, role: 'RECRUITER', isVerified: true,
      headline: 'Talent Acquisition',
      avatar: recruiterAvatars[i],
    });
    recruiters.push(r);
  }

  // Companies
  const companies = [];
  const companyData = buildCompanies(recruiters as unknown as string[]);
  for (let i = 0; i < companyData.length; i += 1) {
    const c = companyData[i];
    const slug = await ensureUniqueSlug(Company, c.name);
    const owner = recruiters[i % recruiters.length];
    const company = await Company.create({
      ...c,
      slug,
      description: `${c.name} is an innovative ${c.industry} company building world-class products. We care deeply about engineering culture, mentorship, and shipping high-quality software.`,
      website: `https://${c.name.toLowerCase()}.example.com`,
      verified: i < 8,
      owner: owner._id,
      email: `jobs@${c.name.toLowerCase()}.example.com`,
      socialLinks: { linkedin: 'https://linkedin.com/company/' + c.name.toLowerCase(), twitter: 'https://twitter.com/' + c.name.toLowerCase() },
    });
    companies.push(company);
    await User.findByIdAndUpdate(owner._id, { company: company._id });
  }

  // Courses
  const instructor = await User.create({
    name: 'Anik Islam', email: 'anik@instructor.dev', password: passwordHash, role: 'ADMIN', isVerified: true,
    headline: 'Senior Full Stack Engineer & Educator', avatar: IMG.avAnik,
  });

  const courseData = buildCourses(String(instructor._id));
  const courseVideos = [
    VIDEO.sintel,
    VIDEO.bunny,
    VIDEO.movie300,
    VIDEO.bigBunnyClip,
    VIDEO.flower,
    VIDEO.sample640,
    VIDEO.sample5s,
    VIDEO.bigBunny10s,
  ];
  const createdCourses = [];
  let videoIndex = 0;
  for (const c of courseData) {
    const slug = await ensureUniqueSlug(Course, c.title);
    for (const m of c.modules) {
      for (const l of m.lessons) {
        if (l.type === 'video') {
          l.videoUrl = courseVideos[videoIndex % courseVideos.length];
          videoIndex += 1;
        }
      }
    }
    const course = await Course.create({
      ...c,
      slug,
      instructor: instructor._id,
      technology: c.technology,
      whatYouWillLearn: c.whatYouWillLearn,
      requirements: c.requirements,
      modules: c.modules,
      studentsEnrolled: [1200, 3400, 2100, 980, 2500, 1500, 3200, 1100, 850, 1750][courseData.indexOf(c)],
      rating: [4.8, 4.7, 4.9, 4.6, 4.8, 4.5, 4.9, 4.7, 4.9, 4.6][courseData.indexOf(c)],
      ratingCount: [300, 850, 420, 210, 510, 260, 640, 180, 340, 220][courseData.indexOf(c)],
    });
    createdCourses.push(course);
  }

  // Jobs
  const jobData = buildJobs([], []);
  for (let i = 0; i < jobData.length; i += 1) {
    const j = jobData[i];
    const slug = await ensureUniqueSlug(Job, j.title);
    await Job.create({
      ...j,
      slug,
      company: companies[i % companies.length]._id,
      recruiter: recruiters[i % recruiters.length]._id,
      status: 'published',
      applicationsCount: [15, 22, 8, 6, 12, 10, 18, 9, 7, 14][i],
      deadline: new Date(Date.now() + 30 * 86400000),
    });
  }

  // Projects
  const projectData = buildProjects(String(student1._id));
  const projectStats = [
    [128, 2300],
    [96, 1800],
    [150, 2900],
    [110, 2100],
    [88, 1600],
    [135, 2500],
    [175, 3100],
    [92, 1900],
    [140, 2700],
    [121, 2400],
  ];
  for (let i = 0; i < projectData.length; i += 1) {
    const p = projectData[i];
    await Project.create({
      ...p,
      author: student1._id,
      published: true,
      likes: projectStats[i][0],
      views: projectStats[i][1],
    });
  }

  // Interview questions
  await InterviewQuestion.insertMany(buildInterviewQuestions());

  // Enrollments
  const course1 = createdCourses[0];
  const lessonEntries = (course1.modules || []).flatMap((m) =>
    (m.lessons || []).map((l) => ({
      lessonId: (l as unknown as { _id: string })._id,
      moduleId: (m as unknown as { _id: string })._id,
      completed: true,
      completedAt: new Date(),
    })),
  );
  const enrollment = await Enrollment.create({
    user: student1._id,
    course: course1._id,
    progress: lessonEntries,
    percentComplete: 78,
    currentLessonId: (course1.modules?.[0]?.lessons?.[2] as unknown as { _id?: string })?._id,
  });

  const course2 = createdCourses[1];
  const lessonEntries2 = (course2.modules || []).flatMap((m) =>
    (m.lessons || []).map((l, i) => ({
      lessonId: (l as unknown as { _id: string })._id,
      moduleId: (m as unknown as { _id: string })._id,
      completed: i < 3,
      completedAt: i < 3 ? new Date() : undefined,
    })),
  );
  await Enrollment.create({
    user: student1._id,
    course: course2._id,
    progress: lessonEntries2,
    percentComplete: 45,
    currentLessonId: (course2.modules?.[0]?.lessons?.[3] as unknown as { _id?: string })?._id,
  });

  // Applications
  const publishedJobs = await Job.find({ status: 'published' });
  const jobA = publishedJobs[0];
  const jobB = publishedJobs[1];
  if (jobA) {
    await Application.create({
      job: jobA._id,
      student: student1._id,
      coverLetter: 'I am a passionate full-stack developer who has built several production-ready applications and I am excited about the opportunity to contribute to your team.',
      expectedSalary: 75000,
      availability: 'Immediately',
      status: 'Applied',
      statusHistory: [{ status: 'Applied', note: 'Application submitted', changedAt: new Date() }],
    });
  }
  if (jobB) {
    const app = await Application.create({
      job: jobB._id,
      student: student1._id,
      coverLetter: 'With strong Node.js skills and experience building scalable APIs, I am confident I can add value from day one.',
      expectedSalary: 85000,
      availability: '2 weeks',
      status: 'Interview',
      statusHistory: [
        { status: 'Applied', note: 'Application submitted', changedAt: new Date(Date.now() - 10 * 86400000) },
        { status: 'Shortlisted', note: 'Strong skill match', changedAt: new Date(Date.now() - 6 * 86400000) },
        { status: 'Interview', note: 'Technical interview scheduled', changedAt: new Date(Date.now() - 2 * 86400000) },
      ],
    });
    await Application.findByIdAndUpdate(app._id, {
      interview: (await (await import('./models')).Interview.create({
        application: app._id, job: jobB._id, student: student1._id, recruiter: recruiters[1]._id,
        type: 'Technical', scheduledAt: new Date(Date.now() + 3 * 86400000), durationMinutes: 60,
        meetingLink: 'https://meet.google.com/skillforge-interview',
        notes: 'Focus on Node.js and MongoDB.', status: 'scheduled',
      }))._id,
    });
  }

  // Reviews
  await Review.create({
    user: student2._id,
    targetType: 'course',
    targetId: course1._id,
    rating: 5,
    title: 'Amazing course!',
    comment: 'The curriculum is well structured and the projects are exactly what real companies expect. Highly recommended!',
  });

  log(`✅ Seed complete!`);
  log(`Admin:      admin@skillforge.dev / password123`);
  log(`Student:    sojib@student.dev / password123`);
  log(`Recruiter:  recruiter1@company.dev / password123`);
};

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
