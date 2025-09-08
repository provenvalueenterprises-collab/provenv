// Test script to verify phone number registration
const fetch = require('node-fetch');

const testRegistration = async () => {
  const testData = {
    name: "Test User",
    email: "test" + Date.now() + "@example.com",
    phone: "+2348012345678", // Nigerian phone number with country code
    password: "testpassword123",
    referral_code: ""
  };

  console.log('🧪 Testing registration with international phone number:', testData.phone);

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Registration successful!');
      console.log('📱 Phone number stored:', testData.phone);
      console.log('📋 Response:', result);
    } else {
      console.log('❌ Registration failed:', result.message);
    }
  } catch (error) {
    console.error('🚨 Error:', error.message);
  }
};

// Run the test
testRegistration();
