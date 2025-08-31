// Test script for email functionality
// Run with: npx ts-node scripts/test-email.ts

import { emailService } from '../lib/email';

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  try {
    console.log('📧 Sending test verification email...');
    await emailService.sendVerificationEmail(
      'realsammy86@gmail.com',
      'test-verification-token-123'
    );
    console.log('✅ Verification email sent successfully!');

    console.log('\n📧 Sending test welcome email...');
    await emailService.sendWelcomeEmail(
      'realsammy86@gmail.com',
      'Test User'
    );
    console.log('✅ Welcome email sent successfully!');

    console.log('\n🎉 All email tests passed!');
  } catch (error) {
    console.error('❌ Email test failed:', error);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  testEmailService();
}

export { testEmailService };
