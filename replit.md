# Overview

This is a premium landing page application for "Najot Nur Notiqlik Markazi," an online oratory course platform targeting entrepreneurs and professionals in Uzbekistan. The application is built as a full-stack web application with a React frontend and Express backend, featuring a content management system and CRM integration capabilities.

The landing page is conversion-focused, addressing key pain points like stage fright, communication anxiety, and lack of structured speech skills. It showcases a 6-week professional oratory course with both offline and online formats.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework & Tooling:**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server
- **Wouter** for client-side routing with hash-based navigation (supports static deployment)
- **TanStack Query (React Query)** for server state management and data fetching
- **Tailwind CSS** with custom theming for styling
- **Framer Motion** for animations and transitions

**UI Component System:**
- **shadcn/ui** components (Radix UI primitives) for consistent, accessible UI elements
- Custom theme with Navy & Gold color palette for premium branding
- Responsive design with mobile-first approach

**State Management:**
- React Context API for global content management (allows admin to edit landing page content)
- Local storage persistence for content changes
- TanStack Query for API state and caching

**Routing Strategy:**
- Hash-based routing to support static deployment scenarios
- Anchor link support for in-page navigation to sections

## Backend Architecture

**Framework & Server:**
- **Express.js** with TypeScript for REST API
- **HTTP server** for serving both API and static frontend assets
- Development mode uses Vite middleware for HMR (Hot Module Replacement)
- Production mode serves pre-built static files

**API Design:**
- RESTful endpoints for lead management and CRM integration
- Validation using Zod schemas
- Error handling and logging middleware

**Build Process:**
- **esbuild** for server-side bundling with selective dependency bundling
- **Vite** for client-side bundling
- Single distribution output combining frontend and backend

## Data Storage

**Database:**
- **PostgreSQL** as primary database
- **Drizzle ORM** for type-safe database queries and schema management
- **postgres** driver for database connectivity

**Schema Design:**
- `users` table for authentication (username/password)
- `leads` table for form submissions with CRM sync tracking
- `settings` table for key-value configuration storage

**Migration Strategy:**
- Schema defined in TypeScript (`shared/schema.ts`)
- Drizzle Kit for schema migrations
- Migration files stored in `migrations/` directory

## Authentication & Authorization

**Current Implementation:**
- User table exists with username/password fields
- Admin page protected by obscure URL path (`/admin123456789`)
- No active authentication middleware (prepared for future implementation)

**Security Considerations:**
- Password storage structure in place (appears to expect hashed passwords)
- Session infrastructure not yet implemented
- CORS and rate limiting dependencies included but not configured

## External Dependencies

**CRM Integration:**
- **Kommo (AmoCRM)** integration for lead management
- API endpoint to fetch pipelines and statuses
- Lead synchronization with configurable pipeline/status mapping
- Environment variables for Kommo subdomain and access token
- Supports both kommo.com and legacy amocrm.ru/amocrm.com domains

**Third-Party Services:**
- Configured for potential Google Analytics or other tracking (via meta tags)
- OpenGraph and Twitter Card meta tags for social sharing
- Custom Vite plugin for dynamic meta image URL injection

**Development Tools:**
- Replit-specific plugins for development experience (cartographer, dev-banner, runtime error overlay)
- Custom Vite plugin for handling Replit deployment domains

## Form Handling & Lead Capture

**Lead Submission Flow:**
1. User submits form (registration modal or footer contact form)
2. Client-side validation (Zod schema)
3. POST to `/api/leads` endpoint
4. Server validates and stores in database
5. Attempts sync to Kommo CRM (if configured)
6. Returns success/failure response with toast notification

**Data Validation:**
- Phone format: `+998XXXXXXXXX` (Uzbekistan format)
- Required fields: name, phone, job
- Optional source tracking (registration vs footer)

## Content Management

**Dynamic Content System:**
- All landing page content stored in React Context
- Default content defined in code, editable via admin interface
- Changes persist to localStorage
- Sections: navbar, hero, pain points, methodology, program, mentors, testimonials, pricing, FAQ, footer

**Admin Interface:**
- Located at `/admin123456789`
- Tabbed interface for editing different sections
- Lead management dashboard with Kommo sync status
- CRM configuration (pipeline and status selection)
- Export functionality for content as JSON

## Deployment Strategy

**Production Build:**
- Client build output: `dist/public/`
- Server bundle: `dist/index.cjs` (CommonJS for Node.js execution)
- Environment variables required: `DATABASE_URL`, `KOMMO_SUBDOMAIN`, `KOMMO_ACCESS_TOKEN`
- Static file serving handled by Express in production

**Development Environment:**
- Separate Vite dev server on port 5000
- Express API server with Vite middleware
- Hot module replacement for instant updates
- Postgres connection required

**Environment Configuration:**
- `NODE_ENV` for environment detection
- `DATABASE_URL` for PostgreSQL connection
- `KOMMO_SUBDOMAIN` and `KOMMO_ACCESS_TOKEN` for CRM integration
- `REPL_ID` for Replit-specific features