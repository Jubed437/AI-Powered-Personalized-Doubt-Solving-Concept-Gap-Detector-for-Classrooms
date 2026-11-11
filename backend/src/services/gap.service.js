const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const Classroom = require('../models/Classroom');
const ConceptGap = require('../models/ConceptGap');

const isValidId = (id) => /^[a-f\d]{24}$/i.test(id);

const aggregateGaps = (filter) => ConceptGap.aggregate([
  { $match: filter },
  {
    $group: {
      _id: '$concept',
      totalOccurrences: { $sum: '$occurrences' },
      students: { $addToSet: '$student' },
      severityRank: {
        $max: {
          $switch: {
            branches: [
              { case: { $eq: ['$severity', 'high'] }, then: 3 },
              { case: { $eq: ['$severity', 'medium'] }, then: 2 },
            ],
            default: 1,
          },
        },
      },
    },
  },
  {
    $project: {
      _id: 0,
      concept: '$_id',
      totalOccurrences: 1,
      studentCount: { $size: '$students' },
      severity: {
        $switch: {
          branches: [
            { case: { $eq: ['$severityRank', 3] }, then: 'high' },
            { case: { $eq: ['$severityRank', 2] }, then: 'medium' },
          ],
          default: 'low',
        },
      },
    },
  },
  { $sort: { totalOccurrences: -1, concept: 1 } },
]);

const recordDoubtGaps = async (doubt, gaps) => {
  const uniqueGaps = new Map();
  const severityRank = { low: 1, medium: 2, high: 3 };

  for (const gap of gaps) {
    const key = gap.concept.toLocaleLowerCase();
    const current = uniqueGaps.get(key);
    if (!current) {
      uniqueGaps.set(key, gap);
    } else if (severityRank[gap.severity] > severityRank[current.severity]) {
      uniqueGaps.set(key, { ...current, severity: gap.severity });
    }
  }

  const recordedGaps = await Promise.all(
    [...uniqueGaps.values()].map(async ({ concept, severity }) => {
      const filter = { student: doubt.student, concept };
      const update = {
        $set: { severity },
        $setOnInsert: {
          classroom: doubt.classroom,
          student: doubt.student,
          subject: doubt.subject,
          concept,
        },
        $inc: { occurrences: 1 },
        $addToSet: { doubts: doubt._id },
      };
      const options = { new: true, upsert: true, runValidators: true };

      try {
        return await ConceptGap.findOneAndUpdate(filter, update, options);
      } catch (error) {
        if (error.code !== 11000) throw error;
        return ConceptGap.findOneAndUpdate(filter, update, {
          ...options,
          upsert: false,
        });
      }
    })
  );

  return recordedGaps;
};

const getClassroomGaps = async (teacherId, classroomId) => {
  if (!isValidId(classroomId)) throw new ApiError(400, 'Invalid classroom ID');

  const classroom = await Classroom.findById(classroomId);
  if (!classroom) throw new ApiError(404, 'Classroom not found');
  if (classroom.teacher.toString().toLowerCase() !== teacherId.toLowerCase()) {
    throw new ApiError(403, 'You do not have permission to access this classroom');
  }

  return aggregateGaps({ classroom: new mongoose.Types.ObjectId(classroomId) });
};

const getStudentGaps = async (requesterId, requesterRole, studentId) => {
  if (!isValidId(studentId)) throw new ApiError(400, 'Invalid student ID');

  let filter = { student: new mongoose.Types.ObjectId(studentId) };

  if (requesterRole === 'student') {
    if (requesterId.toLowerCase() !== studentId.toLowerCase()) {
      throw new ApiError(403, 'You do not have permission to access this student');
    }
  } else if (requesterRole === 'teacher') {
    const classrooms = await Classroom.find({
      teacher: requesterId,
      students: studentId,
    }).select('_id');

    if (classrooms.length === 0) {
      throw new ApiError(403, 'You do not have permission to access this student');
    }

    filter = {
      ...filter,
      classroom: { $in: classrooms.map(({ _id }) => _id) },
    };
  } else {
    throw new ApiError(403, 'You do not have permission to access student gaps');
  }

  return aggregateGaps(filter);
};

module.exports = { recordDoubtGaps, getClassroomGaps, getStudentGaps };
