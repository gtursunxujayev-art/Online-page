# Najot Nur Notiqlik Markazi - Landing Page

Premium conversion-focused landing page for "Najot Nur Notiqlik Markazi" - an online oratory course platform.

## Features

- Modern React + TypeScript frontend
- Responsive design with Tailwind CSS
- Dynamic content management
- Lead capture forms
- Admin interface for content editing
- CRM integration ready

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities and context
│   │   └── hooks/        # Custom hooks
├── server/                # Express backend (for separate deployment)
├── shared/               # Shared types and schemas
├── attached_assets/      # Images and media files
└── public/              # Static assets
```

## Deployment on Vercel

This project is configured for Vercel deployment. The following changes have been made for Vercel compatibility:

### Changes Made:
1. **Removed Replit-specific files:**
   - `.replit` configuration
   - `replit.md` documentation
   - Replit Vite plugins

2. **Updated configuration:**
   - `vite.config.ts` - Cleaned Replit-specific code
   - `package.json` - Updated scripts for Vercel
   - `vercel.json` - Vercel deployment configuration

3. **API Configuration:**
   - Created `client/src/lib/api.ts` for configurable API endpoints
   - Updated components to use environment variables for API URLs
   - Created `env.example` with required environment variables

### Deployment Steps:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel will automatically detect the Vite configuration
   - Configure environment variables (see below)

3. **Environment Variables (in Vercel project settings):**
   ```
   VITE_API_URL=https://your-backend-url.com  # If backend is hosted separately
   ```

### Backend Deployment (Optional)

For full functionality (admin panel, lead storage, CRM integration), you need to deploy the backend separately:

1. **Options for backend hosting:**
   - **Render.com** - Easy Node.js deployment
   - **Railway.app** - Full-stack platform
   - **Fly.io** - Global application platform
   - **AWS/Google Cloud/Azure** - Cloud providers

2. **Backend requirements:**
   - PostgreSQL database
   - Environment variables: `DATABASE_URL`, `KOMMO_SUBDOMAIN`, `KOMMO_ACCESS_TOKEN`
   - Update `VITE_API_URL` in frontend to point to your backend URL

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Features That Require Backend

The following features will only work with a deployed backend:

1. **Lead capture forms** - Form submissions require `/api/leads` endpoint
2. **Admin interface** - Content editing at `/admin123456789`
3. **CRM integration** - Kommo/AmoCRM synchronization
4. **Content persistence** - Server-side content storage

## Frontend-Only Mode

Without a backend, the application will still function as a static landing page with:
- All content visible
- Form submissions will fail (but show user-friendly messages)
- Admin interface inaccessible
- Content changes won't persist

## Customization

### Content Editing
Edit content in `client/src/lib/contentContext.tsx` or use the admin interface when backend is deployed.

### Styling
- Uses Tailwind CSS with custom theme in `client/src/index.css`
- Color scheme: Navy & Gold for premium branding
- Responsive breakpoints configured

### Images
Replace images in `client/public/` and `attached_assets/` directories.

## License

MIT