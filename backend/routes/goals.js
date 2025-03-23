const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const { authenticateUser } = require('../middleware/auth');
const mongoose = require('mongoose');

// Get all goals for a user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).sort({ targetDate: 1 });
    res.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Get a specific goal by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    res.json(goal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
});

// Create a new goal
router.post('/add', authenticateUser, async (req, res) => {
  try {
    const { title, targetAmount, targetDate, category, description, icon } = req.body;
    
    // Validate required fields
    if (!title || !targetAmount || !targetDate) {
      return res.status(400).json({ error: 'Title, target amount, and target date are required' });
    }
    
    const newGoal = new Goal({
      title,
      targetAmount,
      targetDate,
      category: category || 'General Savings',
      description: description || '',
      icon: icon || 'piggy-bank',
      user: req.user.id
    });
    
    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Update a goal
router.put('/edit/:id', authenticateUser, async (req, res) => {
  try {
    const { title, targetAmount, targetDate, category, description, icon } = req.body;
    
    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { title, targetAmount, targetDate, category, description, icon },
      { new: true }
    );
    
    if (!updatedGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Delete a goal
router.delete('/delete/:id', authenticateUser, async (req, res) => {
  try {
    const deletedGoal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });
    
    if (!deletedGoal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// Add a contribution to a goal
router.post('/:id/contribute', authenticateUser, async (req, res) => {
  try {
    const { amount, note } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid contribution amount is required' });
    }
    
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    // Add the contribution to history
    goal.contributionHistory.push({
      amount,
      note: note || '',
      date: new Date()
    });
    
    // Update current amount
    goal.currentAmount += parseFloat(amount);
    
    // Check if goal is now completed
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }
    
    await goal.save();
    res.json(goal);
  } catch (error) {
    console.error('Error adding contribution:', error);
    res.status(500).json({ error: 'Failed to add contribution' });
  }
});

module.exports = router; 