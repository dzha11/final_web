const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, getAllUsers, deleteUser, updateUserRole } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { validate, updateProfileSchema } = require('../middleware/validation');

// GET /api/users/profile - Private
router.get('/profile', protect, getProfile);

// PUT /api/users/profile - Private
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);

// GET /api/users - Admin only
router.get('/', protect, authorize('admin'), getAllUsers);

// PATCH /api/users/:id/role - Admin only
router.patch('/:id/role', protect, authorize('admin'), updateUserRole);

// DELETE /api/users/:id - Admin only
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
