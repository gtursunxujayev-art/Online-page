# Quick Troubleshooting: Leads Not Reaching amoCRM

## Immediate Steps to Diagnose

### 1. Check Environment Variables
```bash
# Make sure these are set in your .env file or deployment
AMOCRM_SUBDOMAIN=yourcompany  # or full URL like https://yourcompany.amocrm.ru
AMOCRM_ACCESS_TOKEN=your_token_here
```

### 2. Run the Test Script
```bash
node test-amoCRM-simple.js
```

This will test:
- ✅ Environment variables are set
- ✅ amoCRM API is accessible  
- ✅ Can create a simple lead

### 3. Check Server Logs
Look for these log messages when submitting a lead:

```
Lead submitted: {...}
Attempting to sync with AmoCRM...
=== SIMPLE APPROACH: Creating basic lead ===
Lead creation - Status: ...
Lead creation - Response: ...
```

### 4. Common Issues

#### Issue: "amoCRM credentials not configured"
**Solution**: Set environment variables

#### Issue: Network error / API not accessible
**Solution**: 
- Check internet connection
- Verify subdomain is correct
- Check access token is valid

#### Issue: "Response status: 401"
**Solution**: Access token is invalid or expired

#### Issue: "Response status: 404"
**Solution**: Wrong subdomain or URL

#### Issue: "Response status: 422"
**Solution**: Invalid data sent to amoCRM API

## Quick Fixes

### If Test Script Works but Website Doesn't:
1. Check which API endpoint your website is using:
   - `api/leads.js` (JavaScript) OR
   - `api/leads/route.ts` (TypeScript)

2. Make sure both files have the same code

### If Nothing Works:
1. **Temporarily disable custom fields** - Use the simple lead creation only
2. **Check field IDs** - They might not match your amoCRM account
3. **Test with curl**:
   ```bash
   curl -X POST "https://YOUR_SUBDOMAIN.amocrm.ru/api/v4/leads" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '[{"name": "Test Lead", "price": 0}]'
   ```

## Field ID Issues

If leads appear but without custom fields, the field IDs are wrong:

### Current Field IDs in Code:
```javascript
PHONE_FIELD_ID = 142993
JOB_FIELD_ID = 142273
```

### To Find Your Correct Field IDs:
1. Login to amoCRM
2. Go to Settings → Custom Fields
3. Find your phone and job fields
4. Note the field IDs
5. Update the code with your IDs

## Emergency Fallback

If you need leads to reach amoCRM immediately:

1. **Edit `api/leads.js`** and comment out custom fields:
   ```javascript
   // Remove or comment these lines:
   // custom_fields_values: [...]
   ```

2. **Create leads with title only** for now
3. **Manually add phone/job** in amoCRM interface
4. **Fix field IDs** when you have time

## Success Indicators

- ✅ Test script creates lead in amoCRM
- ✅ Website shows "Lead submitted successfully"  
- ✅ Logs show "✅ Simple lead created successfully"
- ✅ Lead appears in amoCRM (even without custom fields)

Start with the test script to isolate the issue!