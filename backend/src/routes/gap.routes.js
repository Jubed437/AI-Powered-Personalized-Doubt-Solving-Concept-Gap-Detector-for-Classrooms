const express = require('express');
const gapController = require('../controllers/gap.controller');
const authenticate = require('../middlewares/auth');
const restrictTo = require('../middlewares/role');

const router = express.Router();

/**
 * @swagger
 * /classrooms/{id}/gaps:
 *   get:
 *     summary: Get classroom concept gaps ranked by occurrence count (teacher only)
 *     tags: [Gaps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Gaps grouped by concept and sorted by total occurrences }
 *       400: { description: Invalid classroom ID }
 *       401: { description: Authentication required }
 *       403: { description: Caller does not teach this classroom }
 *       404: { description: Classroom not found }
 */
router.get(
  '/classrooms/:id/gaps',
  authenticate,
  restrictTo('teacher'),
  gapController.getClassroomGaps
);

/**
 * @swagger
 * /students/{id}/gaps:
 *   get:
 *     summary: Get a student's concept gaps (the student or their classroom teacher)
 *     tags: [Gaps]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Gaps grouped by concept and sorted by total occurrences }
 *       400: { description: Invalid student ID }
 *       401: { description: Authentication required }
 *       403: { description: Caller is neither this student nor their teacher }
 */
router.get(
  '/students/:id/gaps',
  authenticate,
  restrictTo('student', 'teacher'),
  gapController.getStudentGaps
);

module.exports = router;
