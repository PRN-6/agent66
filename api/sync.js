/**
 * Vercel Serverless Function: Realm State Sync & Offline World Simulation Engine
 * Route: /api/sync
 *
 * Allows Agent66 to persist realm state to Vercel and simulate world progression
 * (day/night solar cycles, NPC routine duties, and passive spoils) while offline.
 */

// In-memory state cache for warm serverless lambdas
let cachedRealmState = null;
let lastHeartbeatTime = Date.now();

export default async function handler(req, res) {
  // CORS Headers for seamless local dev & cross-domain Vercel deployment
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const now = Date.now();

  // 1. GET: Server Status & Last Cached Realm Snapshot
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'online',
      service: 'Agent66 Vercel Realm Simulation Engine',
      serverTime: now,
      hasCachedState: !!cachedRealmState,
      cachedTimestamp: cachedRealmState?.timestamp || null,
      cachedHero: cachedRealmState?.player?.characterId || null
    });
  }

  // 2. POST: State Synchronization or Offline Time Simulation
  if (req.method === 'POST') {
    try {
      const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});

      // Sub-Action: Simulate Offline Progress from Server Clock
      if (payload.action === 'simulate' && payload.lastSaveTimestamp) {
        const elapsedSec = Math.max(0, Math.floor((now - payload.lastSaveTimestamp) / 1000));
        const dayNightCycles = Number((elapsedSec / 480).toFixed(2)); // 480s = full 24h cycle
        const passiveXp = Math.min(2500, Math.floor(elapsedSec * 1.5));
        const passiveGold = Math.min(1500, Math.floor(elapsedSec * 0.8));
        const dutiesCount = Math.floor(elapsedSec / 120);

        return res.status(200).json({
          success: true,
          action: 'simulate',
          serverTime: now,
          elapsedSeconds: elapsedSec,
          dayNightCycles,
          passiveXp,
          passiveGold,
          dutiesCount,
          message: `Vercel server simulated ${elapsedSec}s of autonomous realm life.`
        });
      }

      // Normal Sync: Store snapshot in serverless memory
      cachedRealmState = {
        ...payload,
        serverSavedAt: now
      };
      lastHeartbeatTime = now;

      return res.status(200).json({
        success: true,
        action: 'sync',
        serverTime: now,
        savedHero: payload?.player?.characterId || 'hero',
        heroLevel: payload?.player?.level || 1,
        message: 'Realm snapshot synchronized with Vercel serverless cloud.'
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        error: err.message || 'Invalid JSON body'
      });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}

