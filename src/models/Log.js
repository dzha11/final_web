const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
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
    completedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      maxlength: [300, 'Note cannot exceed 300 characters'],
      default: '',
    },
    mood: {
      type: String,
      enum: ['great', 'good', 'neutral', 'bad', 'terrible', ''],
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Log', logSchema);
