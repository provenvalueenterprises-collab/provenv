import React from 'react';
import Layout from '../components/Layout';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

const MobileDemoPage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🎯 Modern Mobile Dashboard Demo
          </h1>
          <p className="text-gray-600 mb-6">
            This demonstrates the enhanced mobile-first dashboard with modern sidebar functionality:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">📱 Mobile Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Touch-friendly sidebar toggle</li>
                <li>• Smooth slide animations</li>
                <li>• Backdrop blur overlay</li>
                <li>• Auto-close on outside click</li>
                <li>• Body scroll prevention</li>
                <li>• Modern glass morphism design</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">💻 Desktop Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Collapsible sidebar with icons</li>
                <li>• Hover tooltips in collapsed mode</li>
                <li>• Search bar in header</li>
                <li>• Notification badges</li>
                <li>• Smooth transitions</li>
                <li>• Advanced responsive breakpoints</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">🧪 Testing Instructions</h4>
            <p className="text-yellow-700 text-sm">
              On mobile: Tap the hamburger menu (☰) to slide out the sidebar. Tap outside or the X to close.
              On desktop: Click the chevron to collapse/expand the sidebar and see icon-only mode with tooltips.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📊</span>
              </div>
              <h3 className="font-semibold text-gray-900">Analytics</h3>
            </div>
            <p className="text-gray-600 text-sm">Modern dashboard analytics with real-time updates</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🎨</span>
              </div>
              <h3 className="font-semibold text-gray-900">Design</h3>
            </div>
            <p className="text-gray-600 text-sm">Beautiful glassmorphism design with backdrop blur effects</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900">Performance</h3>
            </div>
            <p className="text-gray-600 text-sm">Optimized animations and smooth transitions across devices</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};

export default MobileDemoPage;
