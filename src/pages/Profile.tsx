import React from 'react';
import Layout from '../components/Layout';

const Profile = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-indigo-100">
            Manage your account information and settings.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-600">Profile management interface will be implemented here.</p>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;