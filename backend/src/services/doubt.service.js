const ApiError = require('../utils/ApiError');
const Classroom = require('../models/Classroom');
const Doubt = require('../models/Doubt');
const aiService = require('./ai.service');
const gapService = require('./gap.service');
const { listDoubtsSchema } = require('../validations/doubt.validation');

const createDoubt = async (studentId, { classroomId, subject, topic, text }) => {
  const classroom = await Classroom.findById(classroomId);
  if (!classroom) throw new ApiError(404, 'Classroom not found');

  const isMember = classroom.students.some((id) =>
    id.toString().toLowerCase() === studentId.toLowerCase()
  );
  if (!isMember) {
    throw new ApiError(403, 'You must join this classroom before submitting a doubt');
  }

  const doubt = await Doubt.create({
    student: studentId,
    classroom: classroom._id,
    subject,
    topic,
    text,
    status: 'pending',
  });

  return analyzeAndSaveDoubt(doubt);
};

const analyzeAndSaveDoubt = async (doubt) => {
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
    if (error.statusCode === 502) throw error;
    throw new ApiError(
      502,
      'Doubt was saved, but AI analysis failed. You can retry it later.'
    );
  }
};

const retryDoubt = async (studentId, doubtId) => {
  const doubt = await Doubt.findById(doubtId);
  if (!doubt) throw new ApiError(404, 'Doubt not found');
  if (doubt.student.toString().toLowerCase() !== studentId.toLowerCase()) {
    throw new ApiError(403, 'You do not have permission to retry this doubt');
  }
  if (doubt.status !== 'failed') {
    throw new ApiError(409, 'Only failed doubts can be retried');
  }

  doubt.status = 'pending';
  await doubt.save();
  return analyzeAndSaveDoubt(doubt);
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

  const { classroomId, status, page, limit } = value;
  const filter = {};

  if (role === 'student') {
    filter.student = userId;
  } else if (role === 'teacher') {
    const classrooms = await Classroom.find({ teacher: userId }).select('_id');
    const ownedClassroomIds = classrooms.map(({ _id }) => _id);

    if (classroomId) {
      const ownsClassroom = ownedClassroomIds.some(
        (id) => id.toString().toLowerCase() === classroomId.toLowerCase()
      );
      if (!ownsClassroom) {
        throw new ApiError(403, 'You do not have permission to view this classroom’s doubts');
      }
      filter.classroom = classroomId;
    } else {
      filter.classroom = { $in: ownedClassroomIds };
    }
  } else {
    throw new ApiError(403, 'You do not have permission to access doubts');
  }

  if (role === 'student' && classroomId) filter.classroom = classroomId;
  if (status) filter.status = status;

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
  const doubt = await Doubt.findById(doubtId);
  if (!doubt) throw new ApiError(404, 'Doubt not found');

  if (doubt.student.toString().toLowerCase() === userId.toLowerCase()) return doubt;

  const classroom = await Classroom.exists({
    _id: doubt.classroom,
    teacher: userId,
  });
  if (!classroom) {
    throw new ApiError(403, 'You do not have permission to access this doubt');
  }

  return doubt;
};

module.exports = {
  createDoubt,
  retryDoubt,
  getDoubts,
  getDoubtById,
};
