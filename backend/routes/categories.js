const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { authenticateUser } = require('../middleware/auth');

// Get all categories for the logged-in user
router.get('/', authenticateUser, async (req, res) => {
  try {
    const categories = await Category.find({ user: req.user.id });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Add a new category
router.post('/add', authenticateUser, async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = new Category({
      name,
      user: req.user.id,
    });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// Edit a category
router.put('/edit/:id', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id, user: req.user.id },
      req.body,
      { new: true }
    );
    res.json(updatedCategory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

module.exports = router; 