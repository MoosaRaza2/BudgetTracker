const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { authenticateUser } = require('../middleware/auth');
const mongoose = require('mongoose');

// Add a new transaction
router.post('/add', authenticateUser, async (req, res) => {
  try {
    const { amount, category, date, notes, type } = req.body;
    const newTransaction = new Transaction({
      amount,
      category,
      date,
      notes,
      type,
      user: req.user.id,
    });
    console.log(newTransaction);
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    console.error('Error saving transaction:', error);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

// Get all transactions for the logged-in user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Edit a transaction
router.put('/edit/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    // Log the body to see what's being received
    console.log('Edit transaction body:', req.body);
    
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true }
    );
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// Delete a transaction
router.delete('/delete/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTransaction = await Transaction.findOneAndDelete({ _id: id, user: req.user.id });
    if (!deletedTransaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Get spending by category
router.get('/spending-by-category', authenticateUser, async (req, res) => {
  try {
    // Get type from query params, default to expense
    const type = req.query.type || 'expense';
    
    const categorySpending = await Transaction.aggregate([
      { 
        $match: { 
          user: new mongoose.Types.ObjectId(req.user.id),
          type: type
        } 
      },
      { $group: { _id: '$category', totalAmount: { $sum: '$amount' } } }
    ]);
    
    res.json(categorySpending.map(item => ({
      category: item._id,
      amount: item.totalAmount
    })));
  } catch (error) {
    console.error('Error fetching category spending:', error);
    res.status(500).json({ error: 'Failed to fetch spending by category' });
  }
});

// Add this new route for balance calculation
router.get('/balance', authenticateUser, async (req, res) => {
  try {
    const result = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { 
        $group: { 
          _id: '$type', 
          total: { $sum: '$amount' } 
        } 
      }
    ]);
    
    // Convert the result to a usable format
    const financialSummary = {
      income: 0,
      expenses: 0,
      balance: 0
    };
    
    result.forEach(item => {
      if (item._id === 'income') {
        financialSummary.income = item.total;
      } else if (item._id === 'expense') {
        financialSummary.expenses = item.total;
      }
    });
    
    financialSummary.balance = financialSummary.income - financialSummary.expenses;
    
    res.json(financialSummary);
  } catch (error) {
    console.error('Error calculating balance:', error);
    res.status(500).json({ error: 'Failed to calculate balance' });
  }
});

module.exports = router; 