import { NextApiRequest, NextApiResponse } from 'next';
import { nhost } from '../../../lib/nhost';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Verify the request is from a trusted source (cron job or authenticated admin)
  const authToken = req.headers.authorization;
  if (authToken !== `Bearer ${process.env.CRON_SECRET_TOKEN}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    
    console.log(`Starting daily deduction process for ${today}`);

    // Get all active thrift plans that are due for contribution today
    const { data: activeThrifts, error: thriftsError } = await nhost.graphql.request(`
      query GetActiveThrifts($today: date!) {
        thrift_plans(
          where: {
            status: {_eq: "active"}
            next_contribution_date: {_lte: $today}
            end_date: {_gte: $today}
          }
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
      console.error('Error fetching active thrifts:', thriftsError);
      return res.status(500).json({ message: 'Database error', error: thriftsError });
    }

    const results = [];
    let successCount = 0;
    let failureCount = 0;

    for (const thrift of activeThrifts.thrift_plans) {
      try {
        const walletBalance = thrift.user_profile?.wallet_balance || 0;
        
        if (walletBalance < thrift.daily_amount) {
          // Insufficient funds - mark as missed contribution
          await nhost.graphql.request(`
            mutation CreateMissedContribution(
              $thriftPlanId: uuid!
              $amount: numeric!
              $date: date!
              $reason: String!
            ) {
              insert_contributions_one(object: {
                thrift_plan_id: $thriftPlanId
                amount: $amount
                contribution_date: $date
                status: "failed"
                failure_reason: $reason
                type: "daily"
              }) {
                id
              }
            }
          `, {
            thriftPlanId: thrift.id,
            amount: thrift.daily_amount,
            date: today,
            reason: "Insufficient wallet balance"
          });

          results.push({
            userId: thrift.user_id,
            email: thrift.user.email,
            status: 'failed',
            reason: 'Insufficient funds',
            amount: thrift.daily_amount,
            balance: walletBalance
          });
          
          failureCount++;
          continue;
        }

        // Deduct from wallet and create contribution record
        const { error: deductionError } = await nhost.graphql.request(`
          mutation ProcessDailyContribution(
            $userId: uuid!
            $thriftPlanId: uuid!
            $amount: numeric!
            $date: date!
          ) {
            update_user_profiles(
              where: {user_id: {_eq: $userId}}
              _dec: {wallet_balance: $amount}
            ) {
              affected_rows
            }
            
            insert_contributions_one(object: {
              thrift_plan_id: $thriftPlanId
              amount: $amount
              contribution_date: $date
              status: "completed"
              type: "daily"
            }) {
              id
            }
            
            update_thrift_plans(
              where: {id: {_eq: $thriftPlanId}}
              _set: {
                next_contribution_date: "${getNextContributionDate(today)}"
                total_contributed: {_inc: $amount}
              }
            ) {
              affected_rows
            }
          }
        `, {
          userId: thrift.user_id,
          thriftPlanId: thrift.id,
          amount: thrift.daily_amount,
          date: today
        });

        if (deductionError) {
          console.error(`Error processing contribution for user ${thrift.user_id}:`, deductionError);
          results.push({
            userId: thrift.user_id,
            email: thrift.user.email,
            status: 'error',
            reason: Array.isArray(deductionError) ? deductionError[0]?.message || 'Unknown error' : deductionError?.message || 'Unknown error',
            amount: thrift.daily_amount
          });
          failureCount++;
        } else {
          results.push({
            userId: thrift.user_id,
            email: thrift.user.email,
            status: 'success',
            amount: thrift.daily_amount,
            newBalance: walletBalance - thrift.daily_amount
          });
          successCount++;
        }
      } catch (error) {
        console.error(`Unexpected error processing user ${thrift.user_id}:`, error);
        results.push({
          userId: thrift.user_id,
          email: thrift.user?.email,
          status: 'error',
          reason: error instanceof Error ? error.message : 'Unknown error',
          amount: thrift.daily_amount
        });
        failureCount++;
      }
    }

    // Log the daily deduction summary
    await nhost.graphql.request(`
      mutation LogDailyDeduction(
        $date: date!
        $totalProcessed: Int!
        $successCount: Int!
        $failureCount: Int!
        $totalAmount: numeric!
      ) {
        insert_daily_deduction_logs_one(object: {
          deduction_date: $date
          total_processed: $totalProcessed
          success_count: $successCount
          failure_count: $failureCount
          total_amount: $totalAmount
          details: ${JSON.stringify(results)}
        }) {
          id
        }
      }
    `, {
      date: today,
      totalProcessed: results.length,
      successCount,
      failureCount,
      totalAmount: results.reduce((sum, r) => sum + (r.status === 'success' ? r.amount : 0), 0)
    });

    console.log(`Daily deduction completed: ${successCount} success, ${failureCount} failures`);

    res.status(200).json({
      message: 'Daily deduction completed',
      date: today,
      totalProcessed: results.length,
      successCount,
      failureCount,
      results
    });

  } catch (error) {
    console.error('Daily deduction error:', error);
    res.status(500).json({
      message: 'Failed to process daily deductions',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function getNextContributionDate(currentDate: string): string {
  const date = new Date(currentDate);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}
