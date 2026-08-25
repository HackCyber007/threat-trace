const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const neo4j = require('neo4j-driver');
const seedData = require('./data.json');

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

async function seed() {
  const session = driver.session();
  console.log('🔄 Starting database seeding...');

  try {
    // 1. Wipe existing graph data
    console.log('  → Clearing previous graph data...');
    await session.run('MATCH (n) DETACH DELETE n');

    // 2. Create constraints/indexes for fast lookups and uniqueness
    console.log('  → Applying node constraints...');
    await session.run('CREATE CONSTRAINT threat_actor_id IF NOT EXISTS FOR (t:ThreatActor) REQUIRE t.id IS UNIQUE');
    await session.run('CREATE CONSTRAINT campaign_id IF NOT EXISTS FOR (c:Campaign) REQUIRE c.id IS UNIQUE');
    await session.run('CREATE CONSTRAINT malware_id IF NOT EXISTS FOR (m:MalwareSample) REQUIRE m.id IS UNIQUE');
    await session.run('CREATE CONSTRAINT ip_id IF NOT EXISTS FOR (i:IPAddress) REQUIRE i.id IS UNIQUE');
    await session.run('CREATE CONSTRAINT domain_id IF NOT EXISTS FOR (d:Domain) REQUIRE d.id IS UNIQUE');

    // 3. Batch insert nodes using UNWIND
    console.log('  → Inserting Threat Actors...');
    await session.run(
      `UNWIND $actors AS a
       CREATE (:ThreatActor { id: a.id, name: a.name, origin: a.origin, aliases: a.aliases })`,
      { actors: seedData.nodes.threat_actors }
    );

    console.log('  → Inserting Campaigns...');
    await session.run(
      `UNWIND $campaigns AS c
       CREATE (:Campaign { id: c.id, name: c.name, first_seen: c.first_seen, confidence_score: c.confidence_score })`,
      { campaigns: seedData.nodes.campaigns }
    );

    console.log('  → Inserting Malware Samples...');
    await session.run(
      `UNWIND $malware AS m
       CREATE (:MalwareSample { id: m.id, hash: m.hash, family: m.family, file_type: m.file_type })`,
      { malware: seedData.nodes.malware }
    );

    console.log('  → Inserting IP Addresses...');
    await session.run(
      `UNWIND $ips AS i
       CREATE (:IPAddress { id: i.id, address: i.address, asn: i.asn, country: i.country })`,
      { ips: seedData.nodes.ips }
    );

    console.log('  → Inserting Domains...');
    await session.run(
      `UNWIND $domains AS d
       CREATE (:Domain { id: d.id, domain: d.domain, registrar: d.registrar, first_seen: d.first_seen })`,
      { domains: seedData.nodes.domains }
    );

    // 4. Insert Relationships
    console.log('  → Connecting relationships...');
    for (const edge of seedData.edges) {
      const edgeQuery = `
        MATCH (source {id: $sourceId})
        MATCH (target {id: $targetId})
        MERGE (source)-[:${edge.type}]->(target)
      `;
      await session.run(edgeQuery, { sourceId: edge.source, targetId: edge.target });
    }

    console.log('✅ Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();