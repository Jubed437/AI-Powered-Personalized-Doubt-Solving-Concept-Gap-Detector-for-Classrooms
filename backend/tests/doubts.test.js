process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:1/knowra_test_only';
process.env.JWT_SECRET = 'jest-only-doubt-signing-key';
process.env.JWT_EXPIRES_IN = '15m';
process.env.AI_API_KEY = 'jest-only-mock-ai-key';
process.env.AI_MODEL = 'jest-only-mock-model';

jest.mock('../src/models/Classroom', () => ({
  findById: jest.fn(),
}));

jest.mock('../src/models/Doubt', () => {
  const mongoose = require('mongoose');
  const mockDoubts = [];

  return {
    mockDoubts,
    create: jest.fn(async (values) => {
      const doubt = {
        _id: new mongoose.Types.ObjectId(),
        ...values,
        aiAnswer: null,
        detectedGaps: [],
        save: jest.fn(async function save() {
          return this;
        }),
      };
      mockDoubts.push(doubt);
      return doubt;
    }),
  };
});

jest.mock('../src/services/ai.service', () => ({
  analyzeDoubt: jest.fn(),
}));

jest.mock('../src/services/gap.service', () => ({
  recordDoubtGaps: jest.fn(),
}));

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../src/app');
const Classroom = require('../src/models/Classroom');
const Doubt = require('../src/models/Doubt');
const aiService = require('../src/services/ai.service');
const gapService = require('../src/services/gap.service');

describe('doubt routes', () => {
  const studentId = new mongoose.Types.ObjectId();
  const teacherId = new mongoose.Types.ObjectId();
  const classroomId = new mongoose.Types.ObjectId();
  let classroom;

  const tokenFor = (id, role) =>
    jwt.sign({ sub: id.toString(), role }, process.env.JWT_SECRET);

  beforeEach(() => {
    jest.clearAllMocks();
    Doubt.mockDoubts.length = 0;
    classroom = {
      _id: classroomId,
      teacher: teacherId,
      students: [studentId],
      subject: 'Computer Science',
    };
    Classroom.findById.mockResolvedValue(classroom);
    aiService.analyzeDoubt.mockResolvedValue({
      answer: 'A clear explanation.',
      gaps: [{ concept: 'Arrays', severity: 'medium' }],
    });
    gapService.recordDoubtGaps.mockResolvedValue([
      { _id: new mongoose.Types.ObjectId() },
    ]);
  });

  test('allows a student to create a doubt and calls the AI service', async () => {
    const response = await request(app)
      .post('/api/doubts')
      .set('Authorization', `Bearer ${tokenFor(studentId, 'student')}`)
      .send({
        classroomId: classroomId.toString(),
        topic: 'Arrays',
        text: 'How does array indexing work?',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.status).toBe('answered');
    expect(response.body.data.aiAnswer).toBe('A clear explanation.');
    expect(aiService.analyzeDoubt).toHaveBeenCalledWith({
      subject: 'Computer Science',
      topic: 'Arrays',
      text: 'How does array indexing work?',
    });
    expect(gapService.recordDoubtGaps).toHaveBeenCalledTimes(1);
    expect(Doubt.mockDoubts).toHaveLength(1);
  });

  test('does not allow a teacher to create a doubt', async () => {
    const response = await request(app)
      .post('/api/doubts')
      .set('Authorization', `Bearer ${tokenFor(teacherId, 'teacher')}`)
      .send({
        classroomId: classroomId.toString(),
        topic: 'Arrays',
        text: 'How does array indexing work?',
      });

    expect(response.status).toBe(403);
    expect(Doubt.create).not.toHaveBeenCalled();
    expect(aiService.analyzeDoubt).not.toHaveBeenCalled();
  });
});
