const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const Post = require('../src/models/Post');

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/blog_test');
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe('Posts API', () => {
  let postId;

  it('cria um novo post', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: 'Test Title', content: 'Test Content', author: 'Buuu' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Title');
    postId = res.body._id;
  });

  it('retorna todos os posts', async () => {
    const res = await request(app).get('/posts');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('busca post por ID', async () => {
    const res = await request(app).get(`/posts/${postId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(postId);
  });

  it('edita um post existente', async () => {
    const res = await request(app)
      .put(`/posts/${postId}`)
      .send({ title: 'Título Editado', content: 'Novo conteúdo', author: 'Buuu' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Título Editado');
  });

  it('busca posts por termo', async () => {
    const res = await request(app).get('/posts/search?term=Editado');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].title).toBe('Título Editado');
  });

  it('retorna 404 ao buscar post inexistente', async () => {
    const res = await request(app).get('/posts/012345678901234567890123');
    expect(res.statusCode).toBe(404);
  });

  it('exclui um post', async () => {
    const res = await request(app).delete(`/posts/${postId}`);
    expect(res.statusCode).toBe(204);
  });

  it('retorna 404 ao deletar post já excluído', async () => {
    const res = await request(app).delete(`/posts/${postId}`);
    expect(res.statusCode).toBe(404);
  });

  it('retorna 400 ao criar post sem campos obrigatórios', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: '', content: '', author: '' });
    expect(res.statusCode).toBe(400);
  });
});
