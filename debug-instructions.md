# AmoCRM Debug Instructions

I've added instrumentation to debug why AmoCRM integration might not be working. Please follow these steps:

## Reproduction Steps

1. **Clear any existing server processes**:
   - Stop any running servers (Ctrl+C in terminal if running)
   - Make sure port 3000 and 5000 are free

2. **Start the production server with AmoCRM integration**:
   ```bash
   npm run dev
   ```
   This should start both the API server (port 5000) and client (port 3000)

3. **Alternatively, start just the API server**:
   ```bash
   npm run dev:api
   ```
   This starts the server on port 5000

4. **Test the lead submission**:
   - Open your browser to the frontend (usually http://localhost:3000)
   - Submit a lead through the registration form OR
   - Use curl to test:
   ```bash
   curl -X POST http://localhost:5000/api/leads \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "phone": "+998901234567",
       "job": "Developer",
       "source": "registration",
       "utm_source": "google",
       "utm_medium": "cpc"
     }'
   ```

5. **Check the debug endpoint**:
   - Visit: http://localhost:5000/api/debug/amocrm
   - This shows AmoCRM configuration and field mappings

6. **Check server logs**:
   - Look for "=== AMOCRM API REQUEST ===" in terminal logs
   - Look for "=== AMOCRM API RESPONSE ===" in terminal logs
   - Look for any error messages

7. **After testing**, click "Proceed" in the debug UI so I can analyze the logs

## What we're testing:

1. **H1**: Which server is running (production with AmoCRM vs development mock)
2. **H2**: Whether environment variables are set
3. **H3**: Field structure being sent to AmoCRM
4. **H4**: API endpoint configuration
5. **H5**: API response from AmoCRM

The instrumentation logs will be written to `.cursor/debug.log` for analysis.