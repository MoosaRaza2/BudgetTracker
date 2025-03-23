const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const { Parser } = require('json2csv');

// Export transactions
router.get('/transactions', authenticateUser, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build filter
    const filter = { user: req.user.id };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    // Get transactions
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    
    // Define fields for CSV
    const fields = [
      { label: 'Date', value: 'date' },
      { label: 'Type', value: 'type' },
      { label: 'Category', value: 'category' },
      { label: 'Amount', value: 'amount' },
      { label: 'Notes', value: 'notes' }
    ];
    
    // Convert to CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(transactions);
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    
    // Send the CSV data
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting transactions:', error);
    res.status(500).json({ error: 'Failed to export transactions' });
  }
});

// Export budgets
router.get('/budgets', authenticateUser, async (req, res) => {
  try {
    // Get budgets
    const budgets = await Budget.find({ user: req.user.id });
    
    // Define fields for CSV
    const fields = [
      { label: 'Category', value: 'category' },
      { label: 'Amount', value: 'amount' },
      { label: 'Period', value: 'period' },
      { label: 'Created At', value: 'createdAt' }
    ];
    
    // Convert to CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(budgets);
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=budgets.csv');
    
    // Send the CSV data
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting budgets:', error);
    res.status(500).json({ error: 'Failed to export budgets' });
  }
});

// Export goals
router.get('/goals', authenticateUser, async (req, res) => {
  try {
    // Get goals
    const goals = await Goal.find({ user: req.user.id });
    
    // Define fields for CSV
    const fields = [
      { label: 'Title', value: 'title' },
      { label: 'Target Amount', value: 'targetAmount' },
      { label: 'Current Amount', value: 'currentAmount' },
      { label: 'Target Date', value: 'targetDate' },
      { label: 'Category', value: 'category' },
      { label: 'Description', value: 'description' },
      { label: 'Is Completed', value: 'isCompleted' }
    ];
    
    // Convert to CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(goals);
    
    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=goals.csv');
    
    // Send the CSV data
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting goals:', error);
    res.status(500).json({ error: 'Failed to export goals' });
  }
});

module.exports = router; 