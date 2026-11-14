// Robust 2D continuous collision detection and penetration resolution with Spatial Hash Grid
// Works for boxes (AABB) and cylinders (circles) with multi-pass relaxation

const CELL_SIZE = 48; // 48m spatial bucket size
const PADDING = 4.0;   // 4m boundary overlap padding to ensure no missed adjacent colliders

export function buildColliderGrid(colliders, cellSize = CELL_SIZE) {
  const grid = new Map();

  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i];
    let minX, maxX, minZ, maxZ;

    if (c.type === 'box') {
      minX = c.minX;
      maxX = c.maxX;
      minZ = c.minZ;
      maxZ = c.maxZ;
    } else if (c.type === 'cylinder') {
      minX = c.x - c.radius;
      maxX = c.x + c.radius;
      minZ = c.z - c.radius;
      maxZ = c.z + c.radius;
    } else {
      continue;
    }

    // Include PADDING so boundary colliders are indexed into adjacent cells
    const startCX = Math.floor((minX - PADDING) / cellSize);
    const endCX = Math.floor((maxX + PADDING) / cellSize);
    const startCZ = Math.floor((minZ - PADDING) / cellSize);
    const endCZ = Math.floor((maxZ + PADDING) / cellSize);

    for (let cx = startCX; cx <= endCX; cx++) {
      for (let cz = startCZ; cz <= endCZ; cz++) {
        const key = `${cx}_${cz}`;
        let list = grid.get(key);
        if (!list) {
          list = [];
          grid.set(key, list);
        }
        list.push(c);
      }
    }
  }

  return grid;
}

let queryStamp = 0;

export function resolveCircleCollision(pos, radius, colliders, iterations = 3) {
  if (!colliders || colliders.length === 0) return;

  // Build or update spatial grid cache on colliders array if not present or resized
  if (!colliders._grid || colliders._lastLen !== colliders.length) {
    colliders._grid = buildColliderGrid(colliders, CELL_SIZE);
    colliders._lastLen = colliders.length;
  }

  const cellSize = CELL_SIZE;
  const startCX = Math.floor((pos.x - radius) / cellSize);
  const endCX = Math.floor((pos.x + radius) / cellSize);
  const startCZ = Math.floor((pos.z - radius) / cellSize);
  const endCZ = Math.floor((pos.z + radius) / cellSize);

  // Fast path: entity completely within a single 48m cell
  let candidates;
  if (startCX === endCX && startCZ === endCZ) {
    candidates = colliders._grid.get(`${startCX}_${startCZ}`);
    if (!candidates || candidates.length === 0) {
      return; // Zero colliders in this area
    }
  } else {
    // Multi-cell gathering with deduplication stamp
    queryStamp = (queryStamp + 1) | 0;
    candidates = [];
    for (let cx = startCX; cx <= endCX; cx++) {
      for (let cz = startCZ; cz <= endCZ; cz++) {
        const cell = colliders._grid.get(`${cx}_${cz}`);
        if (cell) {
          for (let k = 0; k < cell.length; k++) {
            const c = cell[k];
            if (c._qStamp !== queryStamp) {
              c._qStamp = queryStamp;
              candidates.push(c);
            }
          }
        }
      }
    }
    if (candidates.length === 0) return;
  }

  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];

      if (c.type === 'box') {
        // Fast AABB broadphase rejection
        if (pos.x < c.minX - radius || pos.x > c.maxX + radius ||
            pos.z < c.minZ - radius || pos.z > c.maxZ + radius) {
          continue;
        }

        // Find closest point on the AABB box
        const cx = Math.max(c.minX, Math.min(pos.x, c.maxX));
        const cz = Math.max(c.minZ, Math.min(pos.z, c.maxZ));

        const dx = pos.x - cx;
        const dz = pos.z - cz;
        const distSq = dx * dx + dz * dz;

        if (distSq < radius * radius) {
          const dist = Math.sqrt(distSq);

          if (dist > 0.0001) {
            // Push out along contact normal
            const overlap = radius - dist;
            pos.x += (dx / dist) * overlap;
            pos.z += (dz / dist) * overlap;
          } else {
            // Center is strictly INSIDE the box - push out to the nearest edge
            const leftDist = pos.x - c.minX;
            const rightDist = c.maxX - pos.x;
            const backDist = pos.z - c.minZ;
            const frontDist = c.maxZ - pos.z;

            const minDist = Math.min(leftDist, rightDist, backDist, frontDist);
            if (minDist === leftDist) {
              pos.x = c.minX - radius - 0.05;
            } else if (minDist === rightDist) {
              pos.x = c.maxX + radius + 0.05;
            } else if (minDist === backDist) {
              pos.z = c.minZ - radius - 0.05;
            } else {
              pos.z = c.maxZ + radius + 0.05;
            }
          }
        }
      } else if (c.type === 'cylinder') {
        const targetDist = c.radius + radius;
        // Fast Manhattan / box rejection
        if (Math.abs(pos.x - c.x) > targetDist || Math.abs(pos.z - c.z) > targetDist) {
          continue;
        }

        const dx = pos.x - c.x;
        const dz = pos.z - c.z;
        const distSq = dx * dx + dz * dz;

        if (distSq < targetDist * targetDist) {
          const dist = Math.sqrt(distSq);
          if (dist > 0.0001) {
            const overlap = targetDist - dist;
            pos.x += (dx / dist) * overlap;
            pos.z += (dz / dist) * overlap;
          } else {
            // Center is strictly on or inside the cylinder origin - push firmly out
            pos.z += targetDist + 0.1;
          }
        }
      }
    }
  }
}

