import { MongoClient } from 'mongodb';

let client;
let database;

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is required. Configure MongoDB before starting the backend.');
  }

  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    maxPoolSize: Number(process.env.MONGODB_POOL_MAX) || 10,
  });
  await client.connect();
  database = client.db(process.env.MONGODB_DB_NAME || 'knowra');
  await database.command({ ping: 1 });
  return database;
}

export function getDatabase() {
  if (!database) {
    throw new Error('MongoDB is not connected. Start the backend database connection first.');
  }
  return database;
}

export async function closeDatabase() {
  if (client) {
    await client.close();
    client = undefined;
    database = undefined;
  }
}
