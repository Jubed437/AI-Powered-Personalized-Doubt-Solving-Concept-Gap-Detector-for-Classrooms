const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../src/config/env');
const User = require('../src/models/User');
const Classroom = require('../src/models/Classroom');

const createUser = async ({ role = 'student', email } = {}) =>
  User.create({
    name: `Test ${role}`,
    email: email || `${role}-${crypto.randomUUID()}@example.com`,
    password: 'securePass123',
    role,
  });

const tokenFor = (user) =>
  jwt.sign(
    { sub: user._id.toString(), role: user.role },
    jwtSecret,
    { expiresIn: '15m' }
  );

const createClassroom = async (teacher, students = []) =>
  Classroom.create({
    name: 'Test Classroom',
    subject: 'Computer Science',
    teacher: teacher._id,
    students: students.map((student) => student._id),
    joinCode: crypto.randomBytes(3).toString('hex').toUpperCase(),
  });

module.exports = { createUser, tokenFor, createClassroom };
