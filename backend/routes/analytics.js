const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const { authenticateUser } = require('../middleware/auth');
const mongoose = require('mongoose');

// Monthly summary (income, expenses, savings)
router.get('/monthly-summary', authenticateUser, async (req, res) => {
  try {
    // Get month and year from query params or use current month
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
    
    // Aggregate transactions for the month
    const result = await Transaction.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: startDate, $lte: endDate }
        } 
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    // Format the response
    const summary = {
      income: 0,
      expenses: 0,
      savings: 0,
      month: targetMonth + 1,
      year: targetYear
    };
    
    result.forEach(item => {
      if (item._id === 'income') {
        summary.income = item.total;
      } else if (item._id === 'expense') {
        summary.expenses = item.total;
      }
    });
    
    summary.savings = summary.income - summary.expenses;
    summary.savingsRate = summary.income > 0 ? (summary.savings / summary.income) * 100 : 0;
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({ error: 'Failed to fetch monthly summary' });
  }
});

// Category breakdown for a specific month
router.get('/category-breakdown', authenticateUser, async (req, res) => {
  try {
    // Get month and year from query params or use current month
    const { month, year, type } = req.query;
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    const transactionType = type || 'expense'; // Default to expense
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
    
    // Aggregate transactions by category
    const breakdown = await Transaction.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user.id),
          type: transactionType,
          date: { $gte: startDate, $lte: endDate }
        } 
      },
      {
        $group: {
          _id: '$category',
          amount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { amount: -1 }
      }
    ]);
    
    // Calculate the total amount for percentage calculations
    const total = breakdown.reduce((sum, item) => sum + item.amount, 0);
    
    // Format the response with percentage
    const formattedBreakdown = breakdown.map(item => ({
      category: item._id,
      amount: item.amount,
      count: item.count,
      percentage: total > 0 ? (item.amount / total) * 100 : 0
    }));
    
    res.json({
      month: targetMonth + 1,
      year: targetYear,
      type: transactionType,
      total,
      categories: formattedBreakdown
    });
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    res.status(500).json({ error: 'Failed to fetch category breakdown' });
  }
});

// Monthly trend for the last 6 months
router.get('/monthly-trend', authenticateUser, async (req, res) => {
  try {
    // Get end month and year from query params or use current month
    const { month, year } = req.query;
    const currentDate = new Date();
    const endYear = year ? parseInt(year) : currentDate.getFullYear();
    const endMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    
    // Calculate start date (6 months ago)
    let startMonth = endMonth - 5;
    let startYear = endYear;
    if (startMonth < 0) {
      startMonth += 12;
      startYear -= 1;
    }
    
    const startDate = new Date(startYear, startMonth, 1);
    const endDate = new Date(endYear, endMonth + 1, 0, 23, 59, 59);
    
    // Aggregate transactions by month
    const result = await Transaction.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: startDate, $lte: endDate }
        } 
      },
      {
        $project: {
          amount: 1,
          type: 1,
          year: { $year: '$date' },
          month: { $month: '$date' }
        }
      },
      {
        $group: {
          _id: { year: '$year', month: '$month', type: '$type' },
          total: { $sum: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);
    
    // Format the response as a monthly array
    const monthlyData = [];
    
    // Initialize with all 6 months
    for (let i = 0; i < 6; i++) {
      let targetMonth = startMonth + i;
      let targetYear = startYear;
      
      if (targetMonth > 11) {
        targetMonth -= 12;
        targetYear += 1;
      }
      
      monthlyData.push({
        year: targetYear,
        month: targetMonth + 1,
        income: 0,
        expenses: 0,
        savings: 0
      });
    }
    
    // Fill in actual data
    result.forEach(item => {
      const monthIndex = monthlyData.findIndex(
        m => m.year === item._id.year && m.month === item._id.month
      );
      
      if (monthIndex !== -1) {
        if (item._id.type === 'income') {
          monthlyData[monthIndex].income = item.total;
        } else if (item._id.type === 'expense') {
          monthlyData[monthIndex].expenses = item.total;
        }
        
        // Calculate savings
        monthlyData[monthIndex].savings = 
          monthlyData[monthIndex].income - monthlyData[monthIndex].expenses;
      }
    });
    
    res.json(monthlyData);
  } catch (error) {
    console.error('Error fetching monthly trend:', error);
    res.status(500).json({ error: 'Failed to fetch monthly trend' });
  }
});

// Budget vs Actual for current month
router.get('/budget-vs-actual', authenticateUser, async (req, res) => {
  try {
    // Get month and year from query params or use current month
    const { month, year } = req.query;
    const currentDate = new Date();
    const targetYear = year ? parseInt(year) : currentDate.getFullYear();
    const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();
    
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
    
    // Get all budgets
    const budgets = await Budget.find({ user: req.user.id });
    
    // Get actual spending by category
    const actualSpending = await Transaction.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user.id),
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        } 
      },
      {
        $group: {
          _id: '$category',
          actual: { $sum: '$amount' }
        }
      }
    ]);
    
    // Combine budget and actual data
    const comparison = budgets.map(budget => {
      const categorySpending = actualSpending.find(item => item._id === budget.category);
      const actualAmount = categorySpending ? categorySpending.actual : 0;
      const difference = budget.amount - actualAmount;
      const percentage = budget.amount > 0 ? (actualAmount / budget.amount) * 100 : 0;
      
      return {
        category: budget.category,
        budgeted: budget.amount,
        actual: actualAmount,
        difference,
        percentage,
        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok'
      };
    });
    
    res.json({
      month: targetMonth + 1,
      year: targetYear,
      comparison
    });
  } catch (error) {
    console.error('Error fetching budget comparison:', error);
    res.status(500).json({ error: 'Failed to fetch budget comparison' });
  }
});

module.exports = router; 