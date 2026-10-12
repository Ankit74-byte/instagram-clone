import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

import protect from '../middleware/auth.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

const router = express.Router();
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({ storage });

const populatePost = async (postId, userId) => {
  const post = await Post.findById(postId)
    .populate('user', 'username fullName avatar')
    .populate('comments.user', 'username avatar');

  if (!post) return null;
  const liked = post.likes.some((likeId) => likeId.toString() === userId.toString());
  return { ...post.toObject(), liked };
};

router.get('/', protect, async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'username fullName avatar').populate('comments.user', 'username avatar').sort({ createdAt: -1 });

    const withLikeState = posts.map((post) => ({
      ...post.toObject(),
      liked: post.likes.some((likeId) => likeId.toString() === req.user._id.toString()),
    }));

    return res.json(withLikeState);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch posts.' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username fullName avatar')
      .populate('comments.user', 'username avatar')
      .sort({ createdAt: -1 });

    return res.json(posts);
  } catch (error) {
    return res.status(500).json({ message: 'Could not load user posts.' });
  }
});

router.post('/', protect, upload.single('image'), async (req, res) => {
  try {
    const { caption } = req.body;
    let image = req.body.image || '';

    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }

    if (!image && !caption) {
      return res.status(400).json({ message: 'Please add a caption or image.' });
    }

    const post = await Post.create({
      user: req.user._id,
      image: image || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
      caption: caption || '',
    });

    const populated = await post.populate('user', 'username fullName avatar');
    return res.status(201).json({ ...populated.toObject(), liked: false });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Post creation failed.' });
  }
});

router.post('/:id/like', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const likeIndex = post.likes.findIndex((likeId) => likeId.toString() === req.user._id.toString());

    if (likeIndex >= 0) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();
    const updatedPost = await populatePost(post._id, req.user._id);
    return res.json(updatedPost);
  } catch (error) {
    return res.status(500).json({ message: 'Like action failed.' });
  }
});

router.post('/:id/comments', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty.' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    post.comments.push({ user: req.user._id, text: text.trim() });
    await post.save();

    const updatedPost = await Post.findById(post._id).populate('user', 'username fullName avatar').populate('comments.user', 'username avatar');
    return res.json(updatedPost);
  } catch (error) {
    return res.status(500).json({ message: 'Comment failed.' });
  }
});

export default router;
