const Expense = require('../models/Expense');

// @desc    Get monthly summary (total + category breakdown)
// @route   GET /api/summary/monthly?month=2&year=2026
// @access  Private
const getMonthlySummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetMonth = parseInt(month) || now.getMonth() + 1;
    const targetYear = parseInt(year) || now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    // Total spending
    const totalResult = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Category-wise breakdown
    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    // Payment method breakdown
    const paymentBreakdown = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const totalSpending = totalResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        month: targetMonth,
        year: targetYear,
        totalSpending,
        transactionCount: totalResult[0]?.count || 0,
        categoryBreakdown: categoryBreakdown.map((item) => ({
          category: item._id,
          total: item.total,
          count: item.count,
          percentage: totalSpending > 0 ? ((item.total / totalSpending) * 100).toFixed(1) : '0',
        })),
        paymentBreakdown: paymentBreakdown.map((item) => ({
          method: item._id,
          total: item.total,
          count: item.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get last N months trend data
// @route   GET /api/summary/trend?months=6
// @access  Private
const getMonthlyTrend = async (req, res, next) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const now = new Date();

    const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const trend = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const trendData = trend.map((item) => ({
      year: item._id.year,
      month: item._id.month,
      label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      total: item.total,
      count: item.count,
    }));

    res.json({ success: true, data: trendData });
  } catch (error) {
    next(error);
  }
};

// @desc    Get overall stats for the dashboard
// @route   GET /api/summary/dashboard
// @access  Private
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Current month total
    const [currentMonth, prevMonth] = await Promise.all([
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: currentMonthStart, $lte: currentMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: prevMonthStart, $lte: prevMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    // Current month category breakdown
    const categoryBreakdown = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: currentMonthStart, $lte: currentMonthEnd } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // 6 month trend
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const trend = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: sixMonthsAgo } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentTotal = currentMonth[0]?.total || 0;
    const prevTotal = prevMonth[0]?.total || 0;
    const changePercent = prevTotal > 0 ? (((currentTotal - prevTotal) / prevTotal) * 100).toFixed(1) : null;

    res.json({
      success: true,
      data: {
        currentMonth: {
          total: currentTotal,
          count: currentMonth[0]?.count || 0,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },
        previousMonth: {
          total: prevTotal,
        },
        changePercent: changePercent ? Number(changePercent) : null,
        categoryBreakdown: categoryBreakdown.map((item) => ({
          category: item._id,
          total: item.total,
          count: item.count,
          percentage: currentTotal > 0 ? ((item.total / currentTotal) * 100).toFixed(1) : '0',
        })),
        trend: trend.map((item) => ({
          year: item._id.year,
          month: item._id.month,
          label: `${monthNames[item._id.month - 1]} ${item._id.year}`,
          total: item.total,
          count: item.count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMonthlySummary, getMonthlyTrend, getDashboardStats };
