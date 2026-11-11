const express = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validations/auth.validation');

const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a student account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Alex Student }
 *               email: { type: string, example: alex@example.com }
 *               password: { type: string, format: password, example: securePass123 }
 *     responses:
 *       201: { description: Account registered }
 *       400: { description: Invalid request data }
 *       409: { description: Email is already registered }
 */
router.post('/register', validate(registerSchema), authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: alex@example.com }
 *               password: { type: string, format: password, example: securePass123 }
 *     responses:
 *       200: { description: Login successful }
 *       400: { description: Invalid request data }
 *       401: { description: Invalid credentials }
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get the authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Current user }
 *       401: { description: Missing or invalid token }
 */
router.get('/me', authenticate, authController.me);

module.exports = router;
