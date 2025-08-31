// Import cron jobs to ensure they're initialized
// Temporarily commented out to fix build issues
// import '../lib/cron-jobs';

// This file ensures cron jobs are initialized when the application starts
export default function handler(req: any, res: any) {
  res.status(200).json({ message: 'Cron jobs initialization attempted' });
}