/**
 * Resolves mutual circle-to-circle collisions against other characters / NPCs
 * so entities cannot walk right through each other's 3D models.
 */
export function resolveEntityCollision(pos, radius, otherEntities, otherRadius = 0.55) {
  if (!otherEntities) return;

  const targetDist = radius + otherRadius;
  const targetDistSq = targetDist * targetDist;

  const list = Array.isArray(otherEntities) ? otherEntities : (otherEntities.values ? Array.from(otherEntities.values()) : []);

  for (let i = 0; i < list.length; i++) {
    const entity = list[i];
    if (!entity) continue;

    // Extract world position
    let ex, ez;
    if (entity.position) {
      ex = entity.position.x;
      ez = entity.position.z;
    } else if (entity.group && entity.group.position) {
      ex = entity.group.position.x;
      ez = entity.group.position.z;
    } else if (typeof entity.x === 'number' && typeof entity.z === 'number') {
      ex = entity.x;
      ez = entity.z;
    } else {
      continue;
    }

    const dx = pos.x - ex;
    const dz = pos.z - ez;
    const distSq = dx * dx + dz * dz;

    // Ignore exact self (distance ~0)
    if (distSq < 0.0001) continue;

    if (distSq < targetDistSq) {
      const dist = Math.sqrt(distSq);
      const overlap = targetDist - dist;
      // Push pos out along normal
      pos.x += (dx / dist) * overlap;
      pos.z += (dz / dist) * overlap;
    }
  }
}

/**
 * Clamps a proposed destination outside solid colliders so click targets
 * do not land inside buildings, fountains, or walls.
 */
export function clampTargetOutsideColliders(targetPos, radius, colliders) {
  if (!targetPos || !colliders || colliders.length === 0) return targetPos;

  // Resolve targetPos against colliders
  resolveCircleCollision(targetPos, radius + 0.3, colliders, 4);
  return targetPos;
}

/**
 * Checks whether a candidate position (x, z) with given radius intersects any collider.
 * Useful for fast obstacle lookahead, raycast whiskers, and path clearance checks.
 */
