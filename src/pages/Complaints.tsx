import React from 'react';
import Layout from '../components/Layout';

const Complaints = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Complaints</h1>
          <p className="text-orange-100">
            Submit and track your complaints and support requests.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-600">Complaints interface will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Complaints;