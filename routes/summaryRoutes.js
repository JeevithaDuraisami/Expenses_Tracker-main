const express = require('express');
const { getMonthlySummary, getMonthlyTrend, getDashboardStats } = require('../controllers/summaryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All summary routes are protected
router.use(protect);

router.get('/monthly', getMonthlySummary);
router.get('/trend', getMonthlyTrend);
router.get('/dashboard', getDashboardStats);

module.exports = router;
