const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Habit name is required'],
      trim: true,
      maxlength: [100, 'Habit name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    category: {
      type: String,
      enum: ['health', 'fitness', 'mindfulness', 'learning', 'productivity', 'social', 'other'],
      default: 'other',
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly'],
      default: 'daily',
    },
    targetDays: {
      type: [String],
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    icon: {
      type: String,
      default: '⭐',
    },
    streak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    weeklyStatus: {
      Mon: { type: Boolean, default: false },
      Tue: { type: Boolean, default: false },
      Wed: { type: Boolean, default: false },
      Thu: { type: Boolean, default: false },
      Fri: { type: Boolean, default: false },
      Sat: { type: Boolean, default: false },
      Sun: { type: Boolean, default: false },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastResetDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Habit', habitSchema);
