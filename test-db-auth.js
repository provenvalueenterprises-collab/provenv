// Test direct database authentication
// Run with: node test-db-auth.js

require('dotenv').config({ path: '.env.local' });
const { directDb } = require('./lib/direct-db');

async function testDatabaseAuth() {
  console.log('🧪 Testing Direct Database Authentication...\n');

  try {
    // Test 1: Create a test user
    console.log('1️⃣ Creating test user...');
    const testUser = await directDb.createUser({
      display_name: 'Test User',
      email: 'test@example.com',
      phone_number: '+1234567890',
      phone: '+1234567890',
      password: 'test123'
    });

    if (testUser) {
      console.log('✅ Test user created successfully');
      console.log('   User ID:', testUser.id);
      console.log('   Email:', testUser.email);
    } else {
      console.log('❌ Failed to create test user');
    }

    // Test 2: Find user by email
    console.log('\n2️⃣ Finding user by email...');
    const foundUser = await directDb.findUserByEmail('test@example.com');

    if (foundUser) {
      console.log('✅ User found successfully');
      console.log('   Name:', foundUser.display_name);
      console.log('   Email:', foundUser.email);
      console.log('   Phone:', foundUser.phone);
    } else {
      console.log('❌ User not found');
    }

    // Test 3: Verify password
    console.log('\n3️⃣ Verifying password...');
    const isValidPassword = await directDb.verifyPassword('test@example.com', 'test123');

    if (isValidPassword) {
      console.log('✅ Password verification successful');
    } else {
      console.log('❌ Password verification failed');
    }

    // Test 4: Test wrong password
    console.log('\n4️⃣ Testing wrong password...');
    const isWrongPassword = await directDb.verifyPassword('test@example.com', 'wrongpassword');

    if (!isWrongPassword) {
      console.log('✅ Wrong password correctly rejected');
    } else {
      console.log('❌ Wrong password was accepted (security issue!)');
    }

    console.log('\n🎉 Database authentication tests completed!');

  } catch (error) {
    console.error('❌ Database authentication test failed:', error);
  }
}

testDatabaseAuth().catch(console.error);
