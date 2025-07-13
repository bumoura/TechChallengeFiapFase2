const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const Post = require('../src/models/Post');

beforeAll(async () => {
  const mongoUrl = 'mongodb://localhost:27017/blog_test';
  await mongoose.connect(mongoUrl);
});

afterAll(async () => {
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

describe('POST /posts', () => {
  it('cria um novo post', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ title: 'Test Title', content: 'Test Content', author: 'Buuu' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Title');
  });
});