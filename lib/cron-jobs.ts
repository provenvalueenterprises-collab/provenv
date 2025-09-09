import cron from 'node-cron';

// Run daily at 6 AM WAT (West Africa Time)
const DAILY_DEDUCTION_SCHEDULE = '0 6 * * *';
const CRON_SECRET_TOKEN = process.env.CRON_SECRET_TOKEN;

if (!CRON_SECRET_TOKEN) {
  console.warn('CRON_SECRET_TOKEN not set. Daily deductions will not run.');
} else {
  console.log('Setting up daily deduction cron job...');
  
  // Schedule daily wallet deduction
  cron.schedule(DAILY_DEDUCTION_SCHEDULE, async () => {
    console.log('Running daily contribution deduction...');
    
    try {
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/cron/daily-contributions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CRON_SECRET_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('Daily contribution deduction completed:', result);
      } else {
        console.error('Daily contribution deduction failed:', result);
      }
    } catch (error) {
      console.error('Error running daily contribution deduction:', error);
    }
  }, {
    timezone: "Africa/Lagos"
  });
  
  console.log('Daily deduction cron job scheduled for 6:00 AM WAT');
}

// Optional: Schedule other maintenance tasks
cron.schedule('0 2 * * *', async () => {
  console.log('Running daily maintenance tasks...');
  
  try {
    // Clean up old verification tokens, sessions, etc.
    // You can add more maintenance tasks here
    console.log('Daily maintenance completed');
  } catch (error) {
    console.error('Error running daily maintenance:', error);
  }
}, {
  timezone: "Africa/Lagos"
});

export {};
