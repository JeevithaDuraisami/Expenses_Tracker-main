import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import AddExpense from './pages/AddExpense';
import EditExpense from './pages/EditExpense';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main style={{ paddingBottom: '2rem' }}>
                      <Dashboard />
                    </main>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main style={{ paddingBottom: '2rem' }}>
                      <Expenses />
                    </main>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses/add"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main style={{ paddingBottom: '2rem' }}>
                      <AddExpense />
                    </main>
                  </>
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses/edit/:id"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main style={{ paddingBottom: '2rem' }}>
                      <EditExpense />
                    </main>
                  </>
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
