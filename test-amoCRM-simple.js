// Simple test script for amoCRM integration
// Run this to test if amoCRM API is working

const testAmoCRM = async () => {
  const subdomain = process.env.AMOCRM_SUBDOMAIN;
  const accessToken = process.env.AMOCRM_ACCESS_TOKEN;
  
  if (!subdomain || !accessToken) {
    console.error('❌ amoCRM environment variables not set!');
    console.log('Please set:');
    console.log('  AMOCRM_SUBDOMAIN=yourcompany');
    console.log('  AMOCRM_ACCESS_TOKEN=your_token_here');
    return;
  }
  
  console.log('Testing amoCRM configuration...');
  console.log('Subdomain:', subdomain);
  console.log('Access Token:', accessToken ? '***' + accessToken.slice(-4) : 'NOT SET');
  
  // Extract clean subdomain
  let cleanSubdomain = subdomain;
  if (subdomain.includes('://')) {
    try {
      const url = new URL(subdomain);
      cleanSubdomain = url.hostname.split('.')[0];
      console.log('Clean subdomain:', cleanSubdomain);
    } catch (error) {
      console.error('Error parsing subdomain:', error.message);
    }
  }
  
  // Test 1: Check if we can access amoCRM API
  console.log('\n=== TEST 1: Checking API access ===');
  try {
    const testUrl = `https://${cleanSubdomain}.amocrm.ru/api/v4/account`;
    console.log('Testing URL:', testUrl);
    
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    
    if (response.ok) {
      console.log('✅ amoCRM API is accessible');
      try {
        const data = JSON.parse(responseText);
        console.log('Account info:', {
          id: data.id,
          name: data.name,
          subdomain: data.subdomain
        });
      } catch (e) {
        console.log('Response (text):', responseText.substring(0, 200));
      }
    } else {
      console.error('❌ amoCRM API access failed');
      console.log('Response:', responseText.substring(0, 200));
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
  
  // Test 2: Try to create a simple lead
  console.log('\n=== TEST 2: Creating test lead ===');
  try {
    const leadData = {
      name: `Test Lead ${Date.now()}`,
      price: 0
    };
    
    console.log('Lead data:', JSON.stringify([leadData], null, 2));
    
    const response = await fetch(`https://${cleanSubdomain}.amocrm.ru/api/v4/leads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([leadData])
    });
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    
    if (response.ok) {
      console.log('✅ Lead created successfully');
      try {
        const data = JSON.parse(responseText);
        console.log('Lead ID:', data._embedded?.leads?.[0]?.id);
      } catch (e) {
        console.log('Response:', responseText.substring(0, 200));
      }
    } else {
      console.error('❌ Lead creation failed');
      console.log('Response:', responseText);
    }
  } catch (error) {
    console.error('❌ Error creating lead:', error.message);
  }
  
  console.log('\n=== TEST COMPLETE ===');
};

// Run the test
testAmoCRM().catch(console.error);