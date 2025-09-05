import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🧪 TEST API: Called at', new Date().toISOString());
  
  const session = await getSession({ req });
  console.log('🧪 TEST API: Session status:', session ? 'EXISTS' : 'NULL');
  
  if (session) {
    console.log('🧪 TEST API: User email:', session.user?.email);
    console.log('🧪 TEST API: User ID:', (session.user as any)?.id);
  }

  return res.status(200).json({
    message: 'Test API working',
    hasSession: !!session,
    userEmail: session?.user?.email || null,
    userId: (session?.user as any)?.id || null,
    timestamp: new Date().toISOString()
  });
}
