# Troubleshooting Form Submission Error

## 🔍 Current Error
"Ma'lumotlarni yuborishda xatolik yuz berdi : Unknown error"

## ✅ Quick Fix Steps

### Step 1: Check if API Server is Running

Open a **new terminal** and run:
```bash
npm run dev:api
```

You should see:
```
📡 Development API server running on http://localhost:3001
   Test: http://localhost:3001/api/health
```

### Step 2: Test API Directly

Open your browser and go to:
```
http://localhost:3001/api/health
```

You should see:
```json
{"status":"ok","timestamp":"2024-..."}
```

If this doesn't work, the API server isn't running!

### Step 3: Check Frontend is Running

In another terminal:
```bash
npm run dev:client
```

Should show:
```
VITE v7.1.12  ready in 784 ms
➜  Local:   http://localhost:3000/
```

### Step 4: Check Browser Console

1. Open browser (F12 or Right-click → Inspect)
2. Go to **Console** tab
3. Submit the form
4. Look for error messages

Common errors:
- `Failed to fetch` → API server not running
- `NetworkError` → Connection refused
- `CORS error` → CORS configuration issue

### Step 5: Check Network Tab

1. Open browser (F12)
2. Go to **Network** tab
3. Submit the form
4. Look for `/api/leads` request
5. Check:
   - **Status**: Should be 200 (green)
   - **Response**: Should show JSON with `success: true`
   - **Request URL**: Should be `http://localhost:3000/api/leads`

## 🐛 Common Issues

### Issue 1: API Server Not Running
**Symptom**: `Failed to fetch` error in console

**Solution**:
```bash
# Terminal 1
npm run dev:api

# Terminal 2  
npm run dev:client
```

### Issue 2: Port Already in Use
**Symptom**: `EADDRINUSE: address already in use :::3001`

**Solution**:
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change port in server/dev-api.ts (line 7)
const PORT = 3002; // Change to different port
```

### Issue 3: Proxy Not Working
**Symptom**: Request goes to wrong URL

**Solution**: Check `vite.config.ts` has proxy configuration:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3001',
    changeOrigin: true,
  },
}
```

### Issue 4: CORS Error
**Symptom**: CORS policy error in console

**Solution**: Already handled in `server/dev-api.ts` with `app.use(cors())`

## 🧪 Manual Test

Test the API directly with curl:
```bash
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","phone":"+998901234567","job":"Developer","source":"test"}'
```

Should return:
```json
{
  "success": true,
  "message": "Lead submitted successfully",
  "leadId": "dev-...",
  "savedLocally": true
}
```

## 📋 Checklist

- [ ] API server running on port 3001
- [ ] Frontend server running on port 3000
- [ ] Can access `http://localhost:3001/api/health`
- [ ] Browser console shows no errors
- [ ] Network tab shows successful `/api/leads` request
- [ ] Form validation passes (name, phone, job filled)

## 💡 Still Not Working?

1. **Check both terminals** - Are both servers running?
2. **Check browser console** - What exact error message?
3. **Check network tab** - What's the response?
4. **Try manual curl test** - Does API work directly?
5. **Restart both servers** - Sometimes helps

## 🆘 Get Help

If still not working, provide:
1. Browser console error (screenshot or copy text)
2. Network tab screenshot
3. Terminal output from both servers
4. Result of `curl http://localhost:3001/api/health`