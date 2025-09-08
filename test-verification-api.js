const axios = require('axios');

async function testVerificationAPI() {
  console.log('🧪 Testing verification API directly...');
  
  try {
    // Test with your successful payment reference
    const reference = '9621168'; // Your payment reference
    const apiUrl = `http://localhost:3001/api/payments/verify/${reference}`;
    
    console.log(`📡 Making request to: ${apiUrl}`);
    
    const response = await axios.get(apiUrl, {
      headers: {
        'Content-Type': 'application/json',
        // Add session cookie if needed for auth
        'Cookie': 'your-session-cookie-here'
      },
      timeout: 30000
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Data:', response.data);
    
  } catch (error) {
    console.error('❌ API Request Error:', error.message);
    if (error.response) {
      console.error('❌ Response Status:', error.response.status);
      console.error('❌ Response Data:', error.response.data);
    }
  }
}

testVerificationAPI();
