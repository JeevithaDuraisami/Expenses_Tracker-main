const express = require('express');
const { body } = require('express-validator');
const {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules
const expenseValidation = [
  body('amount').isNumeric().withMessage('Amount must be a number').custom((val) => val > 0).withMessage('Amount must be greater than 0'),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['Food', 'Travel', 'Rent', 'Shopping', 'Entertainment', 'Healthcare', 'Utilities', 'Education', 'Other'])
    .withMessage('Invalid category'),
  body('paymentMethod')
    .notEmpty().withMessage('Payment method is required')
    .isIn(['Cash', 'Card', 'UPI', 'Bank Transfer', 'Other'])
    .withMessage('Invalid payment method'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('description').optional().isLength({ max: 200 }).withMessage('Description cannot exceed 200 characters'),
];

// All routes are protected
router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(expenseValidation, createExpense);

router.route('/:id')
  .get(getExpenseById)
  .put(expenseValidation, updateExpense)
  .delete(deleteExpense);

module.exports = router;
