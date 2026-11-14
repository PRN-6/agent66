import * as YUKA from 'yuka';
import { getTerrainHeight } from '../utils/math.js';
import { resolveCircleCollision } from '../utils/collision.js';

/**
 * YukaLocomotionEngine (Integrated from Mugen87/yuka)
 * 
 * Provides physics-based autonomous vehicle steering, continuous locomotion,
 * smooth Arrive deceleration, and mutual Separation for characters and NPCs:
 * - Eliminates teleporting and unnatural snapping
 * - Ensures smooth acceleration, turning rates, and decelleration ramps
 * - Keeps NPCs from clipping or clumping together with YUKA.SeparationBehavior
 */
export class YukaLocomotionEngine {
  constructor(gameApp) {
    this.gameApp = gameApp;
    this.entityManager = new YUKA.EntityManager();
    this.vehicles = new Map(); // id -> { vehicle, arriveBehavior, wanderBehavior, config, threeGroup }
    this.colliders = [];
  }

  setColliders(colliders) {
    this.colliders = colliders || [];
  }

  /**
   * Registers a character/NPC with the Yuka physics & steering engine.
   */
  registerEntity(id, initialPos, config, threeGroup) {
    if (this.vehicles.has(id)) {
      this.unregisterEntity(id);
    }

    const vehicle = new YUKA.Vehicle();
    vehicle.name = id;
    vehicle.position.set(initialPos.x, 0, initialPos.z);
    vehicle.boundingRadius = 0.55;
    vehicle.maxSpeed = config.walkSpeed || 3.0;
    vehicle.maxForce = 120;
    vehicle.mass = 1.0;
    vehicle.updateNeighborhood = true;
    vehicle.neighborhoodRadius = 3.5;

    // 1. Separation Behavior: prevents characters from clumping or clipping into each other
    const separation = new YUKA.SeparationBehavior();
    separation.weight = 1.2;
    vehicle.steering.add(separation);

    // 2. Arrive Behavior: smooth approach and deceleration at destinations
    const arrive = new YUKA.ArriveBehavior(new YUKA.Vector3(initialPos.x, 0, initialPos.z), 3.0, 0.4);
    arrive.active = false;
    arrive.weight = 1.0;
    vehicle.steering.add(arrive);

    // 3. Wander Behavior: natural organic pacing when idling
    const wander = new YUKA.WanderBehavior(2.5, 4.0, 1.2);
    wander.active = false;
    wander.weight = 0.8;
    vehicle.steering.add(wander);

    this.entityManager.add(vehicle);

    const record = {
      id,
      vehicle,
      arrive,
      wander,
      config,
      threeGroup,
      baseSpeed: config.walkSpeed || 3.0,
      runSpeed: config.runSpeed || 8.0,
      isMoving: false,
      currentSpeed: 0
    };

    this.vehicles.set(id, record);
    return record;
  }

  unregisterEntity(id) {
    const record = this.vehicles.get(id);
    if (!record) return;

    this.entityManager.remove(record.vehicle);
    this.vehicles.delete(id);
  }

  /**
   * Commands the vehicle to navigate smoothly towards a world coordinate.
   */
  navigateTo(id, targetX, targetZ, isSprint = false) {
    const record = this.vehicles.get(id);
    if (!record) return;

    record.arrive.target.set(targetX, 0, targetZ);
    record.arrive.active = true;
    record.wander.active = false;
    record.vehicle.maxSpeed = isSprint ? record.runSpeed : record.baseSpeed;
    record.isMoving = true;
  }

  /**
   * Commands the vehicle into natural wandering mode.
   */
  wander(id) {
    const record = this.vehicles.get(id);
    if (!record) return;

    record.arrive.active = false;
    record.wander.active = true;
    record.vehicle.maxSpeed = record.baseSpeed * 0.75;
    record.isMoving = true;
  }

  /**
   * Stops the vehicle smoothly.
   */
  stop(id) {
    const record = this.vehicles.get(id);
    if (!record) return;

    record.arrive.active = false;
    record.wander.active = false;
    record.vehicle.velocity.set(0, 0, 0);
    record.isMoving = false;
  }

  /**
   * Synchronizes the Yuka simulation loop with Three.js graphics and physics colliders.
   */
  update(delta) {
    // Clamp delta to avoid simulation jumps during frame drops
    const dt = Math.min(0.06, Math.max(0.001, delta));

    // 1. Step Yuka Game AI Engine
    this.entityManager.update(dt);

    // 2. Sync to Three.js transforms and resolve world collisions
    for (const [id, record] of this.vehicles.entries()) {
      const v = record.vehicle;
      const group = record.threeGroup;
      if (!group) continue;

      const speed = v.velocity.length();
      record.currentSpeed = speed;
      record.isMoving = speed > 0.15;

      // Update 2D horizontal plane position
      group.position.x = v.position.x;
      group.position.z = v.position.z;

      // Ground cleanly on faceted terrain
      group.position.y = getTerrainHeight(group.position.x, group.position.z);

      // Resolve solid world collisions (buildings, walls, props)
      if (this.colliders.length > 0) {
        resolveCircleCollision(group.position, 0.55, this.colliders, 2);
        // Feed corrected position back to Yuka vehicle
        v.position.x = group.position.x;
        v.position.z = group.position.z;
      }

      // Smooth heading orientation towards velocity direction
      if (record.isMoving) {
        const targetAngle = Math.atan2(v.velocity.x, v.velocity.z);
        let diff = targetAngle - group.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        group.rotation.y += diff * Math.min(1.0, dt * 10.0);
      }
    }
  }
}

