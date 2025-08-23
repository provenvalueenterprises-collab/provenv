import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MyThrifts from './pages/MyThrifts';
import WalletTransactions from './pages/WalletTransactions';
import SettlementAccounts from './pages/SettlementAccounts';
import Complaints from './pages/Complaints';
import Profile from './pages/Profile';
import FundWallet from './pages/FundWallet';
import TermsConditions from './pages/TermsConditions';
import PlanSelection from './pages/PlanSelection';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/plans" element={<PlanSelection />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/admin" element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/thrifts" element={
              <ProtectedRoute>
                <MyThrifts />
              </ProtectedRoute>
            } />
            
            <Route path="/transactions" element={
              <ProtectedRoute>
                <WalletTransactions />
              </ProtectedRoute>
            } />
            
            <Route path="/settlements" element={
              <ProtectedRoute>
                <SettlementAccounts />
              </ProtectedRoute>
            } />
            
            <Route path="/complaints" element={
              <ProtectedRoute>
                <Complaints />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="/fund-wallet" element={
              <ProtectedRoute>
                <FundWallet />
              </ProtectedRoute>
            } />
            
            <Route path="/terms" element={<TermsConditions />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;