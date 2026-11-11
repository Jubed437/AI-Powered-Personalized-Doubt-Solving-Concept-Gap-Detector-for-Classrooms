jest.mock('../src/services/ai.service', () => ({
  analyzeDoubt: jest.fn(),
}));

const request = require('supertest');
const {
  connectTestDb,
  clearTestDb,
  disconnectTestDb,
} = require('./testDb');
const {
  createUser,
  tokenFor,
  createClassroom,
} = require('./helpers');
const Doubt = require('../src/models/Doubt');
const ConceptGap = require('../src/models/ConceptGap');
const aiService = require('../src/services/ai.service');
const { doubtCreationLimiter } = require('../src/middlewares/rateLimiter');
const app = require('../src/app');

beforeAll(connectTestDb);
afterEach(clearTestDb);
afterAll(disconnectTestDb);

describe('doubt routes', () => {
  const analysis = {
    answer: 'A clear explanation.',
    gaps: [{ concept: 'Arrays', severity: 'medium' }],
  };

  const submitDoubt = (token, classroomId, text = 'How does array indexing work?') =>
    request(app)
      .post('/api/doubts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        classroomId: classroomId.toString(),
        subject: 'Computer Science',
        topic: 'Arrays',
        text,
      });

  beforeEach(async () => {
    aiService.analyzeDoubt.mockReset().mockResolvedValue(analysis);
    await doubtCreationLimiter.resetKey('127.0.0.1');
  });

  test('creates a doubt, invokes mocked AI without student identity, and records gaps', async () => {
    const teacher = await createUser({ role: 'teacher' });
    const student = await createUser();
    const classroom = await createClassroom(teacher, [student]);

    const response = await submitDoubt(
      tokenFor(student),
      classroom._id
    );

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('answered');
    expect(response.body.data.aiAnswer).toBe(analysis.answer);
    expect(aiService.analyzeDoubt).toHaveBeenCalledWith({
      subject: 'Computer Science',
      topic: 'Arrays',
      text: 'How does array indexing work?',
    });
    expect(aiService.analyzeDoubt.mock.calls[0][0]).not.toHaveProperty('student');

    const savedDoubt = await Doubt.findById(response.body.data._id);
    expect(savedDoubt.status).toBe('answered');
    expect(savedDoubt.detectedGaps).toHaveLength(1);
    expect(await ConceptGap.countDocuments({ student: student._id })).toBe(1);
  });

  test('does not allow a teacher to create a doubt', async () => {
    const teacher = await createUser({ role: 'teacher' });
    const classroom = await createClassroom(teacher);

    const response = await submitDoubt(tokenFor(teacher), classroom._id);

    expect(response.status).toBe(403);
    expect(await Doubt.countDocuments()).toBe(0);
    expect(aiService.analyzeDoubt).not.toHaveBeenCalled();
  });

  test('blocks students who are not members of the classroom', async () => {
    const teacher = await createUser({ role: 'teacher' });
    const student = await createUser();
    const classroom = await createClassroom(teacher);

    const response = await submitDoubt(tokenFor(student), classroom._id);

    expect(response.status).toBe(403);
    expect(await Doubt.countDocuments()).toBe(0);
    expect(aiService.analyzeDoubt).not.toHaveBeenCalled();
  });

  test('paginates only the requesting student’s doubts', async () => {
    const teacher = await createUser({ role: 'teacher' });
    const student = await createUser();
    const otherStudent = await createUser();
    const classroom = await createClassroom(teacher, [student, otherStudent]);
    const studentToken = tokenFor(student);

    expect((await submitDoubt(studentToken, classroom._id, 'My first doubt')).status).toBe(201);
    expect((await submitDoubt(studentToken, classroom._id, 'My second doubt')).status).toBe(201);
    expect((await submitDoubt(
      tokenFor(otherStudent),
      classroom._id,
      'Another student’s doubt'
    )).status).toBe(201);

    const response = await request(app)
      .get('/api/doubts?page=2&limit=1')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.doubts).toHaveLength(1);
    expect(response.body.data.pagination).toMatchObject({
      page: 2,
      limit: 1,
      total: 2,
      pages: 2,
    });
    expect(response.body.data.doubts[0].student).toBe(student._id.toString());
  });

  test('persists AI failures as failed and permits the owner to retry', async () => {
    const teacher = await createUser({ role: 'teacher' });
    const student = await createUser();
    const classroom = await createClassroom(teacher, [student]);
    aiService.analyzeDoubt
      .mockRejectedValueOnce(new Error('service unavailable'))
      .mockResolvedValueOnce({
        answer: 'Recovered explanation.',
        gaps: [{ concept: 'Arrays', severity: 'low' }],
      });

    const failed = await submitDoubt(tokenFor(student), classroom._id);

    expect(failed.status).toBe(502);
    const savedDoubt = await Doubt.findOne({ student: student._id });
    expect(savedDoubt.status).toBe('failed');

    const retry = await request(app)
      .post(`/api/doubts/${savedDoubt._id}/retry`)
      .set('Authorization', `Bearer ${tokenFor(student)}`);

    expect(retry.status).toBe(200);
    expect(retry.body.data.status).toBe('answered');
    expect(retry.body.data.aiAnswer).toBe('Recovered explanation.');
    expect(aiService.analyzeDoubt).toHaveBeenCalledTimes(2);
  });

  test('does not let another student retry a failed doubt', async () => {
    const teacher = await createUser({ role: 'teacher' });
    const student = await createUser();
    const otherStudent = await createUser();
    const classroom = await createClassroom(teacher, [student]);
    aiService.analyzeDoubt.mockRejectedValueOnce(new Error('service unavailable'));

    await submitDoubt(tokenFor(student), classroom._id);
    const savedDoubt = await Doubt.findOne({ student: student._id });

    const response = await request(app)
      .post(`/api/doubts/${savedDoubt._id}/retry`)
      .set('Authorization', `Bearer ${tokenFor(otherStudent)}`);

    expect(response.status).toBe(403);
    expect(aiService.analyzeDoubt).toHaveBeenCalledTimes(1);
  });
});
