import React from 'react';
import Layout from '../components/Layout';

const TermsConditions = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Terms & Conditions</h1>
          <p className="text-gray-100">
            Read our terms of service and platform policies.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-600">Terms and conditions content will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default TermsConditions;