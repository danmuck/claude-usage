const express = require('express');
const path = require('path');
function createServer() {
  const app = express();

  // Cache parsed data (reparse on demand via refresh endpoint)
  let cachedData = null;

  app.get('/api/data', async (req, res) => {
    try {
      if (!cachedData) {
        const parser = require('./parser');
        const [sessionData, storage] = await Promise.all([
          parser.parseAllSessions(),
          parser.calculateStorageMetrics(),
        ]);
        cachedData = { ...sessionData, storage };
      }
      res.json(cachedData);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/refresh', async (req, res) => {
    try {
      delete require.cache[require.resolve('./parser')];
      const parser = require('./parser');
      const [sessionData, storage] = await Promise.all([
        parser.parseAllSessions(),
        parser.calculateStorageMetrics(),
      ]);
      cachedData = { ...sessionData, storage };
      res.json({ ok: true, sessions: cachedData.sessions.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Serve static dashboard
  app.use(express.static(path.join(__dirname, 'public')));

  return app;
}

module.exports = { createServer };
