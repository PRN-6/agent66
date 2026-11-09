// Robust 2D continuous collision detection and penetration resolution
// Works for boxes (AABB) and cylinders (circles) with multi-pass relaxation

export function resolveCircleCollision(pos, radius, colliders, iterations = 3) {
  if (!colliders || colliders.length === 0) return;

  for (let it = 0; it < iterations; it++) {
    for (let i = 0; i < colliders.length; i++) {
      const c = colliders[i];

      if (c.type === 'box') {
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
            // Center is strictly INSIDE the box
            // Push out to the nearest edge
            const leftDist = pos.x - c.minX;
            const rightDist = c.maxX - pos.x;
            const backDist = pos.z - c.minZ;
            const frontDist = c.maxZ - pos.z;

            const minDist = Math.min(leftDist, rightDist, backDist, frontDist);
            if (minDist === leftDist) {
              pos.x = c.minX - radius - 0.01;
            } else if (minDist === rightDist) {
              pos.x = c.maxX + radius + 0.01;
            } else if (minDist === backDist) {
              pos.z = c.minZ - radius - 0.01;
            } else {
              pos.z = c.maxZ + radius + 0.01;
            }
          }
        }
      } else if (c.type === 'cylinder') {
        const dx = pos.x - c.x;
        const dz = pos.z - c.z;
        const distSq = dx * dx + dz * dz;
        const targetDist = c.radius + radius;

        if (distSq < targetDist * targetDist) {
          const dist = Math.sqrt(distSq);
          if (dist > 0.0001) {
            const overlap = targetDist - dist;
            pos.x += (dx / dist) * overlap;
            pos.z += (dz / dist) * overlap;
          } else {
            pos.x += targetDist;
          }
        }
      }
    }
  }
}

