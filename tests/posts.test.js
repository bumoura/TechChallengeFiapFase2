// tests/posts.test.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');

const app = require('../src/app');       // deve exportar o express app (sem listen)
const Post = require('../src/models/Post');

let mongo;

describe('Posts API', () => {
  beforeAll(async () => {
    // Aumenta timeout geral dos hooks (útil no primeiro download do Mongo Memory)
    jest.setTimeout(30000);

    // Sobe Mongo em memória e conecta o Mongoose
    mongo = await MongoMemoryServer.create();
    const uri = mongo.getUri();
    await mongoose.connect(uri, {
      dbName: 'blog_test',
    });
  });

  afterEach(async () => {
    // Limpa coleções entre os testes para isolamento
    const collections = await mongoose.connection.db.collections();
    for (const coll of collections) {
      await coll.deleteMany({});
    }
  });

  afterAll(async () => {
    // Derruba DB/conexões com segurança
    if (mongoose.connection?.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await mongoose.disconnect();
    await mongo?.stop();
  });

  test('cria um novo post', async () => {
    const payload = { title: 'Primeiro Post', content: 'Olá mundo', author: 'Buuu' };

    const res = await request(app)
      .post('/posts')
      .send(payload)
      .expect(201);

    expect(res.body).toMatchObject({
      _id: expect.any(String),
      title: 'Primeiro Post',
      content: 'Olá mundo',
      author: 'Buuu',
    });

    const saved = await Post.findById(res.body._id);
    expect(saved).not.toBeNull();
    expect(saved.title).toBe('Primeiro Post');
  });

  test('retorna todos os posts', async () => {
    await Post.create([
      { title: 'A', content: 'a', author: 'x' },
      { title: 'B', content: 'b', author: 'y' },
    ]);

    const res = await request(app).get('/posts').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
    expect(res.body[0]).toHaveProperty('_id');
    expect(res.body[0]).toHaveProperty('title');
  });

  test('busca post por ID', async () => {
    const p = await Post.create({ title: 'Busca por ID', content: 'conteúdo', author: 'z' });

    const res = await request(app).get(`/posts/${p._id}`).expect(200);
    expect(res.body).toMatchObject({
      _id: p._id.toString(),
      title: 'Busca por ID',
      content: 'conteúdo',
      author: 'z',
    });
  });

  test('edita um post existente', async () => {
    const p = await Post.create({ title: 'Antigo', content: 'c1', author: 'z' });

    const res = await request(app)
      .put(`/posts/${p._id}`)
      .send({ title: 'Atualizado', content: 'c2' })
      .expect(200);

    expect(res.body.title).toBe('Atualizado');
    expect(res.body.content).toBe('c2');

    const updated = await Post.findById(p._id);
    expect(updated.title).toBe('Atualizado');
  });

  test('busca posts por termo', async () => {
    await Post.create([
      { title: 'Editado hoje', content: 'aaa', author: 'x' },
      { title: 'Outro post', content: 'bbb', author: 'y' },
    ]);

    // assumindo rota GET /posts/search?term=...
    const res = await request(app).get('/posts/search').query({ term: 'Editado' }).expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].title).toContain('Editado');
  });

  test('retorna 404 ao buscar post inexistente', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app).get(`/posts/${fakeId}`).expect(404);
  });

  test('exclui um post', async () => {
    const p = await Post.create({ title: 'Delete-me', content: 'c', author: 'z' });

    await request(app).delete(`/posts/${p._id}`).expect(204);

    const gone = await Post.findById(p._id);
    expect(gone).toBeNull();
  });

  test('retorna 404 ao deletar post já excluído', async () => {
    const p = await Post.create({ title: 'Vou sumir', content: 'c', author: 'z' });
    await Post.deleteOne({ _id: p._id });

    await request(app).delete(`/posts/${p._id}`).expect(404);
  });

  test('retorna 400 ao criar post sem campos obrigatórios', async () => {
    // Supondo que title e content sejam obrigatórios no schema/rota
    const res = await request(app).post('/posts').send({ title: '' }).expect(400);
    expect(res.body).toHaveProperty('message'); // ex.: { message: 'Campos obrigatórios faltando' }
  });
});
