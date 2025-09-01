import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ArrowLeft, Database, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface TestResult {
  timestamp: string;
  environment: {
    useNhost: string | undefined;
    subdomain: string | undefined;
    region: string | undefined;
  };
  connectionTest: { success: boolean; message: string };
  authStatus: {
    isAuthenticated: boolean;
    user: any;
    session: any;
  };
  graphqlTest: { success: boolean; message: string };
  tablesTest: { success: boolean; message: string; data?: any };
  recommendations: string[];
}

const NhostDebugPage = () => {
  const { data: session, status } = useSession();
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const runConnectionTest = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/test-nhost');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test failed');
      console.error('Connection test error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runConnectionTest();
  }, []);

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  const getStatusColor = (success: boolean) => {
    return success ? 'text-green-700 bg-green-50 border-green-200' : 'text-red-700 bg-red-50 border-red-200';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard">
              <button className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
            </Link>
            <div className="flex items-center space-x-4">
              <button
                onClick={runConnectionTest}
                disabled={loading}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Testing...' : 'Run Test'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nhost Connection Debug</h1>
          <p className="text-gray-600">Test and diagnose Nhost database connectivity issues</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Test Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {testResult && (
          <div className="space-y-6">
            {/* Environment Configuration */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="h-6 w-6 mr-2" />
                Environment Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">Use Nhost</h3>
                  <p className="text-gray-600">{testResult.environment.useNhost || 'undefined'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">Subdomain</h3>
                  <p className="text-gray-600">{testResult.environment.subdomain || 'undefined'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900">Region</h3>
                  <p className="text-gray-600">{testResult.environment.region || 'undefined'}</p>
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Connection Test */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  {getStatusIcon(testResult.connectionTest.success)}
                  <span className="ml-2">Connection Test</span>
                </h3>
                <p className={`text-sm p-3 rounded-lg border ${getStatusColor(testResult.connectionTest.success)}`}>
                  {testResult.connectionTest.message}
                </p>
              </div>

              {/* GraphQL Test */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  {getStatusIcon(testResult.graphqlTest.success)}
                  <span className="ml-2">GraphQL Endpoint</span>
                </h3>
                <p className={`text-sm p-3 rounded-lg border ${getStatusColor(testResult.graphqlTest.success)}`}>
                  {testResult.graphqlTest.message}
                </p>
              </div>

              {/* Auth Status */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  {getStatusIcon(testResult.authStatus.isAuthenticated)}
                  <span className="ml-2">Authentication Status</span>
                </h3>
                <div className="space-y-2">
                  <p className={`text-sm p-3 rounded-lg border ${getStatusColor(testResult.authStatus.isAuthenticated)}`}>
                    {testResult.authStatus.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
                  </p>
                  {testResult.authStatus.user && (
                    <p className="text-xs text-gray-600">
                      User: {testResult.authStatus.user.email || 'N/A'}
                    </p>
                  )}
                </div>
              </div>

              {/* Database Tables */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  {getStatusIcon(testResult.tablesTest.success)}
                  <span className="ml-2">Database Tables</span>
                </h3>
                <p className={`text-sm p-3 rounded-lg border ${getStatusColor(testResult.tablesTest.success)}`}>
                  {testResult.tablesTest.message}
                </p>
              </div>
            </div>

            {/* Recommendations */}
            {testResult.recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-6 w-6 mr-2 text-yellow-500" />
                  Recommendations
                </h2>
                <ul className="space-y-2">
                  {testResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Raw Test Data */}
            <details className="bg-white rounded-lg shadow-md p-6">
              <summary className="text-lg font-semibold text-gray-900 cursor-pointer mb-4">
                Raw Test Data (Click to expand)
              </summary>
              <pre className="text-xs bg-gray-50 p-4 rounded-lg overflow-auto">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </div>
  );
};

export default NhostDebugPage;
