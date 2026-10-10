import React, { useEffect, useState } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const CATEGORY_COLORS = {
  Food: '#F59E0B',
  Travel: '#3B82F6',
  Rent: '#8B5CF6',
  Shopping: '#EC4899',
  Entertainment: '#14B8A6',
  Healthcare: '#EF4444',
  Utilities: '#6366F1',
  Education: '#10B981',
  Other: '#94A3B8',
};

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

const StatCard = ({ title, value, subtitle, color }) => (
  <div className="stat-card" style={{ borderTopColor: color }}>
    <p className="stat-title">{title}</p>
    <p className="stat-value">{value}</p>
    {subtitle && <p className="stat-subtitle">{subtitle}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        {label && <p className="tooltip-label">{label}</p>}
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color || '#4F46E5' }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data } = await api.get('/summary/dashboard');
        setStats(data.data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="container" style={{ paddingTop: '2rem' }}><div className="spinner" /></div>;
  if (error) return <div className="container" style={{ paddingTop: '2rem' }}><div className="alert alert-error">{error}</div></div>;

  const pieData = stats.categoryBreakdown.map((item) => ({
    name: item.category,
    value: item.total,
    percentage: item.percentage,
  }));

  const barData = stats.trend.map((item) => ({
    name: item.label,
    Total: item.total,
  }));

  const changePercent = stats.changePercent;
  const changeLabel = changePercent !== null
    ? `${changePercent >= 0 ? '▲' : '▼'} ${Math.abs(changePercent)}% vs last month`
    : 'No data for previous month';

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = monthNames[(stats.currentMonth.month || 1) - 1];

  return (
    <div className="container" style={{ paddingTop: '2rem' }}>
      <div className="page-header">
        <h1>Dashboard</h1>
        <span className="month-badge">{currentMonthName} {stats.currentMonth.year}</span>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Current Month Spending"
          value={formatCurrency(stats.currentMonth.total)}
          subtitle={changeLabel}
          color="#4F46E5"
        />
        <StatCard
          title="Transactions This Month"
          value={stats.currentMonth.count}
          subtitle="Total expense entries"
          color="#10B981"
        />
        <StatCard
          title="Previous Month Total"
          value={formatCurrency(stats.previousMonth.total)}
          subtitle="Last month spending"
          color="#F59E0B"
        />
        <StatCard
          title="Top Category"
          value={stats.categoryBreakdown[0]?.category || '—'}
          subtitle={stats.categoryBreakdown[0] ? formatCurrency(stats.categoryBreakdown[0].total) : 'No data'}
          color="#EF4444"
        />
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        {/* Pie Chart */}
        <div className="card chart-card">
          <h2 className="chart-title">Category Breakdown</h2>
          {pieData.length === 0 ? (
            <div className="no-data">No expenses recorded this month</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  labelLine={false}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar/Line Chart */}
        <div className="card chart-card">
          <h2 className="chart-title">6-Month Spending Trend</h2>
          {barData.length === 0 ? (
            <div className="no-data">No trend data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Total" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Category Table */}
      {stats.categoryBreakdown.length > 0 && (
        <div className="card" style={{ marginTop: '1.5rem' }}>
          <h2 className="chart-title">Category-wise Spending</h2>
          <div className="category-table">
            {stats.categoryBreakdown.map((item) => (
              <div className="category-row" key={item.category}>
                <div className="category-info">
                  <span
                    className="category-dot"
                    style={{ background: CATEGORY_COLORS[item.category] || '#94A3B8' }}
                  />
                  <span className="category-name">{item.category}</span>
                </div>
                <div className="category-bar-wrapper">
                  <div
                    className="category-bar"
                    style={{
                      width: `${item.percentage}%`,
                      background: CATEGORY_COLORS[item.category] || '#94A3B8',
                    }}
                  />
                </div>
                <div className="category-amount">
                  <span>{formatCurrency(item.total)}</span>
                  <span className="category-pct">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
