const Goal = require('../models/Goal');
const Habit = require('../models/Habit');

// @desc    Create a goal for a habit
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res, next) => {
  try {
    const { habitId, title, targetStreak, targetDate, reward } = req.body;

    // Make sure the habit belongs to this user
    const habit = await Habit.findOne({ _id: habitId, user: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    // One active goal per habit
    const existing = await Goal.findOne({ habit: habitId, user: req.user.id, isCompleted: false });
    if (existing) {
      return res.status(400).json({ success: false, message: 'This habit already has an active goal. Complete or delete it first.' });
    }

    const goal = await Goal.create({
      user: req.user.id,
      habit: habitId,
      title,
      targetStreak,
      targetDate: targetDate || undefined,
      reward: reward || '',
    });

    // Auto-check: mark complete if streak already reached
    if (habit.streak >= targetStreak) {
      goal.isCompleted = true;
      goal.completedAt = new Date();
      await goal.save();
    }

    const populated = await goal.populate('habit', 'name icon color streak');
    res.status(201).json({ success: true, message: 'Goal created!', goal: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all goals for the logged-in user
// @route   GET /api/goals
// @access  Private
const getGoals = async (req, res, next) => {
  try {
    const filter = { user: req.user.id };
    if (req.query.completed !== undefined) {
      filter.isCompleted = req.query.completed === 'true';
    }

    const goals = await Goal.find(filter)
      .populate('habit', 'name icon color streak category')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: goals.length, goals });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single goal by ID
// @route   GET /api/goals/:id
// @access  Private
const getGoalById = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id })
      .populate('habit', 'name icon color streak');
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    res.status(200).json({ success: true, goal });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a goal (e.g., change target, mark complete)
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }

    const { title, targetStreak, targetDate, reward, isCompleted } = req.body;
    if (title !== undefined)         goal.title = title;
    if (targetStreak !== undefined)  goal.targetStreak = targetStreak;
    if (targetDate !== undefined)    goal.targetDate = targetDate;
    if (reward !== undefined)        goal.reward = reward;
    if (isCompleted === true && !goal.isCompleted) {
      goal.isCompleted = true;
      goal.completedAt = new Date();
    }

    await goal.save();
    const populated = await goal.populate('habit', 'name icon color streak');
    res.status(200).json({ success: true, message: 'Goal updated', goal: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res, next) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user.id });
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found' });
    }
    await Goal.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Check & auto-complete goals based on current streaks
// @route   POST /api/goals/check
// @access  Private
const checkGoals = async (req, res, next) => {
  try {
    const goals = await Goal.find({ user: req.user.id, isCompleted: false })
      .populate('habit', 'streak');

    let completedCount = 0;
    for (const goal of goals) {
      if (goal.habit && goal.habit.streak >= goal.targetStreak) {
        goal.isCompleted = true;
        goal.completedAt = new Date();
        await goal.save();
        completedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `${completedCount} goal(s) completed!`,
      completedCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createGoal, getGoals, getGoalById, updateGoal, deleteGoal, checkGoals };
