const { aiApiKey, aiModel } = require('./env');

module.exports = {
  apiKey: aiApiKey,
  model: aiModel,
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  timeoutMs: 15000,
};
