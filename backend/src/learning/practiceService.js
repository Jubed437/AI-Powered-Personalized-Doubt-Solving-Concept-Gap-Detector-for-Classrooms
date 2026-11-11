import { randomUUID } from 'node:crypto';
import { getDatabase } from '../db/client.js';
import { masteryLabel, updateMastery } from './mastery.js';
import { selectNextQuestion } from './adaptive.js';

function assertStudentId(studentId) {
  if (typeof studentId !== 'string' || !/^[a-zA-Z0-9._-]{3,64}$/.test(studentId)) {
    const error = new Error('Student ID must be 3 to 64 letters, numbers, dots, underscores, or hyphens.');
    error.statusCode = 400;
    error.code = 'INVALID_STUDENT_ID';
    error.isOperational = true;
    throw error;
  }
}

function requestError(message, code, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  error.isOperational = true;
  return error;
}

function toPublicQuestion(question) {
  if (!question) return null;
  return {
    id: question._id,
    conceptId: question.conceptId,
    conceptName: question.conceptName,
    difficulty: question.difficulty,
    prompt: question.prompt,
    options: question.options,
  };
}

async function getMasterySnapshot(database, studentId) {
  const attempts = await database.collection('practiceSessions').aggregate([
    { $match: { studentId } },
    { $unwind: '$attempts' },
    { $sort: { 'attempts.createdAt': 1 } },
    {
      $project: {
        _id: 0,
        conceptId: '$attempts.conceptId',
        correct: '$attempts.correct',
        difficulty: '$attempts.difficulty',
        createdAt: '$attempts.createdAt',
      },
    },
  ]).toArray();

  const masteryByConcept = new Map();
  for (const attempt of attempts) {
    const updated = updateMastery(masteryByConcept.get(attempt.conceptId), attempt);
    masteryByConcept.set(attempt.conceptId, {
      ...updated,
      conceptId: attempt.conceptId,
      lastEvidenceAt: attempt.createdAt,
    });
  }

  const concepts = await database.collection('concepts')
    .find({ active: true })
    .sort({ name: 1 })
    .toArray();

  return concepts.map((concept) => {
    const evidence = masteryByConcept.get(concept._id);
    return {
      conceptId: concept._id,
      name: concept.name,
      description: concept.description,
      masteryScore: evidence?.masteryScore ?? 0.5,
      evidenceCount: evidence?.evidenceCount ?? 0,
      correctAttempts: evidence?.correctAttempts ?? 0,
      incorrectAttempts: evidence?.incorrectAttempts ?? 0,
      lastEvidenceAt: evidence?.lastEvidenceAt ?? null,
      label: masteryLabel(evidence),
    };
  });
}

async function getQuestionBank(database) {
  const questions = await database.collection('practiceQuestions')
    .find({ active: true })
    .sort({ conceptId: 1, _id: 1 })
    .toArray();
  const concepts = await database.collection('concepts')
    .find({ active: true }, { projection: { name: 1 } })
    .toArray();
  const namesById = new Map(concepts.map((concept) => [concept._id, concept.name]));

  return questions.map((question) => ({
    ...question,
    id: question._id,
    conceptName: namesById.get(question.conceptId),
  }));
}

async function getNextQuestion(database, masteryRows, usedQuestionIds) {
  const questionBank = await getQuestionBank(database);
  return selectNextQuestion({
    masteries: masteryRows,
    usedQuestionIds,
    questions: questionBank,
  });
}

