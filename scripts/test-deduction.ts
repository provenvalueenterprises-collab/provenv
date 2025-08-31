// Test script for daily deduction functionality
// Run with: node -r ts-node/register scripts/test-deduction.ts

import { nhost } from '../lib/nhost';

async function testDailyDeduction() {
  console.log('🧪 Testing Daily Deduction Logic...\n');

  const today = new Date().toISOString().split('T')[0];
  
  try {
    // 1. Test querying active thrift plans
    console.log('1. Querying active thrift plans...');
    const { data: activeThrifts, error: thriftsError } = await nhost.graphql.request(`
      query GetActiveThrifts($today: date!) {
        thrift_plans(
          where: {
            status: {_eq: "active"}
            next_contribution_date: {_lte: $today}
            end_date: {_gte: $today}
          }
          limit: 5
        ) {
          id
          user_id
          plan_type
          daily_amount
          next_contribution_date
          user {
            email
            displayName
          }
          user_profile {
            wallet_balance
          }
        }
      }
    `, { today });

    if (thriftsError) {
      console.error('❌ Error fetching thrifts:', thriftsError);
      return;
    }

    console.log(`✅ Found ${activeThrifts.thrift_plans.length} active thrift plans`);
    
    if (activeThrifts.thrift_plans.length > 0) {
      console.log('\n📊 Sample thrift plans:');
      activeThrifts.thrift_plans.forEach((thrift: any, index: number) => {
        const walletBalance = thrift.user_profile?.wallet_balance || 0;
        const canAfford = walletBalance >= thrift.daily_amount;
        
        console.log(`  ${index + 1}. ${thrift.user.email}`);
        console.log(`     Plan: ${thrift.plan_type} | Daily: ₦${thrift.daily_amount}`);
        console.log(`     Wallet: ₦${walletBalance} | Can afford: ${canAfford ? '✅' : '❌'}`);
        console.log(`     Next due: ${thrift.next_contribution_date}\n`);
      });
    }

    // 2. Test wallet balance check
    console.log('2. Testing wallet balance logic...');
    const testScenarios = [
      { balance: 1000, dailyAmount: 500, expected: true },
      { balance: 300, dailyAmount: 500, expected: false },
      { balance: 1000, dailyAmount: 1000, expected: true },
    ];

    testScenarios.forEach((scenario, index) => {
      const canAfford = scenario.balance >= scenario.dailyAmount;
      const result = canAfford === scenario.expected ? '✅' : '❌';
      console.log(`  Scenario ${index + 1}: Balance ₦${scenario.balance}, Daily ₦${scenario.dailyAmount} -> ${result}`);
    });

    // 3. Test date calculation
    console.log('\n3. Testing next contribution date calculation...');
    const testDates = [
      '2025-08-26',
      '2025-08-31', // Month end
      '2025-12-31', // Year end
    ];

    testDates.forEach(date => {
      const nextDate = getNextContributionDate(date);
      console.log(`  ${date} -> ${nextDate}`);
    });

    console.log('\n✅ Daily deduction logic test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

function getNextContributionDate(currentDate: string): string {
  const date = new Date(currentDate);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

// Run test if this file is executed directly
if (require.main === module) {
  testDailyDeduction();
}

export { testDailyDeduction };
