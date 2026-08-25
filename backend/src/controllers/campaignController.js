const { executeQuery } = require('../services/db');

const HIDDEN_LINKS_CYPHER = `
  MATCH (c1:Campaign)<-[:PART_OF_CAMPAIGN]-(m1:MalwareSample)-[:COMMUNICATES_WITH]->(infra)<-[:COMMUNICATES_WITH]-(m2:MalwareSample)-[:PART_OF_CAMPAIGN]->(c2:Campaign)
  WHERE c1.id < c2.id AND m1 <> m2
  RETURN 
    c1.name AS campaignA,
    c2.name AS campaignB,
    labels(infra)[0] AS infraType,
    coalesce(infra.address, infra.domain) AS sharedValue,
    m1.family AS malwareA,
    m2.family AS malwareB
`;

exports.getHiddenLinks = async (req, res, next) => {
  try {
    const records = await executeQuery(HIDDEN_LINKS_CYPHER);

    const correlations = records.map(record => ({
      campaignA: record.get('campaignA'),
      campaignB: record.get('campaignB'),
      sharedInfrastructure: {
        type: record.get('infraType'),
        value: record.get('sharedValue')
      },
      malwareVariants: [record.get('malwareA'), record.get('malwareB')],
      insight: `Campaigns "${record.get('campaignA')}" and "${record.get('campaignB')}" share ${record.get('infraType')} (${record.get('sharedValue')}) across distinct malware families.`
    }));

    res.json({
      count: correlations.length,
      correlations,
      rawCypher: HIDDEN_LINKS_CYPHER.trim()
    });
  } catch (error) {
    next(error);
  }
};