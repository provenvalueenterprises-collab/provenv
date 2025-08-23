import React from 'react';
import Layout from '../components/Layout';

const FundWallet = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Fund Wallet</h1>
          <p className="text-green-100">
            Add money to your wallet using various payment methods.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-600">Wallet funding interface will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default FundWallet;