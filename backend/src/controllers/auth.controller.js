const authService = require('../services/auth.service');
const { sendResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  sendResponse(res, 201, 'Registration successful', user);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  sendResponse(res, 200, 'Login successful', result);
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getCurrentUser(req.user.id);
  sendResponse(res, 200, 'Current user retrieved successfully', user);
});

module.exports = { register, login, me };
