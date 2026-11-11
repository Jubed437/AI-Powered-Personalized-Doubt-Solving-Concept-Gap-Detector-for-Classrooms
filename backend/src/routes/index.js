const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/classrooms', require('./classroom.routes'));
router.use('/doubts', require('./doubt.routes'));
router.use('/', require('./gap.routes'));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API health
 *     tags: [Health]
 *     responses:
 *       200: { description: API is running }
 */
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running', data: null });
});

module.exports = router;