# ProvenValue - NextAuth + Daily Wallet Deduction System

## 🔐 Authentication System

The application now uses **NextAuth.js** for authentication with **Nhost** as the database backend.

### Key Features:
- **NextAuth.js** handles session management
- **Nhost GraphQL** stores user data and profiles
- **Automatic daily wallet deduction** for thrift contributions
- **Secure cron jobs** for automated tasks

## 📊 Database Schema

### Core Tables:
1. **users** - User authentication data
2. **user_profiles** - Extended user information and wallet data
3. **thrift_plans** - User thrift/savings plans
4. **contributions** - Daily contribution records
5. **wallet_transactions** - All wallet activity
6. **daily_deduction_logs** - Audit logs for daily deductions

## ⚡ Daily Deduction System

### How It Works:
1. **Cron Job** runs daily at 6:00 AM WAT
2. Queries all active thrift plans due for contribution
3. Checks user wallet balance
4. Deducts daily amount if sufficient funds
5. Records successful/failed contributions
6. Logs complete process for auditing

### API Endpoints:

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

#### Wallet Management  
- `POST /api/wallet/transactions` - Fund wallet
- `GET /api/wallet/transactions` - Get transaction history

#### Thrift Plans
- `POST /api/thrift/plans` - Create new thrift plan
- `GET /api/thrift/plans` - Get user's thrift plans

#### Cron Jobs
- `POST /api/cron/daily-deduction` - Daily wallet deduction (automated)
- `POST /api/admin/trigger-deduction` - Manual trigger (admin only)

## 🛠️ Setup Instructions

### 1. Environment Variables
Copy `.env.nextauth` to `.env.local`:

```bash
# Nhost Configuration
NEXT_PUBLIC_NHOST_SUBDOMAIN=your-subdomain
NEXT_PUBLIC_NHOST_REGION=your-region

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Cron Job Security
CRON_SECRET_TOKEN=your-secure-cron-token-here

# Email & Payment Configuration
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASSWORD=your-app-password
NEXT_PUBLIC_MONNIFY_API_KEY=your-monnify-api-key
```

### 2. Database Setup
Run the migration in Nhost:

```sql
-- Copy and execute the SQL from supabase/migrations/20250826120000_create_provenvalue_schema.sql
```

### 3. Install Dependencies
```bash
npm install next-auth @next-auth/prisma-adapter prisma @prisma/client bcryptjs node-cron @types/node-cron
```

### 4. Start the Application
```bash
npm run dev
```

## 📅 Daily Deduction Process

### Automated Schedule:
- **Time**: 6:00 AM WAT (West Africa Time)
- **Frequency**: Daily
- **Security**: Protected by `CRON_SECRET_TOKEN`

### Process Flow:
1. **Query Active Plans**
   ```graphql
   query GetActiveThrifts($today: date!) {
     thrift_plans(
       where: {
         status: {_eq: "active"}
         next_contribution_date: {_lte: $today}
         end_date: {_gte: $today}
       }
     ) {
       id, user_id, daily_amount, user_profile { wallet_balance }
     }
   }
   ```

2. **Check Wallet Balance**
   - If sufficient: Deduct amount and record contribution
   - If insufficient: Record failed contribution with reason

3. **Update Records**
   ```graphql
   mutation ProcessDailyContribution {
     update_user_profiles(_dec: {wallet_balance: $amount})
     insert_contributions_one(object: {...})
     update_thrift_plans(_set: {next_contribution_date: $nextDate})
   }
   ```

4. **Log Results**
   - Success count, failure count
   - Total amount processed
   - Detailed results for auditing

## 🔒 Security Features

### Authentication:
- **JWT-based sessions** via NextAuth.js
- **Secure password hashing** with bcryptjs
- **Email verification** required for new accounts

### API Security:
- **Protected routes** with session validation
- **Row Level Security (RLS)** in database
- **Cron job authentication** with secret tokens

### Database Security:
- **User data isolation** via RLS policies
- **Encrypted connections** to Nhost
- **Audit trails** for all transactions

## 📈 Monitoring & Maintenance

### Daily Deduction Monitoring:
- Check `daily_deduction_logs` table
- Review failed contributions
- Monitor wallet balance trends

### Manual Operations:
```bash
# Trigger manual deduction (admin only)
curl -X POST /api/admin/trigger-deduction \
  -H "Authorization: Bearer your-session-token"
```

### Database Maintenance:
- Regular backup of critical tables
- Monitor RLS policy performance
- Clean up old verification tokens

## 🚀 Deployment Considerations

### Production Environment:
1. Set strong `NEXTAUTH_SECRET` and `CRON_SECRET_TOKEN`
2. Configure email service for verification emails
3. Set up payment gateway integration
4. Enable database backups
5. Monitor cron job execution logs

### Scaling:
- Cron jobs run on single instance
- Database queries optimized with indexes
- Consider queue system for high volume

## 📞 Support & Troubleshooting

### Common Issues:
1. **Cron jobs not running**: Check `CRON_SECRET_TOKEN` configuration
2. **Authentication failures**: Verify Nhost connection and user data
3. **Daily deductions failing**: Check wallet balances and plan statuses

### Logs to Check:
- Server console for cron job execution
- Database logs for failed queries
- NextAuth debug logs for authentication issues

This system provides a robust foundation for automated thrift collections with proper security, monitoring, and maintenance capabilities.
