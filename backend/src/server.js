// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getIndicatorSummary, getIndicatorGraph } = require('src/controllers/indicatorController');
const { getHiddenLinks } = require('src/controllers/campaignController');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Indicator Endpoints
app.get('/api/indicators/summary', getIndicatorSummary);
app.get('/api/indicators/graph', getIndicatorGraph);

// Cross-Campaign Correlation Endpoint
app.get('/api/campaigns/hidden-links', getHiddenLinks);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Centralized Error Handling Middleware (Graceful DB failure response)
app.use((err, req, res, next) => {
  console.error('API Error:', err);

  if (err.code === 'ServiceUnavailable' || err.message?.includes('connect')) {
    return res.status(503).json({
      error: 'Database Unreachable',
      message: 'Unable to connect to CognoDB. Please verify the database status and credentials.'
    });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

app.listen(PORT, () => {
  console.log(`Threat Trace API server running on http://localhost:${PORT}`);
});