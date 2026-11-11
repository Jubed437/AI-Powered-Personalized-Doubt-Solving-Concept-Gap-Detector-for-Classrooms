import 'dotenv/config';
import app from './app.js';
import { closeDatabase, connectDatabase } from './db/client.js';
import { initializeDatabase } from './db/initialize.js';

const PORT = process.env.PORT || 5001;

try {
  const database = await connectDatabase();
  await initializeDatabase(database);
  app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('Backend startup failed:', error.message);
  await closeDatabase();
  process.exitCode = 1;
}