export function checkCollision(x, z, radius, colliders) {
  if (!colliders || colliders.length === 0) return false;

  if (!colliders._grid || colliders._lastLen !== colliders.length) {
    colliders._grid = buildColliderGrid(colliders, CELL_SIZE);
    colliders._lastLen = colliders.length;
  }

  const cellSize = CELL_SIZE;
  const startCX = Math.floor((x - radius) / cellSize);
  const endCX = Math.floor((x + radius) / cellSize);
  const startCZ = Math.floor((z - radius) / cellSize);
  const endCZ = Math.floor((z + radius) / cellSize);

  for (let cx = startCX; cx <= endCX; cx++) {
    for (let cz = startCZ; cz <= endCZ; cz++) {
      const cell = colliders._grid.get(`${cx}_${cz}`);
      if (!cell) continue;

      for (let i = 0; i < cell.length; i++) {
        const c = cell[i];
        if (c.type === 'box') {
          if (x < c.minX - radius || x > c.maxX + radius ||
              z < c.minZ - radius || z > c.maxZ + radius) {
            continue;
          }
          const cxP = Math.max(c.minX, Math.min(x, c.maxX));
          const czP = Math.max(c.minZ, Math.min(z, c.maxZ));
          const dx = x - cxP;
          const dz = z - czP;
          if (dx * dx + dz * dz < radius * radius) {
            return true;
          }
        } else if (c.type === 'cylinder') {
          const targetDist = c.radius + radius;
          if (Math.abs(x - c.x) > targetDist || Math.abs(z - c.z) > targetDist) {
            continue;
          }
          const dx = x - c.x;
          const dz = z - c.z;
          if (dx * dx + dz * dz < targetDist * targetDist) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

/**
 * Detects if an entity is stuck or deeply penetrated inside any solid collider,
 * and firmly ejects it to the nearest exterior free point with safety clearance.
 */
export function ejectFromColliders(pos, radius, colliders, safetyMargin = 0.6) {
  if (!colliders || colliders.length === 0) return false;

  let wasEjected = false;
  for (let i = 0; i < colliders.length; i++) {
    const c = colliders[i];
    if (c.type === 'cylinder') {
      const targetDist = c.radius + radius;
      const dx = pos.x - c.x;
      const dz = pos.z - c.z;
      const distSq = dx * dx + dz * dz;
      if (distSq < targetDist * targetDist) {
        const dist = Math.sqrt(distSq);
        const normalX = dist > 0.0001 ? dx / dist : 0;
        const normalZ = dist > 0.0001 ? dz / dist : 1;
        pos.x = c.x + normalX * (targetDist + safetyMargin);
        pos.z = c.z + normalZ * (targetDist + safetyMargin);
        wasEjected = true;
      }
    } else if (c.type === 'box') {
      if (pos.x >= c.minX - radius && pos.x <= c.maxX + radius &&
          pos.z >= c.minZ - radius && pos.z <= c.maxZ + radius) {
        const cx = Math.max(c.minX, Math.min(pos.x, c.maxX));
        const cz = Math.max(c.minZ, Math.min(pos.z, c.maxZ));
        const dx = pos.x - cx;
        const dz = pos.z - cz;
        const distSq = dx * dx + dz * dz;
        if (distSq < radius * radius) {
          const leftDist = Math.abs(pos.x - c.minX);
          const rightDist = Math.abs(c.maxX - pos.x);
          const backDist = Math.abs(pos.z - c.minZ);
          const frontDist = Math.abs(c.maxZ - pos.z);
          const minDist = Math.min(leftDist, rightDist, backDist, frontDist);

          if (minDist === leftDist) pos.x = c.minX - radius - safetyMargin;
          else if (minDist === rightDist) pos.x = c.maxX + radius + safetyMargin;
          else if (minDist === backDist) pos.z = c.minZ - radius - safetyMargin;
          else pos.z = c.maxZ + radius + safetyMargin;
          wasEjected = true;
        }
      }
    }
  }
  return wasEjected;
}



