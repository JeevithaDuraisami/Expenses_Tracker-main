import React, { useState } from 'react';

const CATEGORIES = ['Food', 'Travel', 'Rent', 'Shopping', 'Entertainment', 'Healthcare', 'Utilities', 'Education', 'Other'];
const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other'];

const toInputDate = (dateStr) => {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  return new Date(dateStr).toISOString().split('T')[0];
};

const ExpenseForm = ({ initialData = {}, onSubmit, loading, submitLabel = 'Save Expense' }) => {
  const [formData, setFormData] = useState({
    amount: initialData.amount || '',
    category: initialData.category || '',
    paymentMethod: initialData.paymentMethod || '',
    date: toInputDate(initialData.date),
    description: initialData.description || '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.amount) errs.amount = 'Amount is required';
    else if (isNaN(formData.amount) || Number(formData.amount) <= 0) errs.amount = 'Amount must be a positive number';
    if (!formData.category) errs.category = 'Category is required';
    if (!formData.paymentMethod) errs.paymentMethod = 'Payment method is required';
    if (!formData.date) errs.date = 'Date is required';
    if (formData.description && formData.description.length > 200) errs.description = 'Max 200 characters';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);
    onSubmit({ ...formData, amount: Number(formData.amount) });
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0 1.25rem' }}>
        <div className="form-group">
          <label htmlFor="amount">Amount (₹) *</label>
          <input
            id="amount"
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            className={errors.amount ? 'input-error' : ''}
            placeholder="0.00"
          />
          {errors.amount && <span className="error-text">{errors.amount}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={errors.category ? 'input-error' : ''}
          >
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.category && <span className="error-text">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="paymentMethod">Payment Method *</label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className={errors.paymentMethod ? 'input-error' : ''}
          >
            <option value="">Select method</option>
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          {errors.paymentMethod && <span className="error-text">{errors.paymentMethod}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="date">Date *</label>
          <input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            className={errors.date ? 'input-error' : ''}
          />
          {errors.date && <span className="error-text">{errors.date}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className={errors.description ? 'input-error' : ''}
          placeholder="Add a note about this expense..."
          style={{ resize: 'vertical' }}
        />
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', alignSelf: 'flex-end' }}>
          {formData.description.length}/200
        </span>
        {errors.description && <span className="error-text">{errors.description}</span>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ minWidth: '150px' }}>
        {loading ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
};

export default ExpenseForm;
