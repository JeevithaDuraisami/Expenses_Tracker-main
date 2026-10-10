import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import ExpenseForm from '../components/ExpenseForm';

const EditExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const { data } = await api.get(`/expenses/${id}`);
        setExpense(data.data);
      } catch {
        setError('Expense not found or you do not have permission to edit it.');
      } finally {
        setFetchLoading(false);
      }
    };
    fetchExpense();
  }, [id]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      await api.put(`/expenses/${id}`, formData);
      navigate('/expenses');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update expense. Please try again.');
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="container" style={{ paddingTop: '2rem' }}><div className="spinner" /></div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', maxWidth: '760px' }}>
      <div className="page-header">
        <h1>Edit Expense</h1>
        <Link to="/expenses" className="btn btn-secondary">← Back</Link>
      </div>

      <div className="card">
        {error && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>{error}</div>}
        {expense && (
          <ExpenseForm
            initialData={expense}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Update Expense"
          />
        )}
      </div>
    </div>
  );
};

export default EditExpense;
