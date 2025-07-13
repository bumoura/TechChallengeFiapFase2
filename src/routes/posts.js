const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// GET /posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar posts' });
  }
});

// GET /posts/search?term=palavra
router.get('/search', async (req, res) => {
    try {
      const term = req.query.term || '';
      const posts = await Post.find({
        $or: [
          { title: new RegExp(term, 'i') },
          { content: new RegExp(term, 'i') }
        ]
      });
      res.json(posts);
    } catch (err) {
      res.status(500).json({ error: 'Erro ao buscar posts' });
    }
  });

// GET /posts/:id
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar post' });
  }
});

// POST /posts
router.post('/', async (req, res) => {
  try {
    const { title, content, author } = req.body;
    if (!title || !content || !author)
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });

    const newPost = new Post({ title, content, author });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar post' });
  }
});

// PUT /posts/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPost) return res.status(404).json({ error: 'Post not found' });
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao editar post' });
  }
});

// DELETE /posts/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Post not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Erro ao excluir post' });
  }
});

module.exports = router;
