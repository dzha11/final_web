const express = require('express');
const router = express.Router();
const {
  createGoal,
  getGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  checkGoals,
} = require('../controllers/goalController');
const { protect } = require('../middleware/auth');

// POST /api/goals/check — auto-complete goals (must be before /:id)
router.post('/check', protect, checkGoals);

// POST /api/goals
router.post('/', protect, createGoal);

// GET /api/goals
router.get('/', protect, getGoals);

// GET /api/goals/:id
router.get('/:id', protect, getGoalById);

// PUT /api/goals/:id
router.put('/:id', protect, updateGoal);

// DELETE /api/goals/:id
router.delete('/:id', protect, deleteGoal);

module.exports = router;
