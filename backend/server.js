const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const categoryRoutes = require('./routes/categories');
const budgetRoutes = require('./routes/budgets');
const cors = require('cors');
const analyticsRoutes = require('./routes/analytics');
const goalsRoutes = require('./routes/goals');
const userRoutes = require('./routes/users');
const exportRoutes = require('./routes/export');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/export', exportRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 