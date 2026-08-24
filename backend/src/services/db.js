// backend/src/services/db.js
const neo4j = require('neo4j-driver');
require('dotenv').config();

const uri = process.env.NEO4J_URI;
const user = process.env.NEO4J_USER;
const password = process.env.NEO4J_PASSWORD;

if (!uri || !user || !password) {
  console.warn('⚠️ Missing database environment variables in .env');
}

const driver = neo4j.driver(
  uri || 'bolt://localhost:7687',
  neo4j.auth.basic(user || 'neo4j', password || '')
);

/**
 * Execute a parameterized Cypher query
 * @param {string} cypher - The Cypher query string
 * @param {object} params - Parameters object (prevents injection)
 * @returns {Promise<Array>} - Array of query result records
 */
async function executeQuery(cypher, params = {}) {
  const session = driver.session();
  try {
    const result = await session.run(cypher, params);
    return result.records;
  } catch (error) {
    console.error('Database query execution error:', error.message);
    throw error;
  } finally {
    await session.close();
  }
}

/**
 * Check database connectivity
 */
async function verifyConnection() {
  try {
    const serverInfo = await driver.getServerInfo();
    console.log(`✅ Connected to Graph Database at ${serverInfo.address}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Graph Database:', error.message);
    return false;
  }
}

module.exports = { executeQuery, verifyConnection, driver };