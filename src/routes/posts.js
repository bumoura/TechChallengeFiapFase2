const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// GET /posts
router.get('/', async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

// GET /posts/search?term=palavra
router.get('/search', async (req, res) => {
    const term = req.query.term || '';
    const posts = await Post.find({
      $or: [
        { title: new RegExp(term, 'i') },
        { content: new RegExp(term, 'i') }
      ]
    });
    res.json(posts);
  });
  
// GET /posts/:id
router.get('/:id', async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json(post);
});

// POST /posts
router.post('/', async (req, res) => {
  const { title, content, author } = req.body;
  const newPost = new Post({ title, content, author });
  await newPost.save();
  res.status(201).json(newPost);
});

// PUT /posts/:id
router.put('/:id', async (req, res) => {
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (!updatedPost) return res.status(404).json({ error: 'Post not found' });
  res.json(updatedPost);
});

// DELETE /posts/:id
router.delete('/:id', async (req, res) => {
  const deleted = await Post.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Post not found' });
  res.status(204).send();
});

module.exports = router;
