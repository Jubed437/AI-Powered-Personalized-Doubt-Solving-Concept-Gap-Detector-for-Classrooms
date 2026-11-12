const request = require('supertest');
const {
  connectTestDb,
  clearTestDb,
  disconnectTestDb,
} = require('./testDb');
const { createUser, tokenFor } = require('./helpers');
const app = require('../src/app');

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(disconnectTestDb);

describe('classroom routes', () => {
  test('allows teachers to create classrooms with a unique six-character code', async () => {
    const teacher = await createUser({ role: 'teacher' });
    const response = await request(app)
      .post('/api/classrooms')
      .set('Authorization', `Bearer ${tokenFor(teacher)}`)
      .send({ name: 'Biology 101', subject: 'Biology' });

    expect(response.status).toBe(201);
    expect(response.body.data.joinCode).toMatch(/^[A-Z0-9]{6}$/);
    expect(response.body.data.teacher).toBe(teacher._id.toString());
  });

  test('does not allow students to create classrooms', async () => {
    const student = await createUser();
    const response = await request(app)
      .post('/api/classrooms')
      .set('Authorization', `Bearer ${tokenFor(student)}`)
      .send({ name: 'Biology 101', subject: 'Biology' });

    expect(response.status).toBe(403);
  });

  test('allows a student to join a classroom by code and rejects duplicate joins', async () => {
    const teacher = await createUser({ role: 'teacher' });
    const student = await createUser();
    const classroom = await request(app)
      .post('/api/classrooms')
      .set('Authorization', `Bearer ${tokenFor(teacher)}`)
      .send({ name: 'Biology 101', subject: 'Biology' });

    expect(classroom.status).toBe(201);

    const join = () =>
      request(app)
        .post('/api/classrooms/join')
        .set('Authorization', `Bearer ${tokenFor(student)}`)
        .send({ joinCode: classroom.body.data.joinCode.toLowerCase() });

    const joined = await join();
    expect(joined.status).toBe(200);
    expect(joined.body.data.students).toContain(student._id.toString());

    const duplicate = await join();
    expect(duplicate.status).toBe(409);
  });
});
