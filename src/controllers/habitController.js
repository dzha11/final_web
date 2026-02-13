const Habit = require('../models/Habit');
const Log = require('../models/Log');
const Goal = require('../models/Goal');

// @desc    Create a new habit
// @route   POST /api/habits
// @access  Private
const createHabit = async (req, res, next) => {
  try {
    const habitData = { ...req.body, user: req.user.id };
    const habit = await Habit.create(habitData);
    res.status(201).json({ success: true, message: 'Habit created successfully', habit });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all habits for logged-in user
// @route   GET /api/habits
// @access  Private
const getHabits = async (req, res, next) => {
  try {
    const filter = { user: req.user.id };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const habits = await Habit.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: habits.length, habits });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific habit by ID
// @route   GET /api/habits/:id
// @access  Private
const getHabitById = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }
    res.status(200).json({ success: true, habit });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a specific habit
// @route   PUT /api/habits/:id
// @access  Private
const updateHabit = async (req, res, next) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    const updatedHabit = await Habit.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: 'Habit updated successfully', habit: updatedHabit });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a specific habit (user can delete own; admin can delete any)
// @route   DELETE /api/habits/:id
// @access  Private
const deleteHabit = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, user: req.user.id };

    const habit = await Habit.findOne(query);
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found or not authorized' });
    }

    await Habit.findByIdAndDelete(req.params.id);
    await Log.deleteMany({ habit: req.params.id });
    await Goal.deleteMany({ habit: req.params.id });

    res.status(200).json({ success: true, message: 'Habit deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark habit as done for a specific day
// @route   PUT /api/habits/:id/check
// @access  Private
const checkHabit = async (req, res, next) => {
  try {
    const { day, completed, note, mood } = req.body;
    const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    if (!validDays.includes(day)) {
      return res.status(400).json({ success: false, message: 'Invalid day provided' });
    }

    const habit = await Habit.findOne({ _id: req.params.id, user: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    // Update weekly status
    habit.weeklyStatus[day] = completed;

    // Recalculate streak
    const completedDays = Object.values(habit.weeklyStatus).filter(Boolean).length;
    habit.streak = completedDays;
    if (completedDays > habit.longestStreak) {
      habit.longestStreak = completedDays;
    }

    await habit.save();

    // Log the completion
    if (completed) {
      await Log.create({
        user: req.user.id,
        habit: habit._id,
        note: note || '',
        mood: mood || '',
      });
    } else {
      // Remove log entry for this day if unchecked
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      await Log.findOneAndDelete({
        user: req.user.id,
        habit: habit._id,
        completedAt: { $gte: today },
      });
    }

    res.status(200).json({ success: true, message: 'Habit status updated', habit });
  } catch (error) {
    next(error);
  }
};

// @desc    Get habit statistics
// @route   GET /api/habits/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const habits = await Habit.find({ user: req.user.id, isActive: true });
    const totalHabits = habits.length;
    const totalCompletedToday = habits.filter(h => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const today = days[new Date().getDay()];
      return h.weeklyStatus[today];
    }).length;

    const averageStreak = totalHabits > 0
      ? (habits.reduce((sum, h) => sum + h.streak, 0) / totalHabits).toFixed(1)
      : 0;

    const longestStreak = habits.reduce((max, h) => Math.max(max, h.longestStreak), 0);

    res.status(200).json({
      success: true,
      stats: {
        totalHabits,
        totalCompletedToday,
        completionRateToday: totalHabits > 0 ? Math.round((totalCompletedToday / totalHabits) * 100) : 0,
        averageStreak,
        longestStreak,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createHabit, getHabits, getHabitById, updateHabit, deleteHabit, checkHabit, getStats };
