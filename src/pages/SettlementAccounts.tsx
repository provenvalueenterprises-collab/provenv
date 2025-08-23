import React from 'react';
import Layout from '../components/Layout';

const SettlementAccounts = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Settlement Accounts</h1>
          <p className="text-purple-100">
            Track your mature accounts ready for settlement.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-600">Settlement accounts interface will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default SettlementAccounts;