const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const { authenticateUser } = require('../middleware/auth');
const mongoose = require('mongoose');

// Get all budgets for the user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: 'Failed to fetch budgets' });
  }
});

// Add a new budget
router.post('/add', authenticateUser, async (req, res) => {
  try {
    const { category, amount, period } = req.body;
    
    // Check if budget for this category already exists for the user
    const existingBudget = await Budget.findOne({ 
      user: req.user.id,
      category
    });
    
    if (existingBudget) {
      return res.status(400).json({ error: 'Budget for this category already exists' });
    }
    
    const newBudget = new Budget({
      category,
      amount,
      period: period || 'monthly',
      user: req.user.id,
    });
    
    await newBudget.save();
    res.status(201).json(newBudget);
  } catch (error) {
    console.error('Error creating budget:', error);
    res.status(500).json({ error: 'Failed to create budget' });
  }
});

// Update a budget
router.put('/edit/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, period } = req.body;
    
    const updatedBudget = await Budget.findOneAndUpdate(
      { _id: id, user: req.user.id },
      { amount, period },
      { new: true }
    );
    
    if (!updatedBudget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    res.json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    res.status(500).json({ error: 'Failed to update budget' });
  }
});

// Delete a budget
router.delete('/delete/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBudget = await Budget.findOneAndDelete({ _id: id, user: req.user.id });
    
    if (!deletedBudget) {
      return res.status(404).json({ error: 'Budget not found' });
    }
    
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({ error: 'Failed to delete budget' });
  }
});

// Get budget status (comparison with actual spending)
router.get('/status', authenticateUser, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    
    // Get current month's start and end dates
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    
    // Get spending by category for the current month
    const spending = await mongoose.model('Transaction').aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user.id),
          type: 'expense',
          date: { $gte: startOfMonth, $lte: endOfMonth }
        } 
      },
      { 
        $group: { 
          _id: '$category', 
          totalSpent: { $sum: '$amount' } 
        } 
      }
    ]);
    
    // Combine budget and spending data
    const budgetStatus = budgets.map(budget => {
      const categorySpending = spending.find(item => item._id === budget.category);
      const spent = categorySpending ? categorySpending.totalSpent : 0;
      const remaining = budget.amount - spent;
      const percentage = (spent / budget.amount) * 100;
      
      return {
        _id: budget._id,
        category: budget.category,
        budgetAmount: budget.amount,
        spent,
        remaining,
        percentage,
        status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok'
      };
    });
    
    res.json(budgetStatus);
  } catch (error) {
    console.error('Error fetching budget status:', error);
    res.status(500).json({ error: 'Failed to fetch budget status' });
  }
});

module.exports = router; 