export async function startPracticeSession({ studentId, displayName }) {
  assertStudentId(studentId);
  if (typeof displayName !== 'string' || !displayName.trim() || displayName.length > 100) {
    throw requestError('A display name of at most 100 characters is required.', 'INVALID_DISPLAY_NAME', 400);
  }

  const database = getDatabase();
  const now = new Date();
  await database.collection('students').updateOne(
    { _id: studentId },
    {
      $set: { displayName: displayName.trim(), updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true },
  );

  const mastery = await getMasterySnapshot(database, studentId);
  const question = await getNextQuestion(database, mastery, []);
  if (!question) {
    throw requestError('No active practice questions are available.', 'QUESTION_BANK_EMPTY', 503);
  }

  const sessionId = randomUUID();
  await database.collection('practiceSessions').insertOne({
    _id: sessionId,
    studentId,
    status: 'active',
    currentQuestionId: question._id,
    usedQuestionIds: [],
    attempts: [],
    createdAt: now,
    completedAt: null,
  });

  return {
    sessionId,
    status: 'active',
    question: toPublicQuestion(question),
    mastery,
  };
}

export async function submitPracticeAttempt({ sessionId, studentId, questionId, answerOptionId }) {
  assertStudentId(studentId);
  if (
    typeof sessionId !== 'string'
    || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sessionId)
    || typeof questionId !== 'string'
    || typeof answerOptionId !== 'string'
    || answerOptionId.length > 10
  ) {
    throw requestError('Session, question, and selected answer are required.', 'INVALID_ATTEMPT', 400);
  }

  const database = getDatabase();
  const sessions = database.collection('practiceSessions');
  const session = await sessions.findOne({ _id: sessionId, studentId, status: 'active' });
  if (!session) {
    throw requestError(
      'Practice session was not found or is no longer active.',
      'PRACTICE_SESSION_NOT_FOUND',
      404,
    );
  }
  if (session.currentQuestionId !== questionId) {
    throw requestError('This question is not the active question for the session.', 'QUESTION_NOT_CURRENT', 409);
  }

  const question = await database.collection('practiceQuestions').findOne({
    _id: questionId,
    active: true,
  });
  if (!question || !question.options.some(({ id }) => id === answerOptionId)) {
    throw requestError('Selected answer is not one of the available options.', 'INVALID_ANSWER_OPTION', 400);
  }

  const isCorrect = answerOptionId === question.correctOptionId;
  const priorMastery = await getMasterySnapshot(database, studentId);
  const conceptMastery = priorMastery.find(({ conceptId }) => conceptId === question.conceptId);
  const updatedMastery = updateMastery(conceptMastery, {
    correct: isCorrect,
    difficulty: question.difficulty,
  });
  const now = new Date();
  const masteryAfterAttempt = priorMastery.map((item) => (
    item.conceptId === question.conceptId
      ? { ...item, ...updatedMastery, lastEvidenceAt: now }
      : item
  ));
  const usedQuestionIds = [...session.usedQuestionIds, questionId];
  const nextQuestion = await getNextQuestion(database, masteryAfterAttempt, usedQuestionIds);
  const attempt = {
    questionId,
    conceptId: question.conceptId,
    answerOptionId,
    correct: isCorrect,
    difficulty: question.difficulty,
    createdAt: now,
  };

  const updateResult = await sessions.updateOne(
    {
      _id: sessionId,
      studentId,
      status: 'active',
      currentQuestionId: questionId,
    },
    {
      $push: { attempts: attempt },
      $addToSet: { usedQuestionIds: questionId },
      $set: {
        currentQuestionId: nextQuestion?._id ?? null,
        status: nextQuestion ? 'active' : 'completed',
        completedAt: nextQuestion ? null : now,
      },
    },
  );

  if (updateResult.modifiedCount !== 1) {
    throw requestError(
      'This question has already been submitted or the session has changed. Refresh the practice session.',
      'QUESTION_ALREADY_SUBMITTED',
      409,
    );
  }

  const concept = await database.collection('concepts').findOne({ _id: question.conceptId });
  const mastery = {
    ...updatedMastery,
    conceptId: question.conceptId,
    lastEvidenceAt: now,
  };

  return {
    correct: isCorrect,
    feedback: question.explanation,
    concept: { id: question.conceptId, name: concept?.name || question.conceptId },
    mastery: { ...mastery, label: masteryLabel(mastery) },
    nextQuestion: nextQuestion ? toPublicQuestion(nextQuestion) : null,
    sessionStatus: nextQuestion ? 'active' : 'completed',
  };
}

export async function getStudentMastery(studentId) {
  assertStudentId(studentId);
  return getMasterySnapshot(getDatabase(), studentId);
}

export async function getKnowledgeGraph(studentId) {
  assertStudentId(studentId);
  const database = getDatabase();
  const [concepts, prerequisiteRows] = await Promise.all([
    getMasterySnapshot(database, studentId),
    database.collection('concepts')
      .find({ active: true }, { projection: { _id: 1, prerequisites: 1 } })
      .toArray(),
  ]);
  return {
    concepts,
    prerequisites: prerequisiteRows.flatMap((concept) => (
      concept.prerequisites.map((prerequisiteId) => ({
        conceptId: concept._id,
        prerequisiteId,
      }))
    )),
  };
}
