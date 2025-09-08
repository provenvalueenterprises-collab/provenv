const http = require('http');

// Get the payment reference from command line args or use default
const paymentRef = process.argv[2] || '9621168';

const options = {
  hostname: 'localhost',
  port: 3000,
  path: `/api/payments/verify/${paymentRef}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

console.log(`🧪 Testing verification API for payment: ${paymentRef}`);
console.log(`🔗 URL: http://localhost:3000/api/payments/verify/${paymentRef}`);

const req = http.request(options, (res) => {
  console.log(`📊 Status: ${res.statusCode}`);
  console.log(`📋 Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📄 Raw Response:', data);
    try {
      const json = JSON.parse(data);
      console.log('✅ Parsed Response:', JSON.stringify(json, null, 2));
      
      if (json.success && json.verified) {
        console.log('🎉 Payment verification successful!');
      } else {
        console.log('❌ Payment verification failed:', json.message || 'Unknown error');
      }
    } catch (e) {
      console.log('❌ Failed to parse JSON response:', e.message);
    }
  });
});

req.on('error', (e) => {
  console.error(`❌ Request error: ${e.message}`);
});

req.setTimeout(10000, () => {
  console.error('❌ Request timeout after 10 seconds');
  req.abort();
});

req.end();
