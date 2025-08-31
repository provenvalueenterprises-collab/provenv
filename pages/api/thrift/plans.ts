import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { nhost } from '../../../lib/nhost';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    return handleCreateThriftPlan(req, res, session.user.id);
  } else if (req.method === 'GET') {
    return handleGetThriftPlans(req, res, session.user.id);
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function handleCreateThriftPlan(req: NextApiRequest, res: NextApiResponse, userId: string) {
  const { planType, dailyAmount, startDate } = req.body;

  if (!planType || !dailyAmount || !startDate) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Plan configurations
  const planConfigs: Record<string, { duration: number; interestRate: number }> = {
    basic: { duration: 30, interestRate: 0.05 },
    standard: { duration: 60, interestRate: 0.08 },
    premium: { duration: 90, interestRate: 0.12 }
  };

  const config = planConfigs[planType as string];
  if (!config) {
    return res.status(400).json({ message: 'Invalid plan type' });
  }

  try {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + config.duration);

    const totalAmount = dailyAmount * config.duration;
    const expectedReturn = totalAmount * config.interestRate;
    const maturityAmount = totalAmount + expectedReturn;

    const { data, error } = await nhost.graphql.request(`
      mutation CreateThriftPlan(
        $userId: uuid!
        $planType: String!
        $dailyAmount: numeric!
        $startDate: date!
        $endDate: date!
        $totalAmount: numeric!
        $expectedReturn: numeric!
        $maturityAmount: numeric!
      ) {
        insert_thrift_plans_one(object: {
          user_id: $userId
          plan_type: $planType
          daily_amount: $dailyAmount
          start_date: $startDate
          end_date: $endDate
          next_contribution_date: $startDate
          total_amount: $totalAmount
          expected_return: $expectedReturn
          maturity_amount: $maturityAmount
          total_contributed: 0
          status: "active"
          created_at: "now()"
        }) {
          id
          plan_type
          daily_amount
          start_date
          end_date
          total_amount
          expected_return
          maturity_amount
          status
        }
      }
    `, {
      userId,
      planType,
      dailyAmount: parseFloat(dailyAmount),
      startDate,
      endDate: end.toISOString().split('T')[0],
      totalAmount,
      expectedReturn,
      maturityAmount
    });

    if (error) {
      console.error('Error creating thrift plan:', error);
      return res.status(500).json({ message: 'Failed to create thrift plan' });
    }

    res.status(201).json({
      message: 'Thrift plan created successfully',
      thriftPlan: data.insert_thrift_plans_one
    });

  } catch (error) {
    console.error('Thrift plan creation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleGetThriftPlans(req: NextApiRequest, res: NextApiResponse, userId: string) {
  try {
    const { data, error } = await nhost.graphql.request(`
      query GetUserThriftPlans($userId: uuid!) {
        thrift_plans(
          where: {user_id: {_eq: $userId}}
          order_by: {created_at: desc}
        ) {
          id
          plan_type
          daily_amount
          start_date
          end_date
          next_contribution_date
          total_amount
          total_contributed
          expected_return
          maturity_amount
          status
          created_at
          contributions_aggregate {
            aggregate {
              count
              sum {
                amount
              }
            }
          }
        }
      }
    `, { userId });

    if (error) {
      console.error('Error fetching thrift plans:', error);
      return res.status(500).json({ message: 'Failed to fetch thrift plans' });
    }

    // Calculate progress for each plan
    const thriftPlansWithProgress = data.thrift_plans.map((plan: any) => {
      const contributionCount = plan.contributions_aggregate.aggregate.count || 0;
      const totalContributed = plan.contributions_aggregate.aggregate.sum?.amount || 0;
      const progress = plan.total_amount > 0 ? (totalContributed / plan.total_amount) * 100 : 0;
      
      return {
        ...plan,
        contributionCount,
        totalContributed,
        progress: Math.round(progress * 100) / 100
      };
    });

    res.status(200).json({ thriftPlans: thriftPlansWithProgress });

  } catch (error) {
    console.error('Error fetching thrift plans:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
