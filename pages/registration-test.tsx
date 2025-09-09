import React, { useState } from 'react';
import Layout from '../components/Layout';
import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/react';

const RegistrationTestPage = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testScenarios = [
    {
      name: 'Phone Only Registration',
      data: {
        name: 'Phone Only User',
        email: '',
        phone: '+2348011111111',
        password: 'testpass123'
      }
    },
    {
      name: 'Email Only Registration',
      data: {
        name: 'Email Only User',
        email: 'emailonly@test.com',
        phone: '',
        password: 'testpass123'
      }
    },
    {
      name: 'Both Phone and Email',
      data: {
        name: 'Full Contact User',
        email: 'full@test.com',
        phone: '+2348022222222',
        password: 'testpass123'
      }
    },
    {
      name: 'Neither Phone nor Email (Should Fail)',
      data: {
        name: 'No Contact User',
        email: '',
        phone: '',
        password: 'testpass123'
      }
    }
  ];

  const runTest = async (scenario: any, index: number) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenario.data),
      });

      const data = await response.json();
      
      const result = {
        scenario: scenario.name,
        success: response.ok,
        status: response.status,
        message: data.message,
        data: response.ok ? data : null,
        timestamp: new Date().toLocaleTimeString()
      };

      setTestResults(prev => [...prev, result]);
      
    } catch (error) {
      const result = {
        scenario: scenario.name,
        success: false,
        status: 0,
        message: 'Network error: ' + (error instanceof Error ? error.message : String(error)),
        data: null,
        timestamp: new Date().toLocaleTimeString()
      };

      setTestResults(prev => [...prev, result]);
    }
    
    setLoading(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🧪 Registration Test Suite
          </h1>
          <p className="text-gray-600 mb-6">
            Test different registration scenarios to verify flexible phone/email registration works correctly.
          </p>
          
          <div className="flex items-center space-x-4 mb-6">
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear Results
            </button>
            <span className="text-sm text-gray-500">
              {testResults.length} test{testResults.length !== 1 ? 's' : ''} completed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {testScenarios.map((scenario, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{scenario.name}</h3>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p><span className="font-medium">Name:</span> {scenario.data.name}</p>
                  <p><span className="font-medium">Email:</span> {scenario.data.email || '(none)'}</p>
                  <p><span className="font-medium">Phone:</span> {scenario.data.phone || '(none)'}</p>
                  <p><span className="font-medium">Password:</span> {scenario.data.password ? '••••••••' : '(none)'}</p>
                </div>
                <button
                  onClick={() => runTest(scenario, index)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Testing...' : 'Run Test'}
                </button>
              </div>
            ))}
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Test Results</h2>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-lg p-4 ${
                      result.success 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{result.scenario}</h3>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {result.success ? '✅ PASS' : '❌ FAIL'}
                        </span>
                        <span className="text-xs text-gray-500">{result.timestamp}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">Status:</span> {result.status}</p>
                      <p><span className="font-medium">Message:</span> {result.message}</p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                            View Response Data
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Expected Results</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm"><strong>Phone Only:</strong> Should succeed - user can register with just phone number</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm"><strong>Email Only:</strong> Should succeed - user can register with just email address</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm"><strong>Both Phone and Email:</strong> Should succeed - user provides both identifiers</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm"><strong>Neither:</strong> Should fail - at least one identifier is required</span>
            </div>
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

export default RegistrationTestPage;
