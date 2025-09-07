// const mongoose = require('mongoose');

// const PostSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   content: { type: String, required: true },
//   author: { type: String, required: true }
// }, { timestamps: true });

// module.exports = mongoose.model('Post', PostSchema);

// src/models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'O título é obrigatório'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'O conteúdo é obrigatório'],
    },
    author: {
      type: String,
      default: 'Anônimo',
    },
  },
  {
    timestamps: true, // cria createdAt e updatedAt automaticamente
  }
);

module.exports = mongoose.model('Post', PostSchema);