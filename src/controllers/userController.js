const User = require('../models/User');
const Habit = require('../models/Habit');

// @desc    Get logged-in user's profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const habitCount = await Habit.countDocuments({ user: req.user.id, isActive: true });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        createdAt: user.createdAt,
        habitCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { username, email, bio, avatar } = req.body;

    // Check if new email/username conflicts with another user
    if (email) {
      const existing = await User.findOne({ email, _id: { $ne: req.user.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }
    if (username) {
      const existing = await User.findOne({ username, _id: { $ne: req.user.id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Username already taken' });
      }
    }

    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;
    if (bio !== undefined) updateFields.bio = bio;
    if (avatar !== undefined) updateFields.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user.id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};


// @desc    Update a user's role (Admin only)
// @route   PATCH /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Role must be "user" or "admin"' });
    }
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, message: `Role updated to "${role}"`, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, updateProfile, getAllUsers, deleteUser, updateUserRole };
