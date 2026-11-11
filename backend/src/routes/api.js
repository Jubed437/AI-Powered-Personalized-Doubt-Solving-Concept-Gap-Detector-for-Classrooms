import express from 'express';
import { randomUUID } from 'node:crypto';
import { analyzeDoubt } from '../ai/workflow.js';
import { getDatabase } from '../db/client.js';
import {
  getKnowledgeGraph,
  getStudentMastery,
  startPracticeSession,
  submitPracticeAttempt,
} from '../learning/practiceService.js';

const router = express.Router();

function badRequest(message) {
  const error = new Error(message);
  error.statusCode = 400;
  error.code = 'INVALID_REQUEST';
  error.isOperational = true;
  return error;
}

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend server is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

router.get('/concepts/graph', async (req, res, next) => {
  try {
    const graph = await getKnowledgeGraph(req.query.studentId);
    res.json({ success: true, data: graph });
  } catch (error) {
    next(error);
  }
});

router.get('/students/:studentId/mastery', async (req, res, next) => {
  try {
    const mastery = await getStudentMastery(req.params.studentId);
    res.json({ success: true, data: mastery });
  } catch (error) {
    next(error);
  }
});

router.post('/practice/sessions', async (req, res, next) => {
  try {
    const session = await startPracticeSession(req.body || {});
    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
});

router.post('/practice/sessions/:sessionId/attempts', async (req, res, next) => {
  try {
    const result = await submitPracticeAttempt({
      ...(req.body || {}),
      sessionId: req.params.sessionId,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

router.get('/doubts', async (req, res, next) => {
  try {
    const doubts = await getDatabase().collection('doubts')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    res.json({
      success: true,
      data: doubts.map(({ _id, ...doubt }) => ({ id: _id, ...doubt })),
    });
  } catch (error) {
    next(error);
  }
});

router.post('/doubts', async (req, res, next) => {
  const { studentName, subject, topic, doubt } = req.body || {};
  if (typeof studentName !== 'string' || !studentName.trim()) {
    return next(badRequest('Student name is required.'));
  }

  if (typeof doubt !== 'string' || !doubt.trim()) {
    return next(badRequest('Doubt text is required.'));
  }
  if (studentName.trim().length > 100 || doubt.trim().length > 2000) {
    return next(badRequest('Student name must be at most 100 characters and doubt at most 2000 characters.'));
  }
  if (
    (subject !== undefined && (typeof subject !== 'string' || subject.length > 100))
    || (topic !== undefined && (typeof topic !== 'string' || topic.length > 100))
  ) {
    return next(badRequest('Subject and topic must be strings of at most 100 characters.'));
  }

  try {
    const request = {
      doubt: doubt.trim(),
      subject: subject?.trim() || 'General',
      topic: topic?.trim() || 'General',
    };
    const analysis = await analyzeDoubt(request);
    const newDoubt = {
      id: randomUUID(),
      studentName: studentName.trim(),
      subject: request.subject,
      topic: request.topic,
      doubt: request.doubt,
      detectedGap: analysis.prerequisiteReview.map(({ name }) => name).join(', ') || null,
      status: 'Resolved',
      createdAt: new Date(),
      ...analysis,
    };
    await getDatabase().collection('doubts').insertOne({
      _id: newDoubt.id,
      ...newDoubt,
    });

    res.status(201).json({
      success: true,
      message: 'Doubt analyzed successfully',
      data: newDoubt,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
