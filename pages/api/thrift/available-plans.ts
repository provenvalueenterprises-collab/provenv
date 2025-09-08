// pages/api/thrift/available-plans.ts - Get available thrift plans for subscription
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]'
import { Client } from 'pg'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check authentication with retry logic for session timing issues
    let session = await getServerSession(req, res, authOptions)
    console.log('🔑 Available plans - Session check:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      hasEmail: !!session?.user?.email,
      email: session?.user?.email 
    })
    
    if (!session?.user?.email) {
      console.log('❌ Available plans - No valid session found')
      
      // Try to get session one more time in case of timing issue
      const retrySession = await getServerSession(req, res, authOptions)
      if (!retrySession?.user?.email) {
        return res.status(401).json({ 
          error: 'Unauthorized',
          message: 'Please log in to view available plans',
          hint: 'Session may have expired, try refreshing the page'
        })
      }
      
      console.log('✅ Available plans - Session found on retry')
      session = retrySession
    }

    console.log('🔍 Fetching available thrift plans for:', session.user.email)

    // Create PostgreSQL client
    const client = new Client({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: false // Use same connection as working APIs
    })

    await client.connect()

    // Get actual contribution plans from database
    const result = await client.query(`
      SELECT * FROM contribution_plans 
      WHERE is_active = true 
      ORDER BY category, accounts_count;
    `);

    // Group plans by category and remove duplicates
    const plansByCategory: any = {};
    const seenPlans = new Set();

    result.rows.forEach((plan: any) => {
      // Create unique key to avoid duplicates
      const uniqueKey = `${plan.category}_${plan.accounts_count}_${plan.daily_amount}`;
      
      if (!seenPlans.has(uniqueKey)) {
        seenPlans.add(uniqueKey);
        
        if (!plansByCategory[plan.category]) {
          plansByCategory[plan.category] = [];
        }
        
        // Convert database plan to UI format
        const formattedPlan = {
          id: plan.id,
          name: plan.name,
          description: generatePlanDescription(plan),
          plan_type: plan.category,
          duration_months: plan.duration_months,
          accounts_count: plan.accounts_count,
          registration_fee: parseFloat(plan.registration_fee),
          daily_amount: parseFloat(plan.daily_amount),
          total_contribution: parseFloat(plan.total_contribution),
          settlement_amount: parseFloat(plan.settlement_amount),
          features: generatePlanFeatures(plan),
          risk_level: getRiskLevel(plan.category),
          recommended_for: getRecommendedFor(plan.category),
          calculations: {
            totalContribution: parseFloat(plan.total_contribution),
            settlementAmount: parseFloat(plan.settlement_amount),
            profit: parseFloat(plan.settlement_amount) - parseFloat(plan.total_contribution) - parseFloat(plan.registration_fee),
            registrationFee: parseFloat(plan.registration_fee),
            dailyAmount: parseFloat(plan.daily_amount),
            durationDays: plan.duration_months * 30 // Approximate days
          }
        };
        
        plansByCategory[plan.category].push(formattedPlan);
      }
    });

    // Convert to array format for frontend
    const availablePlans: any[] = [];
    Object.values(plansByCategory).forEach((categoryPlans: any) => {
      availablePlans.push(...categoryPlans);
    });

    await client.end()

    console.log('✅ Available thrift plans retrieved:', availablePlans.length)

    res.status(200).json({
      success: true,
      plans: availablePlans,
      plansByCategory
    })

  } catch (error) {
    console.error('❌ Error fetching available thrift plans:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

// Helper functions
function generatePlanDescription(plan: any): string {
  if (plan.category === 'least') {
    return `Starter contribution plan with ₦${Number(plan.daily_amount).toLocaleString()} daily savings. Perfect for beginners building saving habits.`;
  } else if (plan.category === 'medium') {
    return `Balanced contribution plan with ₦${Number(plan.daily_amount).toLocaleString()} daily savings. Ideal for moderate savers.`;
  } else if (plan.category === 'standard') {
    return `Standard contribution plan with ₦${Number(plan.daily_amount).toLocaleString()} daily savings. ${plan.accounts_count} account${plan.accounts_count > 1 ? 's' : ''} for excellent returns.`;
  } else if (plan.category === 'mega') {
    return `Premium mega plan for ${plan.accounts_count} accounts. Maximum growth potential for serious investors.`;
  }
  return `Daily contribution plan with ₦${Number(plan.daily_amount).toLocaleString()} savings target.`;
}

function generatePlanFeatures(plan: any): string[] {
  const features = [
    `₦${Number(plan.registration_fee).toLocaleString()} registration fee`,
    `₦${Number(plan.daily_amount).toLocaleString()} daily contribution`,
    `₦${Number(plan.settlement_amount).toLocaleString()} settlement amount`,
    `${plan.duration_months} months duration`,
  ];

  if (plan.accounts_count > 1) {
    features.push(`${plan.accounts_count} thrift accounts`);
  }

  // Add category-specific features
  if (plan.category === 'least') {
    features.push('Perfect for beginners', 'Low daily commitment', 'Flexible payment options');
  } else if (plan.category === 'medium') {
    features.push('Balanced savings approach', 'Good return on investment', 'Moderate daily commitment');
  } else if (plan.category === 'standard') {
    features.push('Excellent returns', 'Multiple account benefits', 'Priority customer support');
  } else if (plan.category === 'mega') {
    features.push('Premium investment option', 'Maximum account benefits', 'VIP customer support');
  }

  return features;
}

function getRiskLevel(category: string): string {
  switch (category) {
    case 'least': return 'Very Low';
    case 'medium': return 'Low';
    case 'standard': return 'Medium';
    case 'mega': return 'Medium-High';
    default: return 'Low';
  }
}

function getRecommendedFor(category: string): string {
  switch (category) {
    case 'least': return 'First-time savers, Small budget savers';
    case 'medium': return 'Regular savers, Goal-oriented individuals';
    case 'standard': return 'Committed savers, Investment growth';
    case 'mega': return 'Serious investors, High-value portfolios';
    default: return 'General savers';
  }
}
