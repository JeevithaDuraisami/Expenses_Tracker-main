import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './Expenses.css';

const CATEGORY_COLORS = {
  Food: '#F59E0B', Travel: '#3B82F6', Rent: '#8B5CF6',
  Shopping: '#EC4899', Entertainment: '#14B8A6', Healthcare: '#EF4444',
  Utilities: '#6366F1', Education: '#10B981', Other: '#94A3B8',
};

const PAYMENT_ICONS = { Cash: '💵', Card: '💳', UPI: '📱', 'Bank Transfer': '🏦', Other: '🔄' };

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const Expenses = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [filters, setFilters] = useState({ category: '', paymentMethod: '', startDate: '', endDate: '' });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchExpenses = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 15, ...filters };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/expenses', { params });
      setExpenses(data.data);
      setPagination(data.pagination);
    } catch {
      setError('Failed to load expenses.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchExpenses(1);
  }, [fetchExpenses]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      setDeleteId(null);
    } catch {
      alert('Failed to delete expense.');
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ category: '', paymentMethod: '', startDate: '', endDate: '' });
  };

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="page-header">
        <h1>My Expenses</h1>
        <Link to="/expenses/add" className="btn btn-primary">+ Add Expense</Link>
      </div>

      {/* Filters */}
      <div className="card filter-card">
        <div className="filters-grid">
          <div className="form-group" style={{ margin: 0 }}>
            <label>Category</label>
            <select name="category" value={filters.category} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {['Food', 'Travel', 'Rent', 'Shopping', 'Entertainment', 'Healthcare', 'Utilities', 'Education', 'Other'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Payment Method</label>
            <select name="paymentMethod" value={filters.paymentMethod} onChange={handleFilterChange}>
              <option value="">All Methods</option>
              {['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>From Date</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>To Date</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          </div>
        </div>
        {Object.values(filters).some(Boolean) && (
          <button className="btn btn-secondary" style={{ marginTop: '0.75rem', fontSize: '0.8125rem' }} onClick={clearFilters}>
            ✕ Clear Filters
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Summary bar */}
      <div className="summary-bar">
        <span>{pagination.total} expense{pagination.total !== 1 ? 's' : ''} found</span>
        {expenses.length > 0 && (
          <span className="total-amount">
            Total: {formatCurrency(expenses.reduce((sum, e) => sum + e.amount, 0))}
          </span>
        )}
      </div>

      {loading ? (
        <div className="spinner" />
      ) : expenses.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <p>No expenses found</p>
          <Link to="/expenses/add" className="btn btn-primary" style={{ marginTop: '1rem' }}>Add Your First Expense</Link>
        </div>
      ) : (
        <>
          <div className="expense-list">
            {expenses.map((expense) => (
              <div className="expense-item card" key={expense._id}>
                <div className="expense-icon" style={{ background: `${CATEGORY_COLORS[expense.category]}22`, color: CATEGORY_COLORS[expense.category] }}>
                  {getCategoryIcon(expense.category)}
                </div>
                <div className="expense-info">
                  <div className="expense-top">
                    <span className="expense-category">{expense.category}</span>
                    <span className="expense-amount">{formatCurrency(expense.amount)}</span>
                  </div>
                  <div className="expense-bottom">
                    <span>{PAYMENT_ICONS[expense.paymentMethod]} {expense.paymentMethod}</span>
                    <span>·</span>
                    <span>{new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    {expense.description && <><span>·</span><span className="expense-desc">{expense.description}</span></>}
                  </div>
                </div>
                <div className="expense-actions">
                  <button className="action-btn edit-btn" onClick={() => navigate(`/expenses/edit/${expense._id}`)} title="Edit">✏️</button>
                  <button className="action-btn delete-btn" onClick={() => setDeleteId(expense._id)} title="Delete">🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <button className="btn btn-secondary" disabled={pagination.page === 1} onClick={() => fetchExpenses(pagination.page - 1)}>
                ← Prev
              </button>
              <span>Page {pagination.page} of {pagination.pages}</span>
              <button className="btn btn-secondary" disabled={pagination.page === pagination.pages} onClick={() => fetchExpenses(pagination.page + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Expense</h3>
            <p>Are you sure you want to delete this expense? This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getCategoryIcon = (category) => {
  const icons = { Food: '🍽️', Travel: '✈️', Rent: '🏠', Shopping: '🛍️', Entertainment: '🎬', Healthcare: '🏥', Utilities: '⚡', Education: '📚', Other: '📦' };
  return icons[category] || '📦';
};

export default Expenses;
