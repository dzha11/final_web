require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const habitRoutes = require('./routes/habitRoutes');
const goalRoutes = require('./routes/goalRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/goals', goalRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Habit Tracker API is running 🚀' });
});

// Serve frontend for all non-API routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

module.exports = app;
