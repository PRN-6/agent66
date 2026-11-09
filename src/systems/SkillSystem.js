import * as THREE from 'three';
import { SKILLS, getSkillById } from '../config/skills.js';
import { audioSystem } from './AudioSystem.js';
import { getTerrainHeight } from '../utils/math.js';
import { resolveCircleCollision } from '../utils/collision.js';

export class SkillSystem {
  constructor(scene) {
    this.scene = scene;

    // Player Skill Progression State
    this.skillPoints = 3; // Starts with 3 SP to unlock and experiment with magic immediately!
    this.totalEarnedPoints = 3;

    // Starter skills unlocked across disciplines
    this.unlockedSkills = new Set([
      'whirlwind_slash',
      'starlight_orb',
      'brimstone_fireball',
      'steam_blast'
    ]);

    // Active 4 equipped hotbar slots: [Slot 0: Q, Slot 1: R, Slot 2: T, Slot 3: Y]
    this.equippedSlots = [
      'whirlwind_slash',
      'starlight_orb',
      'brimstone_fireball',
      'steam_blast'
    ];

    // Real-time Cooldown tracking: { skillId: remainingSeconds }
    this.cooldowns = {};

    // Active visual 3D magic spell entities in scene
    this.activeSpells = [];

    // Shared visual materials for low-poly stylized magic
    this.mats = {
      starlight: new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.95 }),
      starlightAura: new THREE.MeshBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.65, side: THREE.DoubleSide }),
      goldBeam: new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
      fireball: new THREE.MeshBasicMaterial({ color: 0xf97316 }),
      fireGlow: new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.75 }),
      netherFlame: new THREE.MeshBasicMaterial({ color: 0x7f1d1d, transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
      steamCloud: new THREE.MeshBasicMaterial({ color: 0xf1f5f9, transparent: true, opacity: 0.65 }),
      moltenIron: new THREE.MeshLambertMaterial({ color: 0xd97706, emissive: 0x9a3412, flatShading: true }),
      dwarfCog: new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true }),
      bladeSlash: new THREE.MeshBasicMaterial({ color: 0x60a5fa, transparent: true, opacity: 0.8, side: THREE.DoubleSide }),
      shadowTrail: new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
    };
  }

  // Check if a skill can be unlocked
  canUnlockSkill(skillId) {
    const skill = getSkillById(skillId);
    if (!skill) return false;
    if (this.unlockedSkills.has(skillId)) return false;
    if (this.skillPoints < skill.cost) return false;
    if (skill.requires && !this.unlockedSkills.has(skill.requires)) return false;
    return true;
  }

  // Unlock a skill from the Skill Tree
  unlockSkill(skillId) {
    const skill = getSkillById(skillId);
    if (!this.canUnlockSkill(skillId)) return false;

    this.skillPoints -= skill.cost;
    this.unlockedSkills.add(skillId);

    // Auto-equip to first empty slot or replace slot 3 if desired
    const emptyIdx = this.equippedSlots.findIndex(s => !s);
    if (emptyIdx !== -1) {
      this.equippedSlots[emptyIdx] = skillId;
    }

    audioSystem.playDoorChime(true);
    return true;
  }

  // Equip an unlocked skill to a specific hotbar slot (0 to 3)
  equipSkill(skillId, slotIndex) {
    if (!this.unlockedSkills.has(skillId)) return false;
    if (slotIndex < 0 || slotIndex >= 4) return false;

    // If already in another slot, swap it
    const existingIdx = this.equippedSlots.indexOf(skillId);
    if (existingIdx !== -1 && existingIdx !== slotIndex) {
      this.equippedSlots[existingIdx] = this.equippedSlots[slotIndex];
    }
    this.equippedSlots[slotIndex] = skillId;
    audioSystem.playFootstep('stone');
    return true;
  }

  // Reset & refund all skill points
  resetSkills() {
    this.skillPoints = this.totalEarnedPoints;
    this.unlockedSkills = new Set([
      'whirlwind_slash',
      'starlight_orb',
      'brimstone_fireball',
      'steam_blast'
    ]);
    this.equippedSlots = [
      'whirlwind_slash',
      'starlight_orb',
      'brimstone_fireball',
      'steam_blast'
    ];
    audioSystem.playTeleport();
  }

  // Granted when player levels up
  onLevelUp(newLevel) {
    const bonusSP = (newLevel % 5 === 0) ? 2 : 1;
    this.skillPoints += bonusSP;
    this.totalEarnedPoints += bonusSP;
  }

  // Cast spell equipped in slot (0: Q, 1: R, 2: T, 3: Y)
  castSpell(slotIndex, player, monsterManager, combatSystem) {
    if (player.isInVehicle) return { success: false, reason: 'mounted' };

    const skillId = this.equippedSlots[slotIndex];
    if (!skillId) return { success: false, reason: 'no_skill' };

    const skill = getSkillById(skillId);
    if (!skill) return { success: false, reason: 'invalid_skill' };

    // Check cooldown
    if (this.cooldowns[skillId] && this.cooldowns[skillId] > 0) {
      return { success: false, reason: 'cooldown', remaining: this.cooldowns[skillId] };
    }

    // Set Cooldown
    this.cooldowns[skillId] = skill.cooldown;

    // Trigger player casting swing animation
    player.triggerAttackAnim();

    // Play synthesized sound
    audioSystem.playSpellSound(skill.branch);

    // Forward direction vector of the player
    const forwardX = Math.sin(player.currentRotation);
    const forwardZ = Math.cos(player.currentRotation);
    const forwardVector = new THREE.Vector2(forwardX, forwardZ);

    // Handle Healing if skill has heal property
    if (skill.heal) {
      player.currentHp = Math.min(player.maxHp, player.currentHp + skill.heal);
      combatSystem.spawnFloatingText(player.position, `+${skill.heal} HP 💖`, '#34d399', true);
    }

    // Special Teleport Dash for Shadow Blink
    let spellOrigin = player.position.clone();
    if (skill.type === 'teleport_dash') {
      const dashDist = 8.5;
      const targetX = player.position.x + forwardX * dashDist;
      const targetZ = player.position.z + forwardZ * dashDist;

      // Spawn shadow streak behind
      this.spawnShadowStreak(player.position, new THREE.Vector3(targetX, player.position.y, targetZ));

      player.position.x = targetX;
      player.position.z = targetZ;
      resolveCircleCollision(player.position, player.radius, player.colliders, 3);
      player.position.y = getTerrainHeight(player.position.x, player.position.z);
      player.group.position.copy(player.position);
      spellOrigin = player.position.clone();
    }

    // Spawn 3D Visual Spell VFX
    this.spawnSpellVFX(skill, spellOrigin, forwardVector);

    // Apply AoE / Range damage to monsters
    const result = monsterManager.playerSpellAttack(skill, spellOrigin, forwardVector);

    // Banner Floating Text for Caster
    combatSystem.spawnFloatingText(
      player.position,
      `${skill.icon} ${skill.name}!`,
      skill.color || '#38bdf8',
      true
    );

    // Handle XP and Level Up if monsters were defeated
    if (result.totalXp > 0) {
      player.gainXP(result.totalXp, (newLevel) => {
        this.onLevelUp(newLevel);
        combatSystem.triggerLevelUp(player.group, player.characterId, newLevel);
      });
    }

    return {
      success: true,
      skill,
      hits: result.hitCount,
      damage: result.totalDamage,
      xp: result.totalXp,
      killed: result.killedCount
    };
  }

  // --- 3D Visual Effects Spawner ---
  spawnSpellVFX(skill, pos, forwardVector) {
    const y = pos.y + 0.5;

    if (skill.type === 'projectile') {
      // 1. Moving Projectile Sphere (Starlight Orb or Brimstone Fireball)
      const isFire = (skill.branch === 'nether');
      const geom = new THREE.SphereGeometry(isFire ? 0.75 : 0.6, 12, 12);
      const mesh = new THREE.Mesh(geom, isFire ? this.mats.fireball : this.mats.starlight);
      mesh.position.set(pos.x, y + 0.8, pos.z);
      this.scene.add(mesh);

      // Trailing glow light
      const glowLight = new THREE.PointLight(isFire ? 0xef4444 : 0x38bdf8, 2.5, 12);
      glowLight.position.copy(mesh.position);
      this.scene.add(glowLight);

      this.activeSpells.push({
        type: 'projectile',
        mesh: mesh,
        light: glowLight,
        vx: forwardVector.x * 24.0,
        vz: forwardVector.y * 24.0,
        life: 0,
        maxLife: 0.75,
        skill: skill
      });
    } else if (skill.type === 'aoe_aura' || skill.type === 'whirlwind') {
      // 2. Expanding Ground Aura Ring (Celestial Ward / Whirlwind Slash)
      const ringGeom = new THREE.RingGeometry(0.8, 1.8, 28);
      ringGeom.rotateX(-Math.PI / 2);
      const mesh = new THREE.Mesh(ringGeom, skill.branch === 'celestial' ? this.mats.starlightAura : this.mats.bladeSlash);
      mesh.position.set(pos.x, y + 0.15, pos.z);
      this.scene.add(mesh);

      this.activeSpells.push({
        type: 'expanding_ring',
        mesh: mesh,
        maxRadius: skill.radius,
        life: 0,
        maxLife: 0.65
      });
    } else if (skill.type === 'sky_beam') {
      // 3. Colossal Vertical Pillar Descending from Heaven (Supernova Beam / Heavenly Judgment)
      const isBlade = (skill.id === 'heavenly_judgment');
      const beamGeom = new THREE.CylinderGeometry(skill.radius * 0.45, skill.radius * 0.65, 36, 18, 1, true);
      const mesh = new THREE.Mesh(beamGeom, isBlade ? this.mats.goldBeam : this.mats.starlight);
      mesh.position.set(pos.x, y + 18, pos.z);
      this.scene.add(mesh);

      // Ground burst ring
      const groundRing = new THREE.Mesh(new THREE.RingGeometry(1, skill.radius, 32).rotateX(-Math.PI / 2), this.mats.goldBeam);
      groundRing.position.set(pos.x, y + 0.2, pos.z);
      this.scene.add(groundRing);

      this.activeSpells.push({
        type: 'sky_beam',
        mesh: mesh,
        groundRing: groundRing,
        life: 0,
        maxLife: 1.1
      });
    } else if (skill.type === 'ground_burst' || skill.type === 'ring_burst') {
      // 4. Volcanic Magma Fissure & Nether Cataclysm Spikes
      const count = (skill.type === 'ring_burst') ? 8 : 4;
      const spikeMeshes = [];

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const dist = 3.0 + Math.random() * (skill.radius - 3.5);
        const sx = pos.x + Math.cos(angle) * dist;
        const sz = pos.z + Math.sin(angle) * dist;
        const sy = getTerrainHeight(sx, sz);

        const spike = new THREE.Mesh(
          new THREE.ConeGeometry(0.8, 3.2, 5),
          this.mats.fireGlow
        );
        spike.position.set(sx, sy - 1.5, sz);
        this.scene.add(spike);
        spikeMeshes.push(spike);
      }

      this.activeSpells.push({
        type: 'magma_spikes',
        spikes: spikeMeshes,
        life: 0,
        maxLife: 0.95
      });
    } else if (skill.type === 'cone') {
      // 5. Pressurized Steam Conical Cloud
      const steamMeshes = [];
      for (let i = 0; i < 6; i++) {
        const spread = (Math.random() - 0.5) * 1.5;
        const fDist = 2.0 + Math.random() * 5.0;
        const cx = pos.x + forwardVector.x * fDist + (-forwardVector.y) * spread;
        const cz = pos.z + forwardVector.y * fDist + (forwardVector.x) * spread;

        const steamBall = new THREE.Mesh(new THREE.SphereGeometry(1.1, 8, 8), this.mats.steamCloud);
        steamBall.position.set(cx, y + 0.8, cz);
        this.scene.add(steamBall);
        steamMeshes.push(steamBall);
      }

      this.activeSpells.push({
        type: 'steam_blast',
        meshes: steamMeshes,
        life: 0,
        maxLife: 0.55
      });
    } else if (skill.type === 'earth_quake') {
      // 6. Titan Seismic Earth-Quake (Rotating Iron Cogs popping from earth)
      const cogs = [];
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const cx = pos.x + Math.cos(angle) * 5.5;
        const cz = pos.z + Math.sin(angle) * 5.5;
        const cy = getTerrainHeight(cx, cz);

        const cogMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.4, 8), this.mats.dwarfCog);
        cogMesh.position.set(cx, cy + 0.2, cz);
        this.scene.add(cogMesh);
        cogs.push(cogMesh);
      }

      this.activeSpells.push({
        type: 'earth_quake',
        cogs: cogs,
        life: 0,
        maxLife: 1.1
      });
    }
  }

  // Shadow dash streak line
  spawnShadowStreak(startPos, endPos) {
    const geom = new THREE.CylinderGeometry(0.4, 0.4, 8.5, 8);
    geom.rotateX(Math.PI / 2);
    const streak = new THREE.Mesh(geom, this.mats.shadowTrail);
    streak.position.lerpVectors(startPos, endPos, 0.5);
    streak.position.y += 1.2;
    this.scene.add(streak);

    this.activeSpells.push({
      type: 'fade_mesh',
      mesh: streak,
      life: 0,
      maxLife: 0.35
    });
  }

  // Update cooldowns and active spell visual entities
  update(delta) {
    // 1. Decrement Cooldowns
    for (const id in this.cooldowns) {
      if (this.cooldowns[id] > 0) {
        this.cooldowns[id] = Math.max(0, this.cooldowns[id] - delta);
      }
    }

    // 2. Update Active Spell Visual Entities
    for (let i = this.activeSpells.length - 1; i >= 0; i--) {
      const sp = this.activeSpells[i];
      sp.life += delta;
      const progress = sp.life / sp.maxLife;

      if (sp.type === 'projectile') {
        sp.mesh.position.x += sp.vx * delta;
        sp.mesh.position.z += sp.vz * delta;
        sp.light.position.copy(sp.mesh.position);
        sp.mesh.rotation.y += delta * 12;

        if (sp.life >= sp.maxLife) {
          this.scene.remove(sp.mesh);
          this.scene.remove(sp.light);
          sp.mesh.geometry.dispose();
          sp.light.dispose();
          this.activeSpells.splice(i, 1);
        }
      } else if (sp.type === 'expanding_ring') {
        const currentScale = 1.0 + progress * 5.0;
        sp.mesh.scale.set(currentScale, 1, currentScale);
        sp.mesh.material.opacity = Math.max(0, 0.9 * (1.0 - progress));

        if (sp.life >= sp.maxLife) {
          this.scene.remove(sp.mesh);
          sp.mesh.geometry.dispose();
          this.activeSpells.splice(i, 1);
        }
      } else if (sp.type === 'sky_beam') {
        sp.mesh.rotation.y += delta * 2.5;
        sp.mesh.material.opacity = Math.max(0, 0.85 * (1.0 - progress));
        sp.groundRing.scale.set(1 + progress * 1.5, 1, 1 + progress * 1.5);
        sp.groundRing.material.opacity = Math.max(0, 0.85 * (1.0 - progress));

        if (sp.life >= sp.maxLife) {
          this.scene.remove(sp.mesh);
          this.scene.remove(sp.groundRing);
          sp.mesh.geometry.dispose();
          sp.groundRing.geometry.dispose();
          this.activeSpells.splice(i, 1);
        }
      } else if (sp.type === 'magma_spikes') {
        sp.spikes.forEach(s => {
          if (progress < 0.4) {
            s.position.y += delta * 7.0; // Erupt out of ground!
          } else {
            s.scale.multiplyScalar(0.96); // Fade back
          }
        });

        if (sp.life >= sp.maxLife) {
          sp.spikes.forEach(s => {
            this.scene.remove(s);
            s.geometry.dispose();
          });
          this.activeSpells.splice(i, 1);
        }
      } else if (sp.type === 'steam_blast') {
        sp.meshes.forEach(m => {
          m.scale.addScalar(delta * 2.8);
          m.position.y += delta * 1.4;
        });

        if (sp.life >= sp.maxLife) {
          sp.meshes.forEach(m => {
            this.scene.remove(m);
            m.geometry.dispose();
          });
          this.activeSpells.splice(i, 1);
        }
      } else if (sp.type === 'earth_quake') {
        sp.cogs.forEach(c => {
          c.rotation.y += delta * 8.0;
          if (progress < 0.4) {
            c.position.y += delta * 4.0;
          }
        });

        if (sp.life >= sp.maxLife) {
          sp.cogs.forEach(c => {
            this.scene.remove(c);
            c.geometry.dispose();
          });
          this.activeSpells.splice(i, 1);
        }
      } else if (sp.type === 'fade_mesh') {
        sp.mesh.material.opacity = Math.max(0, 0.8 * (1.0 - progress));
        if (sp.life >= sp.maxLife) {
          this.scene.remove(sp.mesh);
          sp.mesh.geometry.dispose();
          this.activeSpells.splice(i, 1);
        }
      }
    }
  }

  // Status for HUD hotbar slots
  getHotbarState() {
    return this.equippedSlots.map(skillId => {
      if (!skillId) return null;
      const skill = getSkillById(skillId);
      const remaining = this.cooldowns[skillId] || 0;
      const total = skill.cooldown || 1;
      const percent = Math.min(1.0, Math.max(0, remaining / total));

      return {
        id: skill.id,
        name: skill.name,
        icon: skill.icon,
        color: skill.color,
        remaining: remaining,
        percent: percent,
        onCooldown: remaining > 0.05
      };
    });
  }
}

