import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import ExpenseForm from '../components/ExpenseForm';

const AddExpense = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      await api.post('/expenses', formData);
      navigate('/expenses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', maxWidth: '760px' }}>
      <div className="page-header">
        <h1>Add Expense</h1>
        <Link to="/expenses" className="btn btn-secondary">← Back</Link>
      </div>

      <div className="card">
        {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}
        <ExpenseForm onSubmit={handleSubmit} loading={loading} submitLabel="Add Expense" />
      </div>
    </div>
  );
};

export default AddExpense;
