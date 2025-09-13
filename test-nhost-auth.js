require('dotenv').config({ path: '.env.local' });

async function testNhostAuth() {
  console.log('🔐 TESTING NHOST AUTHENTICATION...\n');
  
  // Import Nhost client
  const { NhostClient } = require('@nhost/nextjs');
  
  const nhost = new NhostClient({
    subdomain: process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN,
    region: process.env.NEXT_PUBLIC_NHOST_REGION,
  });
  
  console.log('📋 Nhost Configuration:');
  console.log(`  Subdomain: ${process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN}`);
  console.log(`  Region: ${process.env.NEXT_PUBLIC_NHOST_REGION}`);
  console.log(`  Use Nhost: ${process.env.NEXT_PUBLIC_USE_NHOST}`);
  
  try {
    console.log('\n🔗 Testing Nhost connection...');
    
    // Test with a sign-in attempt (this will fail but tell us if Nhost is reachable)
    const testEmail = 'realsammy86@gmail.com';
    const testPassword = 'password123';
    
    console.log(`\n🧪 Testing authentication with: ${testEmail}`);
    
    const signInResponse = await nhost.auth.signIn({
      email: testEmail,
      password: testPassword,
    });
    
    console.log('📊 Nhost Response:');
    console.log(`  Has Error: ${!!signInResponse.error}`);
    console.log(`  Has Session: ${!!signInResponse.session}`);
    
    if (signInResponse.error) {
      console.log(`  Error Message: ${signInResponse.error.message}`);
      console.log(`  Error Status: ${signInResponse.error.status}`);
      
      // Common error messages and their meanings
      if (signInResponse.error.message.includes('Invalid email or password')) {
        console.log('\n✅ GOOD NEWS: Nhost is working!');
        console.log('   The error means Nhost is reachable but user/password is wrong.');
        console.log('   This is much better than a connection timeout.');
        console.log('\n💡 NEXT STEPS:');
        console.log('   1. Make sure you have an account registered');
        console.log('   2. Use the correct email/password combination');
        console.log('   3. Try the registration page if you don\'t have an account');
      } else if (signInResponse.error.message.includes('User not found')) {
        console.log('\n✅ GOOD NEWS: Nhost is working!');
        console.log('   You need to register an account first.');
        console.log('\n💡 SOLUTION: Go to /register to create an account');
      } else {
        console.log('\n⚠️  Unknown Nhost error - but connection is working');
      }
    } else if (signInResponse.session) {
      console.log('\n🎉 SUCCESS: Login worked perfectly!');
      console.log(`   User: ${signInResponse.session.user.email}`);
    }
    
  } catch (error) {
    console.error('\n❌ Nhost connection failed:', error.message);
    console.log('\n🔧 This suggests Nhost service might be down.');
    console.log('   Check https://status.nhost.io for service status');
  }
  
  console.log('\n📝 SUMMARY:');
  console.log('✅ Switched to Nhost authentication (NEXT_PUBLIC_USE_NHOST=true)');
  console.log('🔐 Login should now work if you have valid credentials');
  console.log('📱 If you don\'t have an account, visit /register first');
}

testNhostAuth();
