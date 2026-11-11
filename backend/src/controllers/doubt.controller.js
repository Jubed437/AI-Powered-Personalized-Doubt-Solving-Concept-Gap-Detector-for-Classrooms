const doubtService = require('../services/doubt.service');
const { sendResponse } = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const createDoubt = asyncHandler(async (req, res) => {
  const doubt = await doubtService.createDoubt(req.user.id, req.body);
  sendResponse(res, 201, 'Doubt submitted successfully', doubt);
});

const getDoubts = asyncHandler(async (req, res) => {
  const result = await doubtService.getDoubts(
    req.user.id,
    req.user.role,
    req.query
  );
  sendResponse(res, 200, 'Doubts retrieved successfully', result);
});

const getDoubtById = asyncHandler(async (req, res) => {
  const doubt = await doubtService.getDoubtById(req.user.id, req.params.id);
  sendResponse(res, 200, 'Doubt retrieved successfully', doubt);
});

module.exports = { createDoubt, getDoubts, getDoubtById };
