const express = require('express');
const router = express.Router();
const {
  createHabit,
  getHabits,
  getHabitById,
  updateHabit,
  deleteHabit,
  checkHabit,
  getStats,
} = require('../controllers/habitController');
const { protect } = require('../middleware/auth');
const { validate, habitSchema } = require('../middleware/validation');

// GET /api/habits/stats - Private (must come before /:id route)
router.get('/stats', protect, getStats);

// POST /api/habits - Private
router.post('/', protect, validate(habitSchema), createHabit);

// GET /api/habits - Private
router.get('/', protect, getHabits);

// GET /api/habits/:id - Private
router.get('/:id', protect, getHabitById);

// PUT /api/habits/:id - Private
router.put('/:id', protect, updateHabit);

// DELETE /api/habits/:id - Private (admins can delete any, users only their own)
router.delete('/:id', protect, deleteHabit);

// PUT /api/habits/:id/check - Private
router.put('/:id/check', protect, checkHabit);

module.exports = router;
