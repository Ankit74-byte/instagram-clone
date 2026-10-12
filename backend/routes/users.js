import express from 'express';
import protect from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

const sanitizeUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  fullName: user.fullName,
  bio: user.bio,
  avatar: user.avatar,
  followers: user.followers?.length || 0,
  following: user.following?.length || 0,
  createdAt: user.createdAt,
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    return res.json(sanitizeUser(user));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch current user.' });
  }
});

router.get('/search/:query', protect, async (req, res) => {
  try {
    const query = req.params.query.trim();
    if (!query) {
      return res.json([]);
    }

    const users = await User.find({
      username: { $regex: query, $options: 'i' },
    }).select('-password').limit(10);

    return res.json(users.map(sanitizeUser));
  } catch (error) {
    return res.status(500).json({ message: 'Search failed.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.json(sanitizeUser(user));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch user.' });
  }
});

router.put('/me', protect, async (req, res) => {
  try {
    const { fullName, bio, avatar, username } = req.body;
    const updates = {};

    if (fullName) updates.fullName = fullName;
    if (bio !== undefined) updates.bio = bio;
    if (avatar) updates.avatar = avatar;
    if (username) {
      const existing = await User.findOne({ username: username.toLowerCase() });
      if (existing && existing._id.toString() !== req.user._id.toString()) {
        return res.status(400).json({ message: 'Username already taken.' });
      }
      updates.username = username.toLowerCase();
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    return res.json(sanitizeUser(user));
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
});

export default router;
