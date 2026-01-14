# amoCRM Integration Troubleshooting Guide

## Problem: Leads appear in amoCRM but only with title, no custom fields

### Symptoms
- Leads appear in amoCRM with correct title
- Custom fields (phone, job) are missing
- Website says "successfully sent lead info"

### Root Cause Analysis
The issue is with custom field creation/updates. The lead is created successfully (Phase 1 works), but custom fields are not being set. Possible reasons:

1. **Wrong field IDs** - Using incorrect custom field IDs for your amoCRM account
2. **Incorrect field structure** - Wrong JSON format for custom_fields_values
3. **Field type mismatches** - Phone fields might need `enum_code` property
4. **Update API issues** - PATCH requests might not be working correctly

## New Solution: Multiple Attempt Approach

We've implemented a **4-option approach** that tries different field structures:

### **Option 1: Full fields with enum_code** (Most complete)
```javascript
{
  name: "Заявка с сайта: John Doe",
  price: 0,
  custom_fields_values: [
    { field_id: 142993, values: [{ value: "+998901234567", enum_code: "WORK" }] },
    { field_id: 142273, values: [{ value: "Manager" }] }
  ]
}
```

### **Option 2: Full fields without enum_code** (Simpler)
```javascript
{
  name: "Заявка с сайта: John Doe",
  price: 0,
  custom_fields_values: [
    { field_id: 142993, values: [{ value: "+998901234567" }] },
    { field_id: 142273, values: [{ value: "Manager" }] }
  ]
}
```

### **Option 3: Phone field only, then update**
1. Create lead with phone field only
2. Update lead with job field using PATCH

### **Option 4: Minimal lead (no custom fields)**
Create lead with just name and price (fallback)

## Debugging Steps

### 1. Check Console Logs
Look for these log messages:

```
=== OPTION 1: Creating lead with all fields ===
Lead creation - Status: 200
Lead creation - Response: {...}

=== OPTION 2: Trying without enum_code ===
Simple lead - Status: 200
Simple lead - Response: {...}

=== OPTION 3: Trying with just phone field ===
Phone-only lead - Status: 200
Phone-only lead - Response: {...}

=== Trying to update with job field ===
Update job - Status: 200
Update job - Response: {...}
```

### 2. Identify Which Option Works
- If **Option 1** logs show success → Fields with enum_code work
- If **Option 2** logs show success → Simple field structure works  
- If **Option 3** logs show success → Phone field works, job might need fixing
- If **Option 4** logs show success → Custom fields are the problem

### 3. Verify Field IDs in Your amoCRM
**To find correct field IDs:**

1. **For Phone Field (142993):**
   ```bash
   # API call to get contact custom fields
   GET https://YOUR_SUBDOMAIN.amocrm.ru/api/v4/contacts/custom_fields
   
   # Look for phone field in response
   ```

2. **For Job Field (142273):**
   ```bash
   # API call to get lead custom fields  
   GET https://YOUR_SUBDOMAIN.amocrm.ru/api/v4/leads/custom_fields
   
   # Look for job/position field
   ```

### 4. Test Field IDs Directly
```bash
# Test with your actual field IDs
curl -X POST "https://YOUR_SUBDOMAIN.amocrm.ru/api/v4/leads" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '[{
    "name": "Test Lead",
    "price": 0,
    "custom_fields_values": [
      {"field_id": YOUR_PHONE_FIELD_ID, "values": [{"value": "+998901234567"}]},
      {"field_id": YOUR_JOB_FIELD_ID, "values": [{"value": "Manager"}]}
    ]
  }]'
```

## Common Issues & Solutions

### **Phone Field Not Showing**
- **Problem**: Phone field exists but not populated
- **Solution**: Try adding `enum_code: "WORK"` to phone field values
- **Alternative**: Check if phone field is a "multitext" or "phone" type in amoCRM

### **Job Field Not Showing**
- **Problem**: Job field not appearing in lead
- **Solution**: Verify field ID matches your lead custom fields (not contact fields)
- **Check**: Field might be disabled or have different type in amoCRM

### **"Validation Failed" Errors**
- **Check**: Field IDs exist in your amoCRM account
- **Check**: Field types match (text field vs phone field)
- **Check**: Required fields are provided

### **PATCH Updates Not Working**
- **Issue**: Lead created but updates fail
- **Solution**: Ensure PATCH sends complete `custom_fields_values` array
- **Format**: Must include ALL fields, not just new ones

## Field ID Reference

### **Current Configuration**
```javascript
// These IDs might not match your amoCRM!
PHONE_FIELD_ID = 142993    // Contact/Lead phone field
JOB_FIELD_ID = 142273      // Lead job/position field
```

### **To Update Field IDs**
Edit these files and change the `field_id` values:

1. **`api/leads.js`** - Lines with `field_id: 142993` and `field_id: 142273`
2. **`api/leads/route.ts`** - Same locations

## Quick Fix Checklist

1. **Test a lead submission** - Check which option succeeds in logs
2. **Note the successful option** - See which field structure works
3. **Update field IDs if needed** - Use your actual amoCRM field IDs
4. **Check field types** - Ensure phone/job fields exist in your amoCRM
5. **Verify pipeline access** - User must have access to the pipeline

## If Nothing Works

1. **Contact amoCRM support** with API error messages
2. **Check amoCRM webhooks/logs** for incoming API requests
3. **Test with Postman/curl** to isolate the issue
4. **Consider using amoCRM web forms** as alternative

## Success Indicators

- ✅ Lead appears in amoCRM with correct title
- ✅ Phone number appears in lead custom fields
- ✅ Job/position appears in lead custom fields
- ✅ All data matches form submission

The system will now try 4 different approaches and log which one works, making it easy to identify and fix the exact issue.