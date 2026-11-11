const ApiError = require('../utils/ApiError');
const Classroom = require('../models/Classroom');
const Doubt = require('../models/Doubt');
const aiService = require('./ai.service');
const gapService = require('./gap.service');
const { listDoubtsSchema } = require('../validations/doubt.validation');

const createDoubt = async (studentId, { classroomId, topic, text }) => {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom) throw new ApiError(404, 'Classroom not found');

  const isMember = classroom.students.some(
    (id) => id.toString() === studentId
  );
  if (!isMember) {
    throw new ApiError(403, 'You must join this classroom before submitting a doubt');
  }

  const doubt = await Doubt.create({
    student: studentId,
    classroom: classroom._id,
    subject: classroom.subject,
    topic,
    text,
    status: 'pending',
  });

  try {
    const analysis = await aiService.analyzeDoubt({
      subject: doubt.subject,
      topic: doubt.topic,
      text: doubt.text,
    });
    const gaps = await gapService.recordDoubtGaps(doubt, analysis.gaps);

    doubt.aiAnswer = analysis.answer;
    doubt.detectedGaps = gaps.map((gap) => gap._id);
    doubt.status = 'answered';
    return await doubt.save();
  } catch (error) {
    doubt.status = 'failed';
    await doubt.save();
    throw error;
  }
};

const getDoubts = async (userId, role, query) => {
  const { error, value } = listDoubtsSchema.validate(query, {
    abortEarly: false,
    convert: true,
    allowUnknown: false,
  });
  if (error) {
    throw new ApiError(
      400,
      error.details.map((detail) => detail.message).join('; ')
    );
  }

  const { page, limit } = value;
  let filter;

  if (role === 'student') {
    filter = { student: userId };
  } else if (role === 'teacher') {
    const classrooms = await Classroom.find({ teacher: userId }).select('_id');
    filter = { classroom: { $in: classrooms.map((classroom) => classroom._id) } };
  } else {
    throw new ApiError(403, 'You do not have permission to access doubts');
  }

  const [doubts, total] = await Promise.all([
    Doubt.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Doubt.countDocuments(filter),
  ]);

  return {
    doubts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getDoubtById = async (userId, doubtId) => {
  if (!/^[a-f\d]{24}$/i.test(doubtId)) {
    throw new ApiError(400, 'Invalid doubt ID');
  }

  const doubt = await Doubt.findById(doubtId);
  if (!doubt) throw new ApiError(404, 'Doubt not found');

  if (doubt.student.toString() === userId) return doubt;

  const classroom = await Classroom.exists({
    _id: doubt.classroom,
    teacher: userId,
  });
  if (!classroom) {
    throw new ApiError(403, 'You do not have permission to access this doubt');
  }

  return doubt;
};

module.exports = { createDoubt, getDoubts, getDoubtById };
