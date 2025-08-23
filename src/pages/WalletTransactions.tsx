import React from 'react';
import Layout from '../components/Layout';

const WalletTransactions = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Wallet Transactions</h1>
          <p className="text-blue-100">
            View all your wallet transactions and payment history.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-600">Wallet transactions interface will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default WalletTransactions;