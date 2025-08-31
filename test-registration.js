const http = require('http');

const testData = JSON.stringify({
  name: 'Test User',
  email: 'test@example.com',
  phone: '1234567890',
  password: 'test123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': testData.length
  }
};

console.log('🧪 Testing registration endpoint...');
console.log('📤 Sending request to:', `http://${options.hostname}:${options.port}${options.path}`);
console.log('📝 Test data:', testData);

const req = http.request(options, (res) => {
  console.log('📥 Response status:', res.statusCode);
  console.log('📥 Response headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('📥 Response body:', data);
    try {
      const jsonResponse = JSON.parse(data);
      console.log('📋 Parsed response:', JSON.stringify(jsonResponse, null, 2));
    } catch (e) {
      console.log('❌ Could not parse response as JSON');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(testData);
req.end();
