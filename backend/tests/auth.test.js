process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:1/knowra_test_only';
process.env.JWT_SECRET = 'jest-only-auth-signing-key';
process.env.JWT_EXPIRES_IN = '15m';

jest.mock('../src/models/User', () => {
  const mongoose = require('mongoose');
  const bcrypt = require('bcryptjs');
  const mockUsers = [];

  const User = {
    mockUsers,
    findOne: jest.fn((filter) => {
      const user = mockUsers.find((entry) => entry.email === filter.email) || null;
      const query = Promise.resolve(user);
      query.select = jest.fn(() => Promise.resolve(user));
      return query;
    }),
    findById: jest.fn(async (id) =>
      mockUsers.find((entry) => entry._id.toString() === id.toString()) || null
    ),
    create: jest.fn(async (values) => {
      const user = {
        _id: new mongoose.Types.ObjectId(),
        ...values,
        password: await bcrypt.hash(values.password, 4),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockUsers.push(user);
      return user;
    }),
  };

  return User;
});

const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('authentication routes', () => {
  beforeEach(() => {
    User.mockUsers.length = 0;
    jest.clearAllMocks();
  });

  test('registers a user without returning the password', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Student',
        email: 'student@example.com',
        password: 'securePass123',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('student@example.com');
    expect(response.body.data).not.toHaveProperty('password');
  });

  test('returns 409 when registering an existing email', async () => {
    const body = {
      name: 'Test Student',
      email: 'student@example.com',
      password: 'securePass123',
    };
    await request(app).post('/api/auth/register').send(body);

    const response = await request(app).post('/api/auth/register').send(body);

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/already registered/i);
  });

  test('logs in and returns a token and password-free user', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Test Student',
      email: 'student@example.com',
      password: 'securePass123',
    });

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'student@example.com', password: 'securePass123' });

    expect(response.status).toBe(200);
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.user.email).toBe('student@example.com');
    expect(response.body.data.user).not.toHaveProperty('password');
  });

  test('returns 401 when current user is requested without a token', async () => {
    const response = await request(app).get('/api/auth/me');

    expect(response.status).toBe(401);
  });
});
