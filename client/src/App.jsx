import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import History from './pages/History';
import Profile from './pages/Profile';
import StockChart from './pages/StockChart';
import Admin from './pages/Admin';
import Users from './pages/Users';
import AllOrders from './pages/AllOrders';
import AllTransactions from './pages/AllTransactions';
import AdminStockChart from './pages/AdminStockChart';
import AuthProtector from './RouteProtectors/AuthProtector';
import LoginProtector from './RouteProtectors/LoginProtector';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />

      <Routes>
        <Route path="" element={<LoginProtector><Landing /></LoginProtector>} />
        <Route path="/" element={<LoginProtector><Landing /></LoginProtector>} />
        <Route path="/home" element={<AuthProtector><Home /></AuthProtector>} />
        <Route path="/portfolio" element={<AuthProtector><Portfolio /></AuthProtector>} />
        <Route path="/history" element={<AuthProtector><History /></AuthProtector>} />
        <Route path="/profile" element={<AuthProtector><Profile /></AuthProtector>} />
        <Route path="/stock/:id" element={<AuthProtector><StockChart /></AuthProtector>} />

        <Route path="/admin" element={<AuthProtector><Admin /></AuthProtector>} />
        <Route path="/users" element={<AuthProtector><Users /></AuthProtector>} />
        <Route path="/all-orders" element={<AuthProtector><AllOrders /></AuthProtector>} />
        <Route path="/all-transactions" element={<AuthProtector><AllTransactions /></AuthProtector>} />
        <Route path="/admin-stock/:id" element={<AuthProtector><AdminStockChart /></AuthProtector>} />
      </Routes>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#131826',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            fontSize: '0.9rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
          },
        }}
      />
    </div>
  );
}

export default App;
