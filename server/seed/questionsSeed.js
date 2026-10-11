/**
 * server/seed/questionsSeed.js — HireMind AI
 * Complete Role-Based, Technology-Specific Question Bank.
 *
 * Covers 7 Primary Roles & Granular Technology Stacks:
 * 1. Full Stack Developer (MERN, MEAN, PERN, Spring Boot + React, Python + React, SQL/NoSQL)
 * 2. Frontend Developer (HTML, CSS, JavaScript, TypeScript, React, Angular, Vue, Next.js, Tailwind, Bootstrap, Sass, Tools)
 * 3. Backend Developer (Node.js, Express, NestJS, Python, FastAPI, Django, Flask, Java, Spring Boot, C++, STL, C#, ASP.NET Core, DBs)
 * 4. AI / ML Engineer (Python, Scikit-learn, PyTorch, TensorFlow, ML, Deep Learning, NLP, CV, GenAI, LLMs, RAG, Agents, Vector DBs)
 * 5. Data Scientist (Python, SQL, Pandas, NumPy, Scikit-learn, Statistics, Probability, ML, EDA, A/B Testing)
 * 6. Data Analyst (SQL, Excel, Power BI, DAX, Tableau, Python, Pandas, Statistics, BI Dashboards, KPIs)
 * 7. HR / Behavioral Interview (Self Intro, Strengths/Weaknesses, STAR, Leadership, Conflict, Ownership, Situational, Goals)
 *
 * Idempotent seeder: running repeatedly upserts questions safely without duplicating.
 */

const mongoose = require('mongoose');
const dotenv   = require('dotenv');
const Question = require('../models/Question');

dotenv.config({ path: __dirname + '/../.env' });

const SEED_QUESTIONS = [
  // ═════════════════════════════════════════════════════════════════════════
  // 1. FRONTEND DEVELOPER
  // ═════════════════════════════════════════════════════════════════════════
  // --- HTML / CSS / JavaScript (Core Fundamentals) ---
  {
    role: 'frontend',
    technology: 'html',
    tags: ['html', 'core_web', 'accessibility', 'semantic_html'],
    topic: 'Semantic HTML & Accessibility',
    difficulty: 'easy',
    type: 'open_ended',
    question: 'Why is semantic HTML important for modern web applications, and how does it affect SEO and accessibility (ARIA)?',
    referenceAnswer: 'Semantic HTML tags (<main>, <nav>, <article>, <section>, <header>, <footer>) provide clear structural meaning to both browsers and assistive screen readers. They create a clean accessibility tree, allow screen readers to navigate via landmark roles without excessive ARIA overrides, and help search engine crawlers parse content hierarchy efficiently.',
    keyConcepts: ['semantic tags', 'accessibility tree', 'screen readers', 'SEO hierarchy', 'ARIA landmarks'],
    rubric: [
      { criteria: 'Mentions specific semantic elements (<header>, <nav>, <main>, etc.)', weight: 3 },
      { criteria: 'Explains accessibility and screen reader navigation benefits', weight: 4 },
      { criteria: 'Discusses SEO indexing and page structure parsing', weight: 3 },
    ],
    followUpQuestions: ['When should you use native HTML elements vs custom ARIA roles?'],
  },
  {
    role: 'frontend',
    technology: 'css',
    tags: ['css', 'layout', 'flexbox', 'grid', 'responsive'],
    topic: 'CSS Box Model & Layouts (Flexbox vs Grid)',
    difficulty: 'easy',
    type: 'open_ended',
    question: 'Explain the CSS Box Model (margin, border, padding, content) and when to use CSS Flexbox versus CSS Grid.',
    referenceAnswer: 'The CSS Box Model consists of content, padding, border, and margin. Setting box-sizing: border-box ensures padding and border are included in total width/height. Flexbox is 1-dimensional (row or column layout, ideal for navbars, alignment, and linear components), while CSS Grid is 2-dimensional (rows and columns simultaneously, ideal for whole page layouts and complex tile structures).',
    keyConcepts: ['Box Model', 'box-sizing: border-box', 'Flexbox (1D)', 'CSS Grid (2D)', 'axis alignment'],
    rubric: [
      { criteria: 'Accurately defines the 4 layers of the Box Model and box-sizing', weight: 4 },
      { criteria: 'Distinguishes 1D (Flexbox) vs 2D (Grid) layout models', weight: 4 },
      { criteria: 'Provides practical use cases for both Flexbox and Grid', weight: 2 },
    ],
    followUpQuestions: ['How does subgrid in CSS Grid enhance nested component styling?'],
  },
  {
    role: 'frontend',
    technology: 'javascript',
    tags: ['javascript', 'js_fundamentals', 'closures', 'scoping'],
    topic: 'JavaScript Closures & Lexical Scope',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'What is a JavaScript closure? How does lexical scoping enable closures, and what are practical real-world use cases?',
    referenceAnswer: 'A closure is a function bundled together with references to its surrounding lexical state (outer lexical scope), allowing inner functions to access variables from an outer function even after the outer function has executed and returned. Real-world use cases include data privacy / encapsulation (private variables), function factories, memoization, and partial application / currying.',
    keyConcepts: ['closure', 'lexical scope', 'execution context', 'data privacy', 'memoization', 'function factory'],
    rubric: [
      { criteria: 'Accurately defines closure retaining outer scope references', weight: 4 },
      { criteria: 'Explains lexical environment and execution context lifecycle', weight: 3 },
      { criteria: 'Gives concrete practical use cases (encapsulation, currying, handlers)', weight: 3 },
    ],
    followUpQuestions: ['How can improper use of closures cause memory leaks in single-page apps?'],
  },
  {
    role: 'frontend',
    technology: 'javascript',
    tags: ['javascript', 'async', 'promises', 'event_loop'],
    topic: 'JavaScript Asynchronous Programming & Event Loop',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'Explain how the JavaScript Event Loop handles the Call Stack, Microtask Queue (Promises), and Macrotask Queue (setTimeout/DOM events).',
    referenceAnswer: 'JavaScript runs single-threaded with a Call Stack. When asynchronous operations trigger, callbacks are pushed to either the Microtask Queue (Promises, queueMicrotask, MutationObserver) or Macrotask Queue (setTimeout, setInterval, I/O, UI rendering). When the Call Stack empties, the Event Loop drains all pending microtasks before processing the next macrotask.',
    keyConcepts: ['Call Stack', 'Microtask Queue', 'Macrotask Queue', 'Event Loop', 'Promises', 'setTimeout'],
    rubric: [
      { criteria: 'Explains single-threaded call stack execution', weight: 3 },
      { criteria: 'Differentiates microtasks vs macrotasks priority order', weight: 4 },
      { criteria: 'Walks through execution order of Promise.resolve() vs setTimeout()', weight: 3 },
    ],
    followUpQuestions: ['What happens if a microtask recursively enqueues more microtasks?'],
  },

  // --- CSS Frameworks (Tailwind CSS, Bootstrap, Sass) ---
  {
    role: 'frontend',
    technology: 'tailwind',
    tags: ['tailwind', 'css', 'utility_first', 'responsive_design'],
    topic: 'Tailwind CSS Utility-First Architecture',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'What are the advantages and tradeoffs of Tailwind CSS utility-first approach compared to traditional BEM or CSS Modules? How does JIT compilation work?',
    referenceAnswer: 'Tailwind CSS provides low-level utility classes directly in markup, eliminating context-switching between HTML and CSS files, ensuring consistent design tokens (colors, spacing), and stopping CSS bundle bloat since unused styles are purged. Tailwind JIT (Just-In-Time) compiler scans template files on demand and compiles only the exact CSS rules utilized.',
    keyConcepts: ['utility-first', 'JIT compiler', 'purging unused CSS', 'design tokens', 'component composition', 'BEM comparison'],
    rubric: [
      { criteria: 'Explains utility-first philosophy vs semantic CSS classes', weight: 4 },
      { criteria: 'Describes JIT compilation and bundle size optimization', weight: 3 },
      { criteria: 'Addresses component maintainability via @apply or component extraction', weight: 3 },
    ],
    followUpQuestions: ['How do you manage arbitrary values and dark mode variants in Tailwind CSS?'],
  },
  {
    role: 'frontend',
    technology: 'bootstrap',
    tags: ['bootstrap', 'css', 'responsive', 'grid_system'],
    topic: 'Bootstrap Grid System & Component Architecture',
    difficulty: 'easy',
    type: 'open_ended',
    question: 'How does the Bootstrap 12-column grid system work with breakpoints (xs, sm, md, lg, xl, xxl), and how do container, row, and col classes interact?',
    referenceAnswer: 'Bootstrap utilizes a 12-column flexbox grid. .container or .container-fluid provides max-width and horizontal padding. .row uses negative margins to offset container padding and aligns columns. .col-{breakpoint}-{number} defines how many of the 12 columns an element spans at specified viewport breakpoints (e.g. col-md-6 takes 50% width on medium screens and up).',
    keyConcepts: ['12-column grid', 'breakpoints', 'container', 'row', 'col', 'flexbox gutters'],
    rubric: [
      { criteria: 'Explains 12-column mathematical subdivision', weight: 4 },
      { criteria: 'Describes container, row, and column hierarchy', weight: 3 },
      { criteria: 'Explains responsive breakpoint inheritance from mobile to desktop', weight: 3 },
    ],
    followUpQuestions: ['How do Bootstrap utility classes complement component styling?'],
  },

  // --- TypeScript ---
  {
    role: 'frontend',
    technology: 'typescript',
    tags: ['typescript', 'generics', 'type_system', 'interfaces'],
    topic: 'TypeScript Advanced Types & Generics',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'Explain the difference between TypeScript Interfaces and Type Aliases. When should you use Generics, and what is the keyof / Record operator?',
    referenceAnswer: 'Interfaces support declaration merging and are optimal for defining object shapes and public API contracts. Type aliases are more flexible, supporting union types, primitives, and mapped types. Generics (<T>) allow writing reusable, type-safe components and functions without losing type specificity. keyof produces a union of string literal property names; Record<K, T> maps keys K to values of type T.',
    keyConcepts: ['interface vs type', 'declaration merging', 'Generics <T>', 'keyof', 'utility types (Record, Partial, Pick)'],
    rubric: [
      { criteria: 'Distinguishes Interfaces vs Type Aliases including declaration merging', weight: 4 },
      { criteria: 'Explains Generics and type parameterization', weight: 3 },
      { criteria: 'Demonstrates understanding of keyof and Record / Mapped types', weight: 3 },
    ],
    followUpQuestions: ['What are conditional types (T extends U ? X : Y) and infer keyword in TypeScript?'],
  },

  // --- React ---
  {
    role: 'frontend',
    technology: 'react',
    tags: ['react', 'hooks', 'virtual_dom', 'performance'],
    topic: 'React Virtual DOM, Reconciliation & Hooks',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'How does React Virtual DOM and the Fiber reconciliation algorithm work? Why are keys critical in list rendering?',
    referenceAnswer: 'React maintains an in-memory Virtual DOM tree representation. When state changes, React constructs a new Virtual DOM tree and diffs it against the current tree using the Fiber reconciler. It uses heuristics: two elements of different types produce different trees, and list items with unique "key" props allow React to identify inserted, reordered, or deleted items in O(n) time rather than re-rendering every child from scratch.',
    keyConcepts: ['Virtual DOM', 'Fiber reconciler', 'diffing algorithm', 'list keys', 're-rendering optimization'],
    rubric: [
      { criteria: 'Explains Virtual DOM diffing against real DOM', weight: 4 },
      { criteria: 'Explains the role of stable keys in list reconciliation', weight: 3 },
      { criteria: 'Mentions Fiber incremental rendering or priority scheduling', weight: 3 },
    ],
    followUpQuestions: ['How do useMemo and useCallback prevent unnecessary child re-renders?'],
  },
  {
    role: 'frontend',
    technology: 'react',
    tags: ['react', 'state_management', 'context_api', 'redux'],
    topic: 'React State Management & Custom Hooks',
    difficulty: 'hard',
    type: 'open_ended',
    question: 'Compare React Context API with dedicated state managers (Redux Toolkit / Zustand) for large applications. How do you prevent unnecessary consumer re-renders?',
    referenceAnswer: 'Context API is built for low-frequency global updates (theme, user auth) because any update triggers re-renders across all consuming components unless carefully split into multiple granular contexts. Redux Toolkit and Zustand use selector-based subscriptions where components only re-render if the exact selected slice changes. Splitting contexts, memoizing provider values, and using custom hooks mitigate Context re-render cascades.',
    keyConcepts: ['Context API', 'Zustand / Redux Toolkit', 'selector subscriptions', 'context splitting', 're-render prevention'],
    rubric: [
      { criteria: 'Analyzes re-render propagation differences between Context and Zustand/Redux', weight: 4 },
      { criteria: 'Explains selector-based subscriptions and fine-grained reactivity', weight: 3 },
      { criteria: 'Provides practical strategies for isolating state updates', weight: 3 },
    ],
    followUpQuestions: ['How does React 19 / Server Components change client-side state architecture?'],
  },

  // --- Angular ---
  {
    role: 'frontend',
    technology: 'angular',
    tags: ['angular', 'typescript', 'dependency_injection', 'rxjs'],
    topic: 'Angular Architecture: Components, DI & RxJS',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'Explain Angular core building blocks: Components, Services, Dependency Injection (DI) hierarchical injectors, and RxJS Observables in Angular forms.',
    referenceAnswer: 'Angular is a full TypeScript framework. Components handle UI template rendering and logic; Services encapsulate business logic. Angular hierarchical DI allows configuring singleton services at root or instance-scoped services at component level. RxJS Observables power reactive forms (valueChanges), HTTP client streams, and async pipes, enabling declarative, non-blocking asynchronous data handling.',
    keyConcepts: ['Angular Components', 'Services', 'Hierarchical DI', 'RxJS Observables', 'Async Pipe', 'Reactive Forms'],
    rubric: [
      { criteria: 'Explains role of Components and Services with TypeScript decorators', weight: 3 },
      { criteria: 'Describes hierarchical dependency injection lifecycle', weight: 4 },
      { criteria: 'Explains RxJS Observables and subscription cleanup / async pipe', weight: 3 },
    ],
    followUpQuestions: ['What is the difference between OnPush change detection and Default change detection in Angular?'],
  },

  // --- Vue.js ---
  {
    role: 'frontend',
    technology: 'vue',
    tags: ['vue', 'reactivity', 'composition_api', 'pinia'],
    topic: 'Vue 3 Composition API & Reactivity System',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'How does Vue 3 Reactivity system work under the hood using JavaScript Proxies (ref and reactive)? How does the Composition API improve code organization?',
    referenceAnswer: 'Vue 3 uses ES6 Proxies to intercept get and set operations on objects. Accessing a property tracks the active effect (getter / track), and modifying it triggers all dependent effects (setter / trigger). ref wraps primitive values into reactive objects with a .value property. The Composition API (setup / script setup) allows grouping related logic into composable functions rather than fragmenting code across Options API blocks.',
    keyConcepts: ['ES6 Proxy', 'ref vs reactive', 'track and trigger', 'Composition API', 'Composables', 'Pinia'],
    rubric: [
      { criteria: 'Explains ES6 Proxy interception mechanism (track/trigger)', weight: 4 },
      { criteria: 'Distinguishes ref for primitives vs reactive for objects', weight: 3 },
      { criteria: 'Compares Composition API organization with Options API', weight: 3 },
    ],
    followUpQuestions: ['What are Vue computed properties and how are they cached?'],
  },

  // --- Next.js ---
  {
    role: 'frontend',
    technology: 'nextjs',
    tags: ['nextjs', 'ssr', 'ssg', 'server_components', 'seo'],
    topic: 'Next.js Rendering Strategies: SSR, SSG, ISR & Server Components',
    difficulty: 'hard',
    type: 'open_ended',
    question: 'Compare Server-Side Rendering (SSR), Static Site Generation (SSG), Incremental Static Regeneration (ISR), and React Server Components (RSC) in Next.js App Router.',
    referenceAnswer: 'SSG generates static HTML at build time for maximum speed and caching. SSR renders HTML dynamically per request for personalized user data. ISR serves cached static pages while regenerating them in the background upon cache expiry. React Server Components execute exclusively on the server, streaming HTML to the client without sending component JS bundles, reducing client bundle size and enabling direct database/API fetching.',
    keyConcepts: ['SSR', 'SSG', 'ISR', 'React Server Components (RSC)', 'App Router', 'Client Components ("use client")'],
    rubric: [
      { criteria: 'Defines and compares SSG, SSR, and ISR with caching lifecycles', weight: 4 },
      { criteria: 'Explains Server Components vs Client Components bundle boundary', weight: 4 },
      { criteria: 'Highlights performance and SEO advantages', weight: 2 },
    ],
    followUpQuestions: ['How does dynamic routing and parallel routes work in Next.js App Router?'],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 2. BACKEND DEVELOPER
  // ═════════════════════════════════════════════════════════════════════════
  // --- Node.js & Express / NestJS ---
  {
    role: 'backend',
    technology: 'nodejs',
    tags: ['nodejs', 'javascript', 'event_loop', 'streams', 'concurrency'],
    topic: 'Node.js Event Loop, Streams & Backpressure',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'Explain how the Node.js Event Loop phases work (timers, pending callbacks, poll, check, close), and how to handle stream backpressure when piping large files.',
    referenceAnswer: 'Node.js uses libuv to handle async I/O. The Event Loop rotates through phases: Timers (setTimeout/setInterval) -> Pending callbacks (I/O errors) -> Poll (incoming connections/data) -> Check (setImmediate) -> Close callbacks. Stream backpressure occurs when data is read faster than the write stream can drain. Piping (readStream.pipe(writeStream)) or checking writeStream.write() === false and listening for "drain" events prevents memory spikes.',
    keyConcepts: ['libuv', 'Event Loop phases', 'setImmediate vs setTimeout', 'Streams', 'Backpressure', 'drain event'],
    rubric: [
      { criteria: 'Outlines libuv Event Loop phases and their execution order', weight: 4 },
      { criteria: 'Defines stream backpressure and memory overflow risks', weight: 3 },
      { criteria: 'Explains pipe() mechanism and write/drain events', weight: 3 },
    ],
    followUpQuestions: ['When should you use Node.js Worker Threads instead of the Event Loop?'],
  },
  {
    role: 'backend',
    technology: 'expressjs',
    tags: ['expressjs', 'nodejs', 'middleware', 'error_handling', 'rest_apis'],
    topic: 'Express.js Middleware Pipeline & Error Handling',
    difficulty: 'easy',
    type: 'open_ended',
    question: 'How does the Express.js middleware pipeline work? How do you construct centralized error-handling middleware with 4 arguments (err, req, res, next)?',
    referenceAnswer: 'Express middleware functions execute sequentially in the order registered via app.use(). Each function receives req, res, and next. Calling next() passes execution down the chain; calling next(err) skips remaining regular middleware and directly invokes the error-handling middleware. An error middleware MUST define 4 arguments (err, req, res, next) so Express detects its arity and catches unhandled exceptions.',
    keyConcepts: ['middleware pipeline', 'next()', 'next(err)', '4-argument error handler', 'centralized logging'],
    rubric: [
      { criteria: 'Explains sequential execution of request-response pipeline', weight: 4 },
      { criteria: 'Details the 4-argument signature of error handlers', weight: 4 },
      { criteria: 'Discusses handling async errors with express-async-errors or try/catch', weight: 2 },
    ],
    followUpQuestions: ['How do you implement route-level authentication middleware in Express?'],
  },
  {
    role: 'backend',
    technology: 'nestjs',
    tags: ['nestjs', 'typescript', 'dependency_injection', 'decorators'],
    topic: 'NestJS Modules, Controllers, Providers & Dependency Injection',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'Explain how NestJS utilizes TypeScript decorators, Modules, Controllers, and Providers with its built-in Inversion of Control (IoC) container.',
    referenceAnswer: 'NestJS is an enterprise TypeScript framework built on top of Express or Fastify. @Module groups related controllers and providers into cohesive boundaries. @Controller handles incoming HTTP routes and returns responses. @Injectable() marks classes as Providers (services, repositories). The NestJS IoC container instantiates and resolves dependencies automatically through constructor parameter type reflection.',
    keyConcepts: ['NestJS', 'Modules', 'Controllers', 'Providers', '@Injectable()', 'Inversion of Control (IoC)'],
    rubric: [
      { criteria: 'Explains the roles of Modules, Controllers, and Services', weight: 4 },
      { criteria: 'Describes IoC container and constructor injection', weight: 4 },
      { criteria: 'Mentions Guards, Interceptors, or Pipes for cross-cutting concerns', weight: 2 },
    ],
    followUpQuestions: ['How do NestJS Guards differ from Interceptors and Middleware?'],
  },

  // --- Python (FastAPI / Django / Flask) ---
  {
    role: 'backend',
    technology: 'fastapi',
    tags: ['fastapi', 'python', 'pydantic', 'asyncio', 'openapi'],
    topic: 'FastAPI Asynchronous Architecture & Pydantic Validation',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'Why is FastAPI high-performance compared to traditional synchronous Python frameworks? How does Pydantic provide automatic request validation and OpenAPI documentation?',
    referenceAnswer: 'FastAPI is built on Starlette and ASGI (Asynchronous Server Gateway Interface), utilizing Python asyncio for non-blocking I/O handling on event loops (uvicorn). Pydantic models define schemas using standard Python type hints. When a request arrives, Pydantic automatically parses headers, query params, and JSON bodies, validates types/constraints, returns 422 Unprocessable Entity on validation failure, and auto-generates interactive Swagger/OpenAPI docs.',
    keyConcepts: ['FastAPI', 'ASGI / Uvicorn', 'asyncio', 'Pydantic schemas', 'type hints', 'automatic OpenAPI / Swagger'],
    rubric: [
      { criteria: 'Explains ASGI asynchronous execution vs WSGI synchronous execution', weight: 4 },
      { criteria: 'Details Pydantic validation workflow and type checking', weight: 4 },
      { criteria: 'Highlights auto-generated Swagger UI and OpenAPI specifications', weight: 2 },
    ],
    followUpQuestions: ['How do FastAPI dependency injection (Depends) and background tasks work?'],
  },
  {
    role: 'backend',
    technology: 'django',
    tags: ['django', 'python', 'orm', 'migrations', 'mvt'],
    topic: 'Django MVT Architecture, ORM & Migration Lifecycle',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'Explain Django MVT (Model-View-Template) pattern and how Django ORM manages database migrations, query lazy evaluation, and select_related vs prefetch_related.',
    referenceAnswer: 'In Django MVT, Model defines data schemas, View handles business logic, and Template/DRF Serializer handles presentation. Django ORM generates Python migration scripts tracking schema diffs. QuerySets are lazily evaluated (executed only when iterated or sliced). To avoid N+1 query problems, select_related performs SQL INNER/LEFT JOIN for single-valued relationships (ForeignKey, OneToOne), while prefetch_related performs a separate query in Python for multi-valued relationships (ManyToMany).',
    keyConcepts: ['Django MVT', 'Django ORM', 'makemigrations & migrate', 'lazy QuerySets', 'select_related (JOIN)', 'prefetch_related (N+1 fix)'],
    rubric: [
      { criteria: 'Accurately outlines Model-View-Template responsibilities', weight: 3 },
      { criteria: 'Explains lazy QuerySet evaluation and migration lifecycle', weight: 3 },
      { criteria: 'Accurately distinguishes select_related vs prefetch_related for query optimization', weight: 4 },
    ],
    followUpQuestions: ['How does Django middleware handle authentication, CSRF, and session cookies?'],
  },

  // --- Java & Spring Boot ---
  {
    role: 'backend',
    technology: 'spring_boot',
    tags: ['spring_boot', 'java', 'dependency_injection', 'jpa', 'microservices'],
    topic: 'Spring Boot Dependency Injection, Annotations & JPA',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'How does Spring Boot simplify Spring configuration with auto-configuration and starter dependencies? Explain Inversion of Control (IoC), @Autowired, and Spring Data JPA.',
    referenceAnswer: 'Spring Boot eliminates XML and boilerplate through @SpringBootApplication, starter POMs, and @EnableAutoConfiguration which registers beans based on classpath dependencies. IoC delegates object lifecycle and dependency management to the Spring ApplicationContext. @Autowired injects dependent beans. Spring Data JPA generates SQL queries automatically from method signatures (e.g., findByEmail) and provides Hibernate ORM transaction management with @Transactional.',
    keyConcepts: ['Auto-configuration', 'Spring ApplicationContext', 'Inversion of Control (IoC)', '@Autowired / Constructor Injection', 'Spring Data JPA', '@Transactional'],
    rubric: [
      { criteria: 'Explains auto-configuration and Spring Boot starters', weight: 3 },
      { criteria: 'Defines IoC container and bean lifecycle injection', weight: 4 },
      { criteria: 'Explains Spring Data JPA repository abstractions and transactions', weight: 3 },
    ],
    followUpQuestions: ['Why is constructor injection preferred over field injection with @Autowired?'],
  },
  {
    role: 'backend',
    technology: 'java',
    tags: ['java', 'jvm', 'multithreading', 'concurrency', 'memory_management'],
    topic: 'Java Concurrency & JVM Memory Model',
    difficulty: 'hard',
    type: 'open_ended',
    question: 'Explain JVM memory structure (Heap, Stack, Metaspace) and how Java manages concurrency with synchronized blocks, ReentrantLock, and Virtual Threads (Java 21).',
    referenceAnswer: 'JVM separates memory into Thread Stacks (primitive variables, frame calls) and Heap (object instances shared across threads), with class definitions in Metaspace. Java concurrency uses synchronized (intrinsic object monitors) or ReentrantLock for explicit locking, fairness, and timeouts. Java 21 introduces Virtual Threads (Project Loom), lightweight user-mode threads managed by the JVM rather than OS kernel threads, allowing millions of concurrent tasks with minimal memory overhead.',
    keyConcepts: ['JVM Heap vs Stack', 'Metaspace', 'synchronized monitor', 'ReentrantLock', 'Virtual Threads (Project Loom)', 'Garbage Collection (G1GC)'],
    rubric: [
      { criteria: 'Breaks down JVM memory partitioning and thread safety boundaries', weight: 4 },
      { criteria: 'Compares synchronized vs ReentrantLock mechanisms', weight: 3 },
      { criteria: 'Explains Virtual Threads / Project Loom high-throughput concurrency', weight: 3 },
    ],
    followUpQuestions: ['How does volatile keyword prevent instruction reordering and ensure thread visibility?'],
  },

  // --- C++ Backend & Fundamentals ---
  {
    role: 'backend',
    technology: 'cpp',
    tags: ['cpp', 'pointers', 'memory_management', 'raii', 'stl'],
    topic: 'Modern C++ Memory Management, RAII & Smart Pointers',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'What is RAII (Resource Acquisition Is Initialization) in C++? Explain the differences and ownership semantics of std::unique_ptr, std::shared_ptr, and std::weak_ptr.',
    referenceAnswer: 'RAII binds resource lifecycle (heap memory, file handles, mutex locks) to object lifetime: resources are acquired in constructors and released automatically in destructors when leaving scope. std::unique_ptr enforces exclusive ownership and cannot be copied, only moved. std::shared_ptr uses reference counting for shared ownership. std::weak_ptr provides a non-owning reference to break circular reference cycles that cause memory leaks.',
    keyConcepts: ['RAII', 'std::unique_ptr (exclusive)', 'std::shared_ptr (reference counting)', 'std::weak_ptr (cyclic ref fix)', 'move semantics'],
    rubric: [
      { criteria: 'Defines RAII and deterministic resource destruction', weight: 4 },
      { criteria: 'Distinguishes unique_ptr vs shared_ptr ownership semantics', weight: 4 },
      { criteria: 'Explains how weak_ptr resolves shared_ptr cyclic references', weight: 2 },
    ],
    followUpQuestions: ['How do move semantics (std::move and rvalue references &&) eliminate expensive deep copies?'],
  },
  {
    role: 'backend',
    technology: 'cpp',
    tags: ['cpp', 'stl', 'concurrency', 'networking', 'templates'],
    topic: 'C++ STL Containers, Concurrency & High-Performance Sockets',
    difficulty: 'hard',
    type: 'open_ended',
    question: 'How do you architect a high-throughput backend network server in C++ using non-blocking sockets and epoll (I/O multiplexing)?',
    referenceAnswer: 'A high-performance C++ server creates non-blocking sockets (fcntl with O_NONBLOCK) and registers file descriptors with an epoll instance (epoll_create1, epoll_ctl) in Edge-Triggered (EPOLLET) mode. A worker thread pool or event loop (Reactor pattern) calls epoll_wait to process readiness notifications, reading data into circular buffers until EAGAIN/EWOULDBLOCK, avoiding thread-per-connection overhead.',
    keyConcepts: ['non-blocking I/O', 'epoll (edge-triggered)', 'Reactor pattern', 'thread pool', 'EAGAIN handling', 'lock-free queues'],
    rubric: [
      { criteria: 'Explains non-blocking socket configuration and epoll mechanics', weight: 4 },
      { criteria: 'Details Reactor pattern or worker thread event loop architecture', weight: 4 },
      { criteria: 'Addresses edge-triggered data draining and concurrency synchronization', weight: 2 },
    ],
    followUpQuestions: ['What are atomic memory orders (std::memory_order_acquire/release) in C++?'],
  },

  // --- Databases (PostgreSQL, MySQL, MongoDB, Redis) ---
  {
    role: 'backend',
    technology: 'postgresql',
    tags: ['postgresql', 'sql', 'acid', 'indexing', 'transactions'],
    topic: 'PostgreSQL ACID Guarantees, Indexing & Query Optimization',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'Explain ACID transaction properties in PostgreSQL and how B-Tree vs GIN indexes work. How do you analyze slow queries using EXPLAIN ANALYZE?',
    referenceAnswer: 'ACID guarantees Atomicity (all or nothing), Consistency (schema constraints), Isolation (MVCC multi-version concurrency control), and Durability (Write-Ahead Logging / WAL). B-Tree indexes are standard for scalar comparisons (<, <=, =, >=). GIN (Generalized Inverted Index) indexes are designed for composite data, JSONB documents, and full-text search. EXPLAIN ANALYZE executes the query and outputs actual execution times, node types (Seq Scan vs Index Scan), and row estimation accuracy.',
    keyConcepts: ['ACID', 'MVCC', 'WAL (Write-Ahead Log)', 'B-Tree vs GIN Index', 'EXPLAIN ANALYZE', 'Sequential Scan vs Index Scan'],
    rubric: [
      { criteria: 'Accurately outlines ACID and PostgreSQL MVCC implementation', weight: 4 },
      { criteria: 'Compares B-Tree scalar indexing vs GIN for JSONB / arrays', weight: 3 },
      { criteria: 'Explains how to interpret EXPLAIN ANALYZE output to eliminate sequential scans', weight: 3 },
    ],
    followUpQuestions: ['How do PostgreSQL transaction isolation levels (Read Committed vs Serializable) prevent race conditions?'],
  },
  {
    role: 'backend',
    technology: 'mongodb',
    tags: ['mongodb', 'nosql', 'aggregation', 'sharding', 'replica_sets'],
    topic: 'MongoDB Aggregation Pipeline & Sharding Architecture',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'How does the MongoDB Aggregation Pipeline ($match, $group, $lookup, $unwind) work? When should you embed documents vs reference them with ObjectIDs?',
    referenceAnswer: 'The Aggregation Pipeline processes documents through sequential stages ($match filters, $group aggregates, $lookup performs cross-collection left outer joins, $unwind deconstructs array fields). Embed documents for 1-to-few relationships with strong locality and atomic single-document updates. Use ObjectID references for 1-to-many or many-to-many relationships, unbounded growth, or frequently accessed standalone entities to prevent hitting the 16MB document size limit.',
    keyConcepts: ['Aggregation Pipeline ($match, $group, $lookup)', 'embedding vs referencing', '16MB limit', 'single-document atomicity', 'replica set oplog'],
    rubric: [
      { criteria: 'Explains pipeline stages and data transformation flow', weight: 4 },
      { criteria: 'Articulates structural tradeoffs of embedding vs referencing', weight: 4 },
      { criteria: 'Considers performance, indexing, and document size boundaries', weight: 2 },
    ],
    followUpQuestions: ['How does MongoDB handle horizontal scaling via sharded clusters (mongos, config servers, shards)?'],
  },
  {
    role: 'backend',
    technology: 'redis',
    tags: ['redis', 'caching', 'pubsub', 'data_structures'],
    topic: 'Redis Caching Strategies & Distributed Locking',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'Compare Redis caching strategies (Cache-Aside, Write-Through, Write-Behind). How do you implement a distributed lock in Redis using SET NX PX or Redlock?',
    referenceAnswer: 'In Cache-Aside (Lazy Loading), the application reads cache first; on miss, reads DB and populates cache. In Write-Through, data is written to cache and DB synchronously. In Write-Behind, writes go to cache immediately and DB asynchronously. A distributed lock is acquired using "SET lock_key unique_token NX PX 30000" (atomically sets only if not exists with TTL). Releasing requires a Lua script validating the unique token to prevent releasing another process’s expired lock.',
    keyConcepts: ['Cache-Aside', 'Write-Through', 'Write-Behind', 'SET NX PX', 'Lua script atomic release', 'Cache Stampede / TTL'],
    rubric: [
      { criteria: 'Compares the three primary caching strategies with consistency tradeoffs', weight: 4 },
      { criteria: 'Explains atomic lock acquisition via SET NX PX and token uniqueness', weight: 4 },
      { criteria: 'Highlights Lua script atomic verification for safe lock release', weight: 2 },
    ],
    followUpQuestions: ['How do you prevent Cache Stampede (Thundering Herd) and Cache Penetration?'],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 3. FULL STACK DEVELOPER
  // ═════════════════════════════════════════════════════════════════════════
  {
    role: 'fullstack',
    technology: 'javascript',
    tags: ['fullstack', 'javascript', 'react', 'nodejs', 'expressjs', 'mongodb', 'mern'],
    topic: 'End-to-End MERN Stack Request Pipeline & State Flow',
    difficulty: 'easy',
    type: 'open_ended',
    question: 'Explain how data flows end-to-end in a MERN stack application (React frontend -> Express/Node.js API -> MongoDB database -> React state update).',
    referenceAnswer: '1) User action triggers an event in a React component. 2) Axios or Fetch dispatches an HTTP request with JSON payload and Authorization header. 3) Express routes through CORS and auth middleware to a controller. 4) Controller uses Mongoose models to query MongoDB via connection pool. 5) MongoDB returns documents; Express serializes JSON response. 6) React receives data, updates local or global state, triggering component re-rendering.',
    keyConcepts: ['React event', 'HTTP REST', 'Express middleware', 'Mongoose query', 'JSON serialization', 'state update re-render'],
    rubric: [
      { criteria: 'Outlines the complete step-by-step path from frontend to DB and back', weight: 4 },
      { criteria: 'Explains middleware validation and token authorization', weight: 3 },
      { criteria: 'Describes React state management and UI re-rendering', weight: 3 },
    ],
    followUpQuestions: ['How do you handle loading skeletons and error boundaries during this data lifecycle?'],
  },
  {
    role: 'fullstack',
    technology: 'react',
    tags: ['fullstack', 'react', 'nodejs', 'expressjs', 'mongodb', 'mern', 'auth'],
    topic: 'MERN Authentication & Protected Route Architecture',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'How do you architect JWT authentication in a MERN application with React Context/Redux, Express auth middleware, and MongoDB user session storage?',
    referenceAnswer: 'The client logs in via React form; Express controller validates password hash using bcrypt, signs a JWT with user ID/roles, and returns it. The React app stores the token in memory/httpOnly cookies and configures Axios request interceptors to attach "Bearer <token>". An Express protect middleware verifies the JWT via jsonwebtoken. Private routes in React (using React Router Navigate or Outlet) redirect unauthenticated users to /login.',
    keyConcepts: ['JWT signing', 'bcrypt password hashing', 'Axios interceptor', 'Express auth middleware', 'React Router protected route', 'httpOnly cookies'],
    rubric: [
      { criteria: 'Explains token issuance on backend with bcrypt verification', weight: 3 },
      { criteria: 'Details Axios interceptor header attachment and token management', weight: 4 },
      { criteria: 'Explains Express protect middleware and React private route guards', weight: 3 },
    ],
    followUpQuestions: ['How do you implement silent token refresh when the access token expires in MERN?'],
  },
  {
    role: 'fullstack',
    technology: 'nodejs',
    tags: ['fullstack', 'react', 'nodejs', 'expressjs', 'mongodb', 'mern', 'pagination'],
    topic: 'MERN Full Stack Pagination, Search & Optimistic UI Updates',
    difficulty: 'hard',
    type: 'open_ended',
    question: 'How do you build a high-performance full-stack data table in MERN supporting server-side pagination, regex search, and optimistic UI mutations in React?',
    referenceAnswer: 'React maintains page, limit, and debounced search term in URL search params or state. Express receives query params, queries MongoDB using Model.find({ name: new RegExp(search, "i") }).skip((page-1)*limit).limit(limit).lean() along with countDocuments() or $facet. For updates (e.g. status toggle), React immediately updates local state (optimistic update), fires the PUT request in background, and rolls back with an error toast if the backend fails.',
    keyConcepts: ['server-side pagination', 'MongoDB .skip().limit() / $facet', 'debounced search', 'optimistic UI update', 'rollback on error'],
    rubric: [
      { criteria: 'Explains backend pagination query optimization and count metadata', weight: 4 },
      { criteria: 'Details frontend debounced search and URL synchronization', weight: 3 },
      { criteria: 'Explains optimistic UI update pattern and failure rollback handling', weight: 3 },
    ],
    followUpQuestions: ['Why is cursor-based pagination preferred over offset-based pagination in large MongoDB collections?'],
  },
  {
    role: 'fullstack',
    technology: 'spring_boot',
    tags: ['fullstack', 'react', 'spring_boot', 'postgresql', 'java'],
    topic: 'React + Spring Boot + PostgreSQL Architecture Overview',
    difficulty: 'easy',
    type: 'open_ended',
    question: 'How do you connect a React frontend to a Java Spring Boot REST backend with a PostgreSQL relational database? What are the key architectural layers?',
    referenceAnswer: 'The system has 3 clear tiers: 1) Client Tier: React Single Page App sending HTTP JSON requests via Axios/Fetch. 2) Server Tier: Spring Boot application structured into Controllers (@RestController routes), Services (@Service business rules), and Repositories (@Repository Spring Data JPA). 3) Database Tier: PostgreSQL relational tables managed via Hibernate ORM and HikariCP connection pool. CORS is enabled on Spring Boot (@CrossOrigin or WebMvcConfigurer).',
    keyConcepts: ['React SPA', 'Spring @RestController', 'Service Layer', 'Spring Data JPA', 'PostgreSQL', 'HikariCP', 'CORS configuration'],
    rubric: [
      { criteria: 'Accurately outlines the 3-tier architecture and layer responsibilities', weight: 4 },
      { criteria: 'Explains Spring Boot Controller-Service-Repository separation', weight: 4 },
      { criteria: 'Mentions database connection pooling and CORS configuration', weight: 2 },
    ],
    followUpQuestions: ['How do you handle environment-specific API baseURLs between development and production?'],
  },
  {
    role: 'fullstack',
    technology: 'typescript',
    tags: ['fullstack', 'typescript', 'react', 'spring_boot', 'postgresql', 'java'],
    topic: 'Full Stack Integration: React/TypeScript + Spring Boot + PostgreSQL',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'How do you architect a secure enterprise application combining a React/TypeScript frontend with a Java Spring Boot backend and PostgreSQL database?',
    referenceAnswer: 'The React/TypeScript frontend manages typed API clients (using Axios/fetch with shared DTO interfaces) and handles routing/state. Spring Boot provides Spring Security with JWT stateless filters, REST Controllers, Service layers with business validation, and Spring Data JPA / Hibernate mapped to PostgreSQL relational tables. Cross-Origin Resource Sharing (CORS) is configured securely, and database connection pooling (HikariCP) ensures high throughput.',
    keyConcepts: ['React/TypeScript', 'Spring Security', 'JWT filter', 'Spring Data JPA', 'PostgreSQL', 'HikariCP', 'DTO mapping'],
    rubric: [
      { criteria: 'Explains frontend-backend contract and typed DTO interfaces', weight: 3 },
      { criteria: 'Details Spring Security JWT authentication and CORS headers', weight: 4 },
      { criteria: 'Explains JPA persistence layer and PostgreSQL relational modeling', weight: 3 },
    ],
    followUpQuestions: ['How do database transactions (@Transactional) coordinate with REST response status codes?'],
  },
  {
    role: 'fullstack',
    technology: 'postgresql',
    tags: ['fullstack', 'react', 'spring_boot', 'postgresql', 'java', 'transactions'],
    topic: 'Spring Boot + PostgreSQL Transaction Management & React Error Boundaries',
    difficulty: 'hard',
    type: 'open_ended',
    question: 'How do you implement ACID multi-table transactions in Spring Boot with PostgreSQL (@Transactional isolation levels), and handle optimistic locking conflicts (ObjectOptimisticLockingFailureException) in React?',
    referenceAnswer: 'Spring Boot uses @Transactional with isolation levels (e.g. Isolation.READ_COMMITTED) and rollbackFor = Exception.class to manage database transactions. For concurrent entity updates, JPA @Version enables optimistic locking. When a version conflict occurs, Spring throws ObjectOptimisticLockingFailureException and returns HTTP 409 Conflict. The React client intercepts 409, prompts the user with the updated record, and allows resolving or re-submitting.',
    keyConcepts: ['@Transactional', 'ACID isolation', 'JPA @Version', 'optimistic locking', 'HTTP 409 Conflict', 'React conflict resolution UI'],
    rubric: [
      { criteria: 'Explains @Transactional semantics and rollback triggers in Spring Boot', weight: 4 },
      { criteria: 'Details optimistic locking using JPA @Version column', weight: 4 },
      { criteria: 'Explains frontend handling of 409 Conflict and user recovery UX', weight: 2 },
    ],
    followUpQuestions: ['When would you choose pessimistic locking (PESSIMISTIC_WRITE) over optimistic locking?'],
  },
  {
    role: 'fullstack',
    technology: 'python',
    tags: ['fullstack', 'python', 'fastapi', 'react', 'postgresql'],
    topic: 'Full Stack Python: FastAPI + React + PostgreSQL',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'How do you build a high-performance full-stack web application using React on the frontend and FastAPI with PostgreSQL on the backend?',
    referenceAnswer: 'The React client communicates over REST / WebSockets. FastAPI handles incoming requests asynchronously via ASGI (Uvicorn), using Pydantic models for strict input validation and response serialization. Async database queries are executed using SQLAlchemy 2.0 async session or Tortoise ORM connected to PostgreSQL via asyncpg driver. Authentication uses OAuth2 with Password Bearer and JWT tokens.',
    keyConcepts: ['React', 'FastAPI', 'Pydantic validation', 'SQLAlchemy async', 'PostgreSQL (asyncpg)', 'OAuth2 / JWT'],
    rubric: [
      { criteria: 'Outlines React frontend API communication', weight: 3 },
      { criteria: 'Explains FastAPI async request handling and Pydantic validation', weight: 4 },
      { criteria: 'Describes async database integration with PostgreSQL', weight: 3 },
    ],
    followUpQuestions: ['How do you handle real-time full-stack updates between FastAPI WebSockets and React?'],
  },
  {
    role: 'fullstack',
    technology: 'system_design',
    tags: ['fullstack', 'system_design', 'scalability', 'websockets', 'redis'],
    topic: 'Full Stack Real-Time Architecture & Scaling',
    difficulty: 'hard',
    type: 'open_ended',
    question: 'Design an end-to-end full stack real-time collaborative application (like Google Docs or real-time chat) supporting 100k active concurrent users.',
    referenceAnswer: 'Frontend connects via WebSockets (Socket.io) with optimistic UI updates. Backend runs horizontally scaled Node.js/Go instances behind an Nginx load balancer with Redis Pub/Sub adapter to sync messages across server instances. Operational Transformation (OT) or CRDTs (Conflict-free Replicated Data Types) resolve concurrent edit conflicts. Unread data is persisted asynchronously in PostgreSQL/MongoDB with Redis caching hot session state.',
    keyConcepts: ['WebSockets', 'Redis Pub/Sub', 'horizontal scaling', 'CRDTs / OT', 'load balancing', 'optimistic UI', 'caching'],
    rubric: [
      { criteria: 'Explains bidirectional WebSocket connectivity and reconnection strategies', weight: 3 },
      { criteria: 'Implements cross-server broadcasting with Redis Pub/Sub', weight: 4 },
      { criteria: 'Addresses data conflict resolution (CRDTs/OT) and database persistence', weight: 3 },
    ],
    followUpQuestions: ['How do you prevent data loss if a server instance crashes during active document edits?'],
  },


  // ═════════════════════════════════════════════════════════════════════════
  // 4. AI / ML ENGINEER
  // ═════════════════════════════════════════════════════════════════════════
  {
    role: 'aiml',
    technology: 'python',
    tags: ['aiml', 'python', 'scikit_learn', 'machine_learning', 'feature_engineering'],
    topic: 'Supervised Learning & Scikit-Learn Pipelines',
    difficulty: 'easy',
    type: 'open_ended',
    question: 'Explain the difference between Supervised and Unsupervised Learning. How do you construct a Scikit-Learn Pipeline combining preprocessing, feature scaling, and model training?',
    referenceAnswer: 'Supervised learning trains models on labeled input-output pairs (classification, regression), while Unsupervised learning discovers hidden patterns in unlabeled data (clustering, PCA). A Scikit-learn Pipeline chains data transformers (StandardScaler, OneHotEncoder, SimpleImputer via ColumnTransformer) with an estimator (RandomForest, LogisticRegression). This prevents data leakage during cross-validation by fitting transformers strictly on training folds.',
    keyConcepts: ['Supervised vs Unsupervised', 'Scikit-Learn Pipeline', 'ColumnTransformer', 'Data Leakage prevention', 'Cross-Validation'],
    rubric: [
      { criteria: 'Accurately defines supervised vs unsupervised learning paradigms', weight: 3 },
      { criteria: 'Explains Scikit-Learn Pipeline construction and ColumnTransformer', weight: 4 },
      { criteria: 'Articulates how pipelines prevent data leakage during CV', weight: 3 },
    ],
    followUpQuestions: ['What is the Bias-Variance tradeoff and how does L1 (Lasso) vs L2 (Ridge) regularization help?'],
  },
  {
    role: 'aiml',
    technology: 'pytorch',
    tags: ['aiml', 'pytorch', 'deep_learning', 'neural_networks', 'tensors'],
    topic: 'PyTorch Tensors, Autograd & Neural Network Training Loop',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'How does PyTorch Autograd track gradients across computational graphs? Walk through the standard 5-step PyTorch training loop for a neural network.',
    referenceAnswer: 'PyTorch constructs a dynamic computational graph (Define-by-Run) where tensors with requires_grad=True track mathematical operations. Standard training loop steps: 1) optimizer.zero_grad() (clears previous accumulated gradients). 2) outputs = model(inputs) (forward pass). 3) loss = criterion(outputs, targets) (calculates loss). 4) loss.backward() (computes dLoss/dW gradients via autograd). 5) optimizer.step() (updates model weights).',
    keyConcepts: ['Dynamic Computational Graph', 'Autograd', 'requires_grad', 'zero_grad', 'forward pass', 'backward pass', 'optimizer.step'],
    rubric: [
      { criteria: 'Explains dynamic computation graph and gradient tracking', weight: 4 },
      { criteria: 'Correctly orders and details the 5 training loop steps', weight: 4 },
      { criteria: 'Explains why optimizer.zero_grad() is necessary in PyTorch', weight: 2 },
    ],
    followUpQuestions: ['How does torch.no_grad() and model.eval() change behavior during model inference?'],
  },
  {
    role: 'aiml',
    technology: 'genai',
    tags: ['aiml', 'genai', 'llm', 'rag', 'vector_db'],
    topic: 'Generative AI, LLMs & Retrieval-Augmented Generation (RAG)',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'How does Retrieval-Augmented Generation (RAG) work with LLMs? Explain the complete pipeline: chunking, embedding generation, vector database search, and prompt augmentation.',
    referenceAnswer: 'RAG grounds LLM generation in external private knowledge: 1) Ingestion: Documents are split into semantic chunks with overlap. 2) Embedding: Chunks are transformed into dense vectors via an embedding model. 3) Vector Storage: Stored in a vector database (Pinecone, Qdrant, Chroma). 4) Retrieval: User query is embedded, and cosine/dot-product similarity retrieves Top-K relevant chunks. 5) Augmentation: Retrieved chunks are injected into the system prompt as context. 6) Generation: LLM generates an accurate, hallucination-free answer cited from context.',
    keyConcepts: ['Chunking strategy', 'Dense vector embeddings', 'Vector DB similarity search', 'Context augmentation', 'Hallucination reduction'],
    rubric: [
      { criteria: 'Details the end-to-end ingestion and retrieval stages', weight: 4 },
      { criteria: 'Explains embedding similarity metrics (cosine/dot-product)', weight: 3 },
      { criteria: 'Explains how context augmentation prevents LLM hallucinations', weight: 3 },
    ],
    followUpQuestions: ['How do reranking models (e.g. Cohere Rerank) and hybrid search (BM25 + vector) improve RAG accuracy?'],
  },
  {
    role: 'aiml',
    technology: 'llm',
    tags: ['aiml', 'llm', 'transformers', 'self_attention', 'fine_tuning'],
    topic: 'Transformer Architecture & LLM Fine-Tuning (LoRA / QLoRA)',
    difficulty: 'hard',
    type: 'open_ended',
    question: 'Explain the Self-Attention mechanism in Transformers (Queries, Keys, Values). How does Parameter-Efficient Fine-Tuning (PEFT / LoRA) enable fine-tuning LLMs on consumer GPUs?',
    referenceAnswer: 'Self-Attention computes Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V, enabling each token to dynamically weight context from all other tokens in parallel. LoRA (Low-Rank Adaptation) freezes pre-trained model weights and injects trainable rank-decomposition matrices (A and B of rank r << d) into attention layers (W = W0 + B*A). QLoRA quantizes the base model to 4-bit NormalFloat while training 16-bit LoRA adapters, reducing VRAM by up to 80% without losing performance.',
    keyConcepts: ['Self-Attention (Q, K, V)', 'softmax scaling sqrt(d_k)', 'LoRA low-rank decomposition', 'QLoRA 4-bit quantization', 'PEFT', 'VRAM optimization'],
    rubric: [
      { criteria: 'Accurately explains mathematical intuition of Q, K, V attention', weight: 4 },
      { criteria: 'Details LoRA rank decomposition matrix injection (W0 + B*A)', weight: 4 },
      { criteria: 'Highlights QLoRA quantization and memory footprint reduction', weight: 2 },
    ],
    followUpQuestions: ['How does Direct Preference Optimization (DPO) differ from traditional RLHF?'],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 5. DATA SCIENTIST
  // ═════════════════════════════════════════════════════════════════════════
  {
    role: 'data_scientist',
    technology: 'python',
    tags: ['data_scientist', 'python', 'pandas', 'numpy', 'eda'],
    topic: 'Exploratory Data Analysis (EDA) & Pandas Data Cleaning',
    difficulty: 'easy',
    type: 'open_ended',
    question: 'How do you handle missing values, duplicate records, and outliers in a large dataset using Python and Pandas? What are the statistical methods for outlier detection?',
    referenceAnswer: 'Handling missing data: df.isna().sum(), followed by domain-specific imputation (median/mean for numerical, mode for categorical, KNNImputer, or dropping via dropna if missingness is completely random). Outlier detection methods: 1) IQR method (values outside [Q1 - 1.5*IQR, Q3 + 1.5*IQR]). 2) Z-Score method (values with |Z| > 3 for normal distributions). 3) Isolation Forests. Visualizations via box plots and histograms confirm distributions before transformation.',
    keyConcepts: ['Pandas imputation (fillna, KNNImputer)', 'IQR rule', 'Z-score thresholding', 'outlier treatment (capping/winsorization)', 'EDA distributions'],
    rubric: [
      { criteria: 'Discusses missing value imputation vs removal strategies', weight: 4 },
      { criteria: 'Accurately defines IQR and Z-score outlier detection formulas', weight: 4 },
      { criteria: 'Explains outlier treatment methods (capping, transforming, dropping)', weight: 2 },
    ],
    followUpQuestions: ['When is median imputation preferred over mean imputation?'],
  },
  {
    role: 'data_scientist',
    technology: 'statistics',
    tags: ['data_scientist', 'statistics', 'ab_testing', 'hypothesis_testing', 'probability'],
    topic: 'Hypothesis Testing & A/B Testing Design',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'Walk through the mathematical design of an A/B test. Explain Type I error (alpha), Type II error (beta), Statistical Power, p-value, and sample size calculation.',
    referenceAnswer: 'A/B testing evaluates if a variant outperforms control: 1) State Null (H0: no difference) and Alternative (H1: difference exists) hypotheses. 2) Set significance level alpha = 0.05 (Type I error: false positive) and statistical power 1 - beta = 0.80 (Type II error: false negative). 3) Calculate sample size based on baseline conversion rate and Minimum Detectable Effect (MDE). 4) Run test without peeking until required sample size is reached. 5) Compute p-value using two-sample z-test or t-test; reject H0 if p < alpha.',
    keyConcepts: ['H0 vs H1', 'Type I error (alpha)', 'Type II error (beta)', 'Statistical Power (1-beta)', 'p-value', 'Minimum Detectable Effect (MDE)', 'sample size'],
    rubric: [
      { criteria: 'Defines Null/Alternative hypotheses and p-value decision boundary', weight: 4 },
      { criteria: 'Accurately distinguishes Type I (false positive) vs Type II (false negative) errors', weight: 4 },
      { criteria: 'Explains power, MDE, and sample size requirements to prevent peeking bias', weight: 2 },
    ],
    followUpQuestions: ['How does multi-arm bandit testing differ from traditional A/B testing?'],
  },
  {
    role: 'data_scientist',
    technology: 'machine_learning',
    tags: ['data_scientist', 'machine_learning', 'scikit_learn', 'evaluation_metrics'],
    topic: 'Classification Metrics & Imbalanced Data Strategies',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'Why is Accuracy misleading for imbalanced classification datasets (e.g. fraud detection)? Explain Precision, Recall, F1-Score, ROC-AUC, and techniques like SMOTE.',
    referenceAnswer: 'In imbalanced data (99% negative, 1% positive), a naive model predicting all negatives achieves 99% accuracy but catches 0 fraud cases. Precision = TP / (TP + FP) measures accuracy of positive predictions. Recall = TP / (TP + FN) measures proportion of actual positives detected. F1-Score is the harmonic mean of precision and recall. ROC-AUC evaluates discrimination threshold independence. Remediation includes SMOTE (Synthetic Minority Over-sampling), class weighting, and focal loss.',
    keyConcepts: ['Imbalanced classification', 'Precision vs Recall', 'F1-Score', 'ROC-AUC curve', 'SMOTE oversampling', 'class weights'],
    rubric: [
      { criteria: 'Explains why accuracy fails in skewed distributions', weight: 3 },
      { criteria: 'Formulates Precision, Recall, and F1-Score trade-offs', weight: 4 },
      { criteria: 'Details data-level (SMOTE) and algorithm-level (class weights) solutions', weight: 3 },
    ],
    followUpQuestions: ['How does Precision-Recall AUC (PR-AUC) compare to ROC-AUC for extreme class imbalance?'],
  },
  {
    role: 'data_scientist',
    technology: 'sql',
    tags: ['data_scientist', 'sql', 'aggregations', 'window_functions'],
    topic: 'Advanced SQL for Data Science: Window Functions & Cohorts',
    difficulty: 'hard',
    type: 'open_ended',
    question: 'How do you write SQL queries using Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LEAD/LAG) to calculate user retention and rolling 7-day average revenue?',
    referenceAnswer: 'Window functions perform calculations across a set of table rows related to the current row without collapsing rows into a single output. Rolling 7-day average: AVG(revenue) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW). User retention / cohort analysis: use LAG(activity_date) OVER (PARTITION BY user_id ORDER BY activity_date) to compute days between visits, or use DENSE_RANK() to assign cohort lifecycle rankings.',
    keyConcepts: ['OVER (PARTITION BY ... ORDER BY ...)', 'ROWS BETWEEN 6 PRECEDING', 'LEAD / LAG', 'DENSE_RANK vs RANK', 'cohort analysis'],
    rubric: [
      { criteria: 'Explains window function clause anatomy (OVER, PARTITION BY, ORDER BY)', weight: 4 },
      { criteria: 'Writes correct rolling window aggregation frame syntax', weight: 3 },
      { criteria: 'Explains LEAD/LAG usage for time-series / retention calculations', weight: 3 },
    ],
    followUpQuestions: ['What is the difference between ROWS and RANGE in SQL window frame definitions?'],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 6. DATA ANALYST
  // ═════════════════════════════════════════════════════════════════════════
  {
    role: 'data_analyst',
    technology: 'sql',
    tags: ['data_analyst', 'sql', 'joins', 'aggregations', 'group_by'],
    topic: 'SQL Joins, Aggregations & Subqueries',
    difficulty: 'easy',
    type: 'open_ended',
    question: 'Explain the differences between INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL OUTER JOIN in SQL. When should you use HAVING versus WHERE?',
    referenceAnswer: 'INNER JOIN returns records with matching keys in both tables. LEFT JOIN returns all rows from the left table plus matched rows from the right table (NULL if no match). RIGHT JOIN returns all rows from right table. FULL OUTER JOIN returns all rows when there is a match in either table. WHERE filters rows before aggregation; HAVING filters aggregated groups after GROUP BY execution.',
    keyConcepts: ['INNER JOIN', 'LEFT JOIN', 'FULL OUTER JOIN', 'WHERE vs HAVING', 'GROUP BY aggregation', 'NULL handling'],
    rubric: [
      { criteria: 'Accurately distinguishes all 4 SQL join types', weight: 4 },
      { criteria: 'Explains WHERE (pre-aggregation) vs HAVING (post-aggregation) filter order', weight: 4 },
      { criteria: 'Mentions handling of NULL values produced by outer joins', weight: 2 },
    ],
    followUpQuestions: ['How do Common Table Expressions (CTEs with WITH clause) improve complex SQL readability?'],
  },
  {
    role: 'data_analyst',
    technology: 'power_bi',
    tags: ['data_analyst', 'power_bi', 'dax', 'data_modeling', 'star_schema'],
    topic: 'Power BI DAX, Star Schema & Data Modeling',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'How do you design a Star Schema in Power BI (Fact vs Dimension tables)? Explain the difference between a Calculated Column and a DAX Measure with CALCULATE().',
    referenceAnswer: 'A Star Schema organizes data into a central Fact table (numerical metrics, sales, transactions) surrounded by Dimension tables (Customers, Dates, Products) joined via 1-to-Many relationships. Calculated Columns are evaluated during data load row-by-row and stored in RAM. DAX Measures are evaluated dynamically on-the-fly at query time based on user filter context. CALCULATE() modifies filter context (e.g. CALCULATE(SUM(Sales[Amount]), Filter(Dates, Dates[Year] = 2024))).',
    keyConcepts: ['Star Schema', 'Fact vs Dimension tables', 'Calculated Column (stored)', 'DAX Measure (dynamic)', 'CALCULATE()', 'Filter Context'],
    rubric: [
      { criteria: 'Explains Fact vs Dimension relationships in Star Schema', weight: 4 },
      { criteria: 'Distinguishes row context storage vs dynamic filter context in Measures', weight: 4 },
      { criteria: 'Demonstrates understanding of CALCULATE() filter context modification', weight: 2 },
    ],
    followUpQuestions: ['How does Time Intelligence in DAX (SAMEPERIODLASTYEAR, TOTALYTD) work?'],
  },
  {
    role: 'data_analyst',
    technology: 'tableau',
    tags: ['data_analyst', 'tableau', 'data_viz', 'lod_expressions', 'dashboards'],
    topic: 'Tableau Visual Analytics, LOD Expressions & KPIs',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'What are Level of Detail (LOD) expressions in Tableau (FIXED, INCLUDE, EXCLUDE)? How do you build an interactive executive KPI dashboard with action filters?',
    referenceAnswer: 'LOD expressions allow computing values at data levels different from the visualization view level: FIXED computes aggregations at the specified dimensions independent of view filters. INCLUDE computes at view level plus additional specified dimensions. EXCLUDE ignores specified view dimensions. Executive dashboards combine high-level KPI cards, trend sparklines, and breakdown charts interconnected via Dashboard Action Filters (click to filter all sheets).',
    keyConcepts: ['FIXED LOD', 'INCLUDE LOD', 'EXCLUDE LOD', 'Dashboard Action Filters', 'Executive KPIs', 'Visual hierarchy'],
    rubric: [
      { criteria: 'Defines FIXED, INCLUDE, and EXCLUDE LOD calculations accurately', weight: 4 },
      { criteria: 'Explains dashboard visual hierarchy and action filter interactivity', weight: 4 },
      { criteria: 'Describes best practices for executive KPI presentation', weight: 2 },
    ],
    followUpQuestions: ['What is the difference between Discrete (Blue) and Continuous (Green) fields in Tableau?'],
  },
  {
    role: 'data_analyst',
    technology: 'excel',
    tags: ['data_analyst', 'excel', 'pivot_tables', 'vlookup_xlookup', 'power_query'],
    topic: 'Advanced Excel: XLOOKUP, Pivot Tables & Power Query',
    difficulty: 'easy',
    type: 'open_ended',
    question: 'Explain the advantages of XLOOKUP over VLOOKUP/INDEX-MATCH in Excel. How do Pivot Tables and Power Query automate repetitive data cleaning workflows?',
    referenceAnswer: 'XLOOKUP searches in any direction (left or right), defaults to exact match without sorting requirements, handles errors gracefully via if_not_found parameter, and does not break when columns are inserted. Pivot Tables summarize, sort, count, and aggregate multidimensional data instantly. Power Query (ETL engine) records step-by-step transformation recipes (unpivoting, merging, splitting, datatype conversion) that refresh automatically when new source data arrives.',
    keyConcepts: ['XLOOKUP vs VLOOKUP', 'exact match default', 'Pivot Tables', 'Power Query (ETL)', 'automated refresh', 'unpivoting'],
    rubric: [
      { criteria: 'Details specific advantages of XLOOKUP over legacy lookup functions', weight: 4 },
      { criteria: 'Explains Pivot Table multidimensional aggregation capabilities', weight: 3 },
      { criteria: 'Describes Power Query automated ETL pipeline steps', weight: 3 },
    ],
    followUpQuestions: ['How do Excel Dynamic Array formulas (FILTER, UNIQUE, SORT) work?'],
  },

  // ═════════════════════════════════════════════════════════════════════════
  // 7. HR / BEHAVIORAL INTERVIEW
  // ═════════════════════════════════════════════════════════════════════════
  {
    role: 'hr',
    technology: 'self_intro',
    tags: ['hr', 'self_intro', 'career_overview', 'elevator_pitch'],
    topic: 'Self Introduction & Professional Background',
    difficulty: 'easy',
    type: 'open_ended',
    question: 'Tell me about yourself, your background, and what key experiences make you a great fit for this position.',
    referenceAnswer: 'A polished Present-Past-Future elevator pitch: 1) Present: Current role, primary technical expertise, and domain focus. 2) Past: Relevant past accomplishments, key projects shipped, and problems solved. 3) Future: Why this specific company and role is the natural next step where you can deliver immediate impact and continue growing.',
    keyConcepts: ['Present-Past-Future framework', 'Relevant achievements', 'Company alignment', 'Concise storytelling', 'Confidence'],
    rubric: [
      { criteria: 'Follows Present-Past-Future structure concisely (< 2 minutes)', weight: 4 },
      { criteria: 'Highlights quantifiable achievements rather than just listing responsibilities', weight: 4 },
      { criteria: 'Connects personal trajectory directly to this company’s mission', weight: 2 },
    ],
    followUpQuestions: ['What is the single project you are most proud of in your career and why?'],
  },
  {
    role: 'hr',
    technology: 'strengths_weaknesses',
    tags: ['hr', 'strengths_weaknesses', 'self_awareness', 'growth_mindset'],
    topic: 'Strengths and Weaknesses & Self-Awareness',
    difficulty: 'easy',
    type: 'open_ended',
    question: 'What are your greatest professional strengths, and what is one real area of improvement you are actively working on?',
    referenceAnswer: 'Strengths: Choose 2-3 genuine strengths tied to the role (e.g. system design problem-solving, cross-functional communication) with brief supporting evidence. Weakness: Choose a genuine, non-fatal area of improvement (e.g. delegating tasks early or public speaking anxiety), explain the self-awareness moment, and highlight active steps taken to improve (e.g. enrolled in workshops, using structured delegation checklists).',
    keyConcepts: ['Genuine self-awareness', 'Evidence-backed strengths', 'Constructive weakness', 'Action plan for improvement', 'Growth mindset'],
    rubric: [
      { criteria: 'Presents strengths backed by real-world work examples', weight: 4 },
      { criteria: 'Shares a genuine area for growth rather than a clichéd disguised strength', weight: 4 },
      { criteria: 'Demonstrates proactive, ongoing steps to improve that weakness', weight: 2 },
    ],
    followUpQuestions: ['Can you give an example of feedback from a manager that helped you grow?'],
  },
  {
    role: 'hr',
    technology: 'conflict_resolution',
    tags: ['hr', 'conflict_resolution', 'teamwork', 'star_method'],
    topic: 'Conflict Resolution & Team Collaboration (STAR Method)',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'Describe a situation where you had a serious disagreement with a colleague or manager regarding a technical decision. How did you resolve it?',
    referenceAnswer: 'Structured using STAR: 1) Situation: Context of disagreement (e.g. database schema architecture or sprint priority). 2) Task: Need to reach consensus without delaying deadlines or harming team morale. 3) Action: Scheduled a private 1-on-1, listened actively to understand their perspective, gathered objective benchmark data, and focused on trade-offs rather than ego. 4) Result: Agreed on a data-backed compromise that delivered on time with zero regressions.',
    keyConcepts: ['STAR method', 'Active listening', 'Data-driven decision making', 'Empathy', 'De-escalation', 'Team cohesion'],
    rubric: [
      { criteria: 'Follows complete STAR structure (Situation, Task, Action, Result)', weight: 4 },
      { criteria: 'Emphasizes constructive communication, empathy, and objective criteria', weight: 4 },
      { criteria: 'Shares a clear positive outcome and reflection on the relationship', weight: 2 },
    ],
    followUpQuestions: ['How do you handle a scenario where you must disagree and commit to a decision you opposed?'],
  },
  {
    role: 'hr',
    technology: 'leadership',
    tags: ['hr', 'leadership', 'initiative', 'ownership', 'star_method'],
    topic: 'Leadership & Taking Initiative Without Authority',
    difficulty: 'medium',
    type: 'open_ended',
    question: 'Tell me about a time you took initiative or demonstrated leadership to solve a critical issue without having formal management authority.',
    referenceAnswer: 'STAR response: 1) Situation: Identified an unowned bottleneck (e.g. slow onboarding process or flaky CI/CD pipeline). 2) Task: Recognized the team cost and decided to champion a solution proactively. 3) Action: Built a lightweight prototype / documentation guide, presented benefits to stakeholders, and mentored teammates through adoption. 4) Result: Reduced CI/CD failure rate by 40% and established a company-wide best practice.',
    keyConcepts: ['Proactive initiative', 'Influence without authority', 'Mentorship', 'Stakeholder communication', 'Measurable impact'],
    rubric: [
      { criteria: 'Clearly articulates an unprompted problem and initiative taken', weight: 4 },
      { criteria: 'Demonstrates persuasion and collaboration without relying on authority', weight: 4 },
      { criteria: 'Quantifies the positive business or team impact achieved', weight: 2 },
    ],
    followUpQuestions: ['How do you keep teammates motivated during stressful crunch periods?'],
  },
  {
    role: 'hr',
    technology: 'situational',
    tags: ['hr', 'situational', 'problem_solving', 'ownership', 'failure'],
    topic: 'Failure, Ownership & Handling Tight Deadlines',
    difficulty: 'hard',
    type: 'open_ended',
    question: 'Tell me about a time a major project failed or missed a critical milestone. How did you take ownership and what systematic changes did you implement?',
    referenceAnswer: 'STAR response: 1) Situation: Describe an actual missed deadline or production incident. 2) Task: Responsibility to contain damage and transparently communicate with leadership. 3) Action: Owned the mistake without blaming subordinates or external factors, authored a blameless post-mortem, identified root causes, and introduced automated guardrails and milestone tracking. 4) Result: Re-shipped successfully, restored stakeholder trust, and permanently prevented recurrence.',
    keyConcepts: ['Radical ownership', 'Blameless post-mortem', 'Transparency with stakeholders', 'Systemic remediation', 'Resilience'],
    rubric: [
      { criteria: 'Demonstrates genuine accountability and transparency without excuses', weight: 4 },
      { criteria: 'Explains concrete root cause remediation and post-mortem actions', weight: 4 },
      { criteria: 'Articulates long-term lessons learned and organizational improvements', weight: 2 },
    ],
    followUpQuestions: ['How do you prioritize competing high-priority tasks when everything feels urgent?'],
  },
];

let ADDITIONAL_QUESTIONS = [];
try {
  ADDITIONAL_QUESTIONS = require('./additionalQuestions').ADDITIONAL_QUESTIONS || [];
} catch (e) {
  console.warn('[questionsSeed] Could not load additionalQuestions:', e.message);
}

const ALL_SEED_QUESTIONS = [...SEED_QUESTIONS, ...ADDITIONAL_QUESTIONS];

async function seedQuestionBank(existingConn = null) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  HIREMIND AI — SEEDING ROLE-BASED QUESTION BANK');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/hiremind';

  let shouldDisconnect = false;
  if (!mongoose.connection.readyState) {
    console.log(`Connecting to MongoDB: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    await mongoose.connect(uri);
    shouldDisconnect = true;
  }

  try {
    let upserted = 0;

    for (const qData of ALL_SEED_QUESTIONS) {
      const doc = {
        ...qData,
        fieldId:   qData.fieldId || 'software_development',
        roleId:    qData.roleId  || `${qData.role}_developer`,
        roundType: qData.roundType || (qData.role === 'hr' ? 'hr' : 'role_technical'),
        technology: qData.technology || '',
        tags:      qData.tags || [qData.technology || qData.role],
        isActive:  true,
      };

      await Question.updateOne(
        { question: doc.question },
        { $set: doc },
        { upsert: true }
      );
      upserted++;
    }

    const totalCount = await Question.countDocuments();
    console.log(`✅ Question Seeding Verified: ${upserted} processed, ${totalCount} active in DB.\n`);
    return { success: true, processed: upserted, total: totalCount };

  } catch (err) {
    console.error('❌ Question seeding error:', err.message);
    throw err;
  } finally {
    if (shouldDisconnect) {
      await mongoose.disconnect();
      console.log('MongoDB connection closed.');
    }
  }
}

if (require.main === module) {
  seedQuestionBank().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { SEED_QUESTIONS: ALL_SEED_QUESTIONS, seedQuestionBank };
