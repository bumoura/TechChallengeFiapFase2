const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// POST /posts - criar post (deixa validação com o Mongoose)
router.post('/', async (req, res) => {
  try {
    const post = await Post.create(req.body); // title/content são required no schema
    return res.status(201).json(post);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /posts - listar todos
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find();
    return res.json(posts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao buscar posts' });
  }
});

// ⚠️ Coloque /search ANTES de /:id
// GET /posts/search?term=palavra - buscar por termo (title e content)
router.get('/search', async (req, res) => {
  try {
    const term = req.query.term || '';
    const posts = await Post.find({
      $or: [
        { title: new RegExp(term, 'i') },
        { content: new RegExp(term, 'i') },
      ],
    });
    return res.json(posts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao buscar posts' });
  }
});

// GET /posts/:id - buscar por ID
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post não encontrado' });
    return res.json(post);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao buscar post' });
  }
});

// PUT /posts/:id - atualizar (com validação do schema)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // respeita required/min/max etc.
    );
    if (!updated) return res.status(404).json({ message: 'Post não encontrado' });
    return res.json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: 'Erro ao editar post' });
  }
});

// DELETE /posts/:id - excluir
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Post.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Post não encontrado' });
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Erro ao excluir post' });
  }
});

module.exports = router;