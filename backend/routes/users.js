const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateUser } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Get the current user's profile
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const { name, email, phone, currency, language } = req.body;
    
    // Check if email already exists for another user
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }
    
    // Build update object
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (currency) updateFields.preferences = { ...updateFields.preferences, currency };
    if (language) updateFields.preferences = { ...updateFields.preferences, language };
    
    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.put('/security/password', authenticateUser, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // Check password complexity
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    // Get user
    const user = await User.findById(req.user.id);
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update notification preferences
router.put('/notifications', authenticateUser, async (req, res) => {
  try {
    const { 
      emailNotifications, 
      budgetAlerts,
      goalReminders,
      weeklyReports
    } = req.body;
    
    // Build update object
    const notificationPreferences = {};
    if (emailNotifications !== undefined) notificationPreferences.emailNotifications = emailNotifications;
    if (budgetAlerts !== undefined) notificationPreferences.budgetAlerts = budgetAlerts;
    if (goalReminders !== undefined) notificationPreferences.goalReminders = goalReminders;
    if (weeklyReports !== undefined) notificationPreferences.weeklyReports = weeklyReports;
    
    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { notificationPreferences } },
      { new: true }
    ).select('-password');
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 