# amoCRM Integration Troubleshooting Guide

## Problem: Leads not appearing in amoCRM when sending full lead info

### Symptoms
- Website says "successfully sent lead info"
- amoCRM does not show new leads
- Previously worked when only sending lead title (without custom fields)

### Root Cause Analysis
The issue is likely with the custom fields structure in the amoCRM API request. Common problems include:

1. **Invalid field IDs** - Using wrong custom field IDs for your specific amoCRM account
2. **Malformed custom fields structure** - Incorrect JSON structure for custom_fields_values
3. **Required fields missing** - Some fields might be required in your amoCRM pipeline setup
4. **Field type mismatches** - Trying to set wrong data type for a field

## Solution Implemented

We've updated the code to use a **phased approach**:

### Phase 1: Minimal Lead Creation
First, create a lead with only basic information (no custom fields):
```javascript
{
  name: "Заявка с сайта: John Doe",
  price: 0,
  pipeline_id: 12345,
  status_id: 67890
}
```

### Phase 2: Add Phone Field
If Phase 1 succeeds, update the lead with phone field:
```javascript
{
  custom_fields_values: [
    { field_id: 142993, values: [{ value: "+998901234567" }] }
  ]
}
```

### Phase 3: Add Job Field
If Phase 2 succeeds, update with job field:
```javascript
{
  custom_fields_values: [
    { field_id: 142993, values: [{ value: "+998901234567" }] },
    { field_id: 142273, values: [{ value: "Manager" }] }
  ]
}
```

### Alternative Approach
If minimal lead creation fails, try creating lead with phone field only:
```javascript
{
  name: "Заявка с сайта: John Doe",
  price: 0,
  pipeline_id: 12345,
  status_id: 67890,
  custom_fields_values: [
    { field_id: 142993, values: [{ value: "+998901234567" }] }
  ]
}
```

## Debugging Steps

### 1. Check Console Logs
Look for these log messages in your server logs:

```
=== PHASE 1: Testing with minimal lead data ===
Minimal lead test - Status: 200
Minimal lead test - Response: {...}

=== PHASE 2: Adding custom fields ===
Update lead - Status: 200
Update lead - Response: {...}

=== PHASE 3: Adding job field ===
Update job - Status: 200
Update job - Response: {...}
```

### 2. Verify Field IDs
Check if your field IDs match your amoCRM setup:

| Field | Current ID | How to Find Correct ID |
|-------|------------|------------------------|
| Phone | 142993 | Go to amoCRM → Settings → Custom Fields → Contacts |
| Job (Contact) | 142995 | Go to amoCRM → Settings → Custom Fields → Contacts |
| Job (Lead) | 142273 | Go to amoCRM → Settings → Custom Fields → Leads |
| Source | 142271 | Go to amoCRM → Settings → Custom Fields → Leads |

### 3. Test API Directly
Use curl to test the amoCRM API:

```bash
# Test minimal lead creation
curl -X POST "https://YOUR_SUBDOMAIN.amocrm.ru/api/v4/leads" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"name": "Test Lead", "price": 0}]'

# Test with custom fields
curl -X POST "https://YOUR_SUBDOMAIN.amocrm.ru/api/v4/leads" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{"name": "Test Lead", "price": 0, "custom_fields_values": [{"field_id": 142993, "values": [{"value": "+998901234567"}]}]}]'
```

### 4. Check Environment Variables
Ensure these are set correctly:
```bash
AMOCRM_SUBDOMAIN=yourcompany  # or full URL
AMOCRM_ACCESS_TOKEN=your_token_here
AMOCRM_PIPELINE_ID=12345      # optional
AMOCRM_STATUS_ID=67890        # optional
```

## Common Error Messages & Solutions

### "Validation Failed"
- Check field IDs match your amoCRM account
- Verify field types (text, phone, etc.)
- Ensure required fields are provided

### "Invalid custom_fields_values"
- Check JSON structure is correct
- Ensure values array contains objects with "value" property
- Verify field IDs exist in your amoCRM

### "Pipeline not found"
- Check AMOCRM_PIPELINE_ID environment variable
- Verify the pipeline exists in your amoCRM
- User must have access to the pipeline

## Field Mapping Reference

### Current Field Configuration
```javascript
// Contact Fields
PHONE: field_id: 142993
POSITION: field_id: 142995

// Lead Fields  
PHONE: field_id: 142993 (same as contact)
POSITION: field_id: 142273 (different from contact)
SOURCE: field_id: 142271
NOTES: field_id: 142275
```

### To Update Field IDs
Edit `api/leads.js` or `api/leads/route.ts` and change the `field_id` values to match your amoCRM setup.

## Testing the Fix

1. Submit a lead through your website form
2. Check server logs for detailed amoCRM API responses
3. Look in amoCRM for the new lead
4. If it appears, check if custom fields are populated correctly

## Rollback Plan
If the new approach doesn't work, you can revert to the previous version or contact amoCRM support with the API error messages.