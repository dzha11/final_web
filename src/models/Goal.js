const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    habit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Habit',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Goal title is required'],
      trim: true,
      maxlength: [100, 'Goal title cannot exceed 100 characters'],
    },
    targetStreak: {
      type: Number,
      required: [true, 'Target streak is required'],
      min: [1, 'Target streak must be at least 1'],
    },
    targetDate: {
      type: Date,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    reward: {
      type: String,
      default: '',
      maxlength: [200, 'Reward description cannot exceed 200 characters'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);
