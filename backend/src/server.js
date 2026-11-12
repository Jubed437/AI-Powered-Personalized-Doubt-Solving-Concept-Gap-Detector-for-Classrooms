require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Backend server is running on http://localhost:${port}`);
  });
});
