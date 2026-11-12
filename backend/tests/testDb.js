process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/knowra_test_never_connect';
process.env.JWT_SECRET = 'test-only-jwt-secret-not-for-production';
process.env.JWT_EXPIRES_IN = '15m';
process.env.AI_SERVICE_URL = '';
process.env.AI_SERVICE_KEY = '';

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const os = require('os');

jest.setTimeout(120000);

let mongoServer;
const mongoClientMetadata = {
  driver: { name: 'nodejs', version: 'jest-test' },
  platform: `Node.js ${process.version}`,
  os: {
    name: os.platform(),
    architecture: os.arch(),
    version: os.release(),
    type: os.type(),
  },
};
const MongoClient = mongoose.mongo.MongoClient;
const connectMongoClient = MongoClient.prototype.connect;

// Provide handshake metadata from the test realm for Jest's isolated module context.
MongoClient.prototype.connect = function connectWithTestMetadata(...args) {
  this.options.metadata = Promise.resolve(mongoClientMetadata);
  return connectMongoClient.apply(this, args);
};

const connectTestDb = async () => {
  mongoServer = await MongoMemoryServer.create({
    binary: { version: '7.0.14' },
  });
  await mongoose.connect(mongoServer.getUri(), {
    serverSelectionTimeoutMS: 5000,
  });
  await Promise.all(
    Object.values(mongoose.models).map((model) => model.syncIndexes())
  );
};

const clearTestDb = async () => {
  await Promise.all(
    Object.values(mongoose.connection.collections).map((collection) =>
      collection.deleteMany({})
    )
  );
};

const disconnectTestDb = async () => {
  await mongoose.disconnect();
  if (mongoServer) await mongoServer.stop();
};

module.exports = { connectTestDb, clearTestDb, disconnectTestDb };
