// backend/src/controllers/indicatorController.js
const { executeQuery } = require('../services/db');

// Multi-hop Cypher traversal (parameterized)
const MULTI_HOP_CYPHER = `
  MATCH (start)
  WHERE start.address = $indicator 
     OR start.domain = $indicator 
     OR start.hash = $indicator
  OPTIONAL MATCH path = (start)-[*1..3]-(connected)
  RETURN start, collect(DISTINCT path) AS paths
`;

/**
 * Serves Simple View (plain English, risk classification, visual trail)
 */
exports.getIndicatorSummary = async (req, res, next) => {
  const { value } = req.query;
  if (!value) {
    return res.status(400).json({ error: 'Indicator "value" query parameter is required.' });
  }

  try {
    const records = await executeQuery(MULTI_HOP_CYPHER, { indicator: value });

    if (!records || records.length === 0 || !records[0].get('start')) {
      return res.status(404).json({
        found: false,
        message: `No threat intelligence records found for indicator: ${value}`
      });
    }

    const paths = records[0].get('paths');
    const connectedCampaigns = new Set();
    const connectedMalware = new Set();
    const trail = [value];

    paths.forEach(p => {
      if (!p) return;
      p.segments.forEach(segment => {
        const targetProps = segment.end.properties;
        const labels = segment.end.labels;

        if (labels.includes('Campaign') && targetProps.name) {
          connectedCampaigns.add(targetProps.name);
          trail.push(targetProps.name);
        }
        if (labels.includes('MalwareSample') && targetProps.family) {
          connectedMalware.add(targetProps.family);
          trail.push(targetProps.family);
        }
        if (labels.includes('Domain') && targetProps.domain) {
          trail.push(targetProps.domain);
        }
      });
    });

    const campaigns = Array.from(connectedCampaigns);
    const malware = Array.from(connectedMalware);

    // Plain-language takeaway without graph jargon
    let takeaway = 'No direct links to active campaigns were discovered.';
    if (campaigns.length > 1) {
      takeaway = `High Risk: This indicator bridges ${campaigns.length} distinct threat campaigns (${campaigns.join(' and ')}). This suggests shared adversary infrastructure.`;
    } else if (campaigns.length === 1) {
      takeaway = `Active Threat: Directly associated with campaign "${campaigns[0]}" and ${malware.length} known malware variant(s).`;
    }

    res.json({
      indicator: value,
      riskLevel: campaigns.length > 1 ? 'Critical' : campaigns.length === 1 ? 'High' : 'Low',
      summary: {
        associatedCampaigns: campaigns,
        associatedMalware: malware,
        totalConnectedEntities: new Set(trail).size - 1
      },
      visualTrail: Array.from(new Set(trail)),
      takeaway,
      rawCypher: MULTI_HOP_CYPHER.trim()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Serves Developer View (Cytoscape elements JSON structure)
 */
exports.getIndicatorGraph = async (req, res, next) => {
  const { value } = req.query;
  if (!value) {
    return res.status(400).json({ error: 'Indicator "value" query parameter is required.' });
  }

  try {
    const records = await executeQuery(MULTI_HOP_CYPHER, { indicator: value });

    if (!records || records.length === 0 || !records[0].get('start')) {
      return res.status(404).json({ elements: { nodes: [], edges: [] }, message: 'Indicator not found' });
    }

    const startNode = records[0].get('start');
    const paths = records[0].get('paths');

    const nodeMap = new Map();
    const edges = [];

    // Add root node
    nodeMap.set(startNode.identity.toString(), {
      data: {
        id: startNode.identity.toString(),
        label: startNode.properties.address || startNode.properties.domain || startNode.properties.hash,
        type: startNode.labels[0],
        properties: startNode.properties,
        isRoot: true
      }
    });

    // Populate graph elements from path segments
    paths.forEach(p => {
      if (!p) return;
      p.segments.forEach(segment => {
        const start = segment.start;
        const end = segment.end;
        const rel = segment.relationship;

        if (!nodeMap.has(start.identity.toString())) {
          nodeMap.set(start.identity.toString(), {
            data: {
              id: start.identity.toString(),
              label: start.properties.name || start.properties.family || start.properties.domain || start.properties.address,
              type: start.labels[0],
              properties: start.properties
            }
          });
        }

        if (!nodeMap.has(end.identity.toString())) {
          nodeMap.set(end.identity.toString(), {
            data: {
              id: end.identity.toString(),
              label: end.properties.name || end.properties.family || end.properties.domain || end.properties.address,
              type: end.labels[0],
              properties: end.properties
            }
          });
        }

        edges.push({
          data: {
            id: rel.identity.toString(),
            source: start.identity.toString(),
            target: end.identity.toString(),
            label: rel.type
          }
        });
      });
    });

    res.json({
      elements: {
        nodes: Array.from(nodeMap.values()),
        edges
      },
      rawCypher: MULTI_HOP_CYPHER.trim()
    });
  } catch (error) {
    next(error);
  }
};