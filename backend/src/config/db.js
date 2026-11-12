const mongoose = require('mongoose');
const { mongoUri } = require('./env');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoUri);
    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    logger.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;