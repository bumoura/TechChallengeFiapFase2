const express = require('express');
const cors = require('cors');
const postsRouter = require('./routes/posts');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/posts', postsRouter);

app.get('/', (req, res) => {
  res.send('API Blog Fiap - online!');
});

module.exports = app;
