// Simple test to see if server responds
fetch('http://localhost:3001/api/payments/verify/9621168')
  .then(response => {
    console.log('Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Response:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
