# Development Setup Guide

## 🚀 Running the Development Server

### Option 1: Run Both Servers (Recommended)

**Terminal 1 - API Server:**
```bash
npm run dev:api
```
This starts the API server on `http://localhost:3001`

**Terminal 2 - Frontend Server:**
```bash
npm run dev:client
```
This starts the Vite dev server on `http://localhost:3000`

### Option 2: Single Command (if supported)

```bash
npm run dev
```

## 📡 API Endpoints

- **POST /api/leads** - Submit a lead
- **GET /api/health** - Health check

## 🧪 Testing

1. Open `http://localhost:3000` in your browser
2. Fill out the contact form
3. Check Terminal 1 for API logs
4. Check browser console for any errors

## 🐛 Troubleshooting

### API not responding?
- Make sure API server is running on port 3001
- Check Terminal 1 for errors
- Verify `npm run dev:api` is running

### Form submission fails?
- Open browser console (F12)
- Check for error messages
- Verify API server is running
- Check network tab for failed requests

### Port already in use?
- Change port in `server/dev-api.ts` (line with `PORT = 3001`)
- Or kill the process using the port