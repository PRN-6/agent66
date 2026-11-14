/**
 * ItemDropSystem.js
 * 
 * Interactive 3D World Item Drop & Spawner Engine for Agent66.
 * Spawns floating, rotating low-poly weapons, potions, gold chests, and mythical relics.
 * Supports auto-pickup on proximity and direct God Mode inventory equipping.
 */

import * as THREE from 'three';
import { audioSystem } from './AudioSystem.js';
import { getTerrainHeight } from '../utils/math.js';

export const ITEM_DEFINITIONS = [
  // --- WEAPONS ---
  {
    id: 'weapon_dawnblade',
    category: 'weapon',
    name: 'Dawnblade of Valoria',
    rarity: 'legendary',
    icon: '🗡️',
    color: '#fbbf24',
    bonusAttack: 65,
    desc: 'Golden holy claymore forged in High Valoria Citadel. Radiates pure solar dawn energy (+65 ATK).'
  },
  {
    id: 'weapon_starlight',
    category: 'weapon',
    name: 'Starlight Moon Rapier',
    rarity: 'epic',
    icon: '✨',
    color: '#38bdf8',
    bonusAttack: 58,
    desc: 'Elven silver rapier channelled with ancient moon starlight (+58 ATK).'
  },
  {
    id: 'weapon_cleaver',
    category: 'weapon',
    name: 'Nether Cleaver of Malakor',
    rarity: 'legendary',
    icon: '🔥',
    color: '#ef4444',
    bonusAttack: 80,
    desc: 'Gargantuan basalt nether blade dripping with demonic hellfire (+80 ATK).'
  },
  {
    id: 'weapon_muramasa',
    category: 'weapon',
    name: 'Muramasa Void Katana',
    rarity: 'legendary',
    icon: '⚔️',
    color: '#a855f7',
    bonusAttack: 75,
    desc: 'Master Kage’s cursed shadow katana with zero-delay edge alignment (+75 ATK).'
  },
  {
    id: 'weapon_staff',
    category: 'weapon',
    name: 'Archmage Celestial Staff',
    rarity: 'epic',
    icon: '🪄',
    color: '#06b6d4',
    bonusAttack: 60,
    desc: 'Carved mahogany staff topped with a rotating mana crystal (+60 ATK).'
  },
  {
    id: 'weapon_broadsword',
    category: 'weapon',
    name: 'Vanguard Broadsword',
    rarity: 'rare',
    icon: '🛡️',
    color: '#94a3b8',
    bonusAttack: 50,
    desc: 'Master Vance’s veteran broadsword forged of tempered castle steel (+50 ATK).'
  },

  // --- POTIONS & CONSUMABLES ---
  {
    id: 'potion_health',
    category: 'consumable',
    name: 'Greater Elixir of Life',
    rarity: 'rare',
    icon: '🧪',
    color: '#ef4444',
    healAmount: 200,
    desc: 'Restores 200 Health Points immediately and cures all fatigue.'
  },
  {
    id: 'potion_mana',
    category: 'consumable',
    name: 'Celestial Mana Ambrosia',
    rarity: 'epic',
    icon: '💧',
    color: '#38bdf8',
    resetCooldowns: true,
    desc: 'Overflowing flask of celestial nectar. Resets all magic skill cooldowns instantly!'
  },
  {
    id: 'potion_strength',
    category: 'consumable',
    name: 'Potion of Titan Strength',
    rarity: 'epic',
    icon: '💪',
    color: '#f97316',
    buffAttack: 40,
    desc: 'Temporarily boosts attack power by +40 and grants heroic poise.'
  },
  {
    id: 'potion_revive',
    category: 'consumable',
    name: 'Golden Phoenix Feather',
    rarity: 'legendary',
    icon: '🪶',
    color: '#eab308',
    fullHeal: true,
    desc: 'Sacred feather that instantly heals player and companion to 100% Max HP!'
  },
  {
    id: 'potion_feast',
    category: 'consumable',
    name: 'Royal Roasted Feast',
    rarity: 'common',
    icon: '🍗',
    color: '#d97706',
    healAmount: 120,
    desc: 'Tavern-cooked banquet meat. Restores 120 HP.'
  },

  // --- TREASURES & RELICS ---
  {
    id: 'treasure_gold_chest',
    category: 'treasure',
    name: 'Royal Chest of 500 Gold',
    rarity: 'legendary',
    icon: '🪙',
    color: '#f59e0b',
    goldAmount: 500,
    desc: 'Heavy iron-banded chest filled to the brim with 500 minted Valorian Gold coins.'
  },
  {
    id: 'treasure_gold_pouch',
    category: 'treasure',
    name: 'Merchant Pouch of 150 Gold',
    rarity: 'rare',
    icon: '💰',
    color: '#fbbf24',
    goldAmount: 150,
    desc: 'Leather coin pouch containing 150 shiny gold pieces.'
  },
  {
    id: 'relic_lotus',
    category: 'relic',
    name: 'Luminous Starlight Lotus',
    rarity: 'epic',
    icon: '🌸',
    color: '#38bdf8',
    xpAmount: 150,
    healAmount: 80,
    desc: 'Sacred botanical bloom from Sylvaheim Glade. Grants +150 XP and +80 HP.'
  },
  {
    id: 'relic_nether_core',
    category: 'relic',
    name: 'Void Nether Core',
    rarity: 'legendary',
    icon: '🔮',
    color: '#b91c1c',
    xpAmount: 300,
    goldAmount: 250,
    desc: 'Pulsing core of volcanic void energy. Grants +300 XP and +250 Gold.'
  },
  {
    id: 'relic_dwarf_cog',
    category: 'relic',
    name: 'Dwarven Mithril Cog',
    rarity: 'rare',
    icon: '⚙️',
    color: '#d97706',
    xpAmount: 180,
    goldAmount: 180,
    desc: 'Masterwork gear crafted by Karak-Drak engineers. Grants +180 XP and +180 Gold.'
  }
];

export class ItemDropSystem {
  constructor(scene, gameApp) {
    this.scene = scene;
    this.gameApp = gameApp;

    // Active item drop instances in the 3D world: Array<{ id, itemDef, group, light, spawnPos, time }>
    this.drops = [];

    // Shared reusable materials
    this.mats = {
      gold: new THREE.MeshLambertMaterial({ color: 0xf59e0b, emissive: 0x78350f, flatShading: true }),
      steel: new THREE.MeshLambertMaterial({ color: 0xe2e8f0, flatShading: true }),
      wood: new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true }),
      nether: new THREE.MeshLambertMaterial({ color: 0x991b1b, emissive: 0x450a0a, flatShading: true }),
      potionRed: new THREE.MeshLambertMaterial({ color: 0xef4444, transparent: true, opacity: 0.85, flatShading: true }),
      potionBlue: new THREE.MeshLambertMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.85, flatShading: true }),
      potionOrange: new THREE.MeshLambertMaterial({ color: 0xf97316, transparent: true, opacity: 0.85, flatShading: true }),
      glass: new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4 }),
      beaconRing: new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    };
  }

  getItemDef(itemId) {
    return ITEM_DEFINITIONS.find(item => item.id === itemId) || null;
  }

  /**
   * Spawns an item drop directly in the 3D world at coordinates (x, z).
   */
  spawnDrop(itemId, x, z) {
    const itemDef = this.getItemDef(itemId);
    if (!itemDef) return null;

    const terrainY = getTerrainHeight(x, z);
    const spawnPos = new THREE.Vector3(x, terrainY + 1.2, z);

    const group = new THREE.Group();
    group.position.copy(spawnPos);

    // 1. Build stylized 3D model according to category
    const model = this.createDropModel(itemDef);
    group.add(model);

    // 2. Add glowing aura light
    const hexColor = parseInt(itemDef.color.replace('#', '0x'));
    const light = new THREE.PointLight(hexColor, 2.0, 8);
    light.position.set(0, 0.4, 0);
    group.add(light);

    // 3. Ground beacon ring
    const ringGeom = new THREE.RingGeometry(0.55, 0.8, 16);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: hexColor,
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide
    });
    const groundRing = new THREE.Mesh(ringGeom, ringMat);
    groundRing.position.set(0, -0.9, 0);
    group.add(groundRing);

    this.scene.add(group);

    const drop = {
      id: 'drop_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      itemDef,
      group,
      light,
      groundRing,
      baseY: terrainY + 1.2,
      time: Math.random() * 10
    };

    this.drops.push(drop);

    // Floating spawn notification
    if (this.gameApp.combatSystem) {
      this.gameApp.combatSystem.spawnFloatingText(spawnPos, `🎁 ${itemDef.name} Spawned!`, itemDef.color);
    }

    audioSystem.playDoorChime(true);
    return drop;
  }

  /**
   * Spawns an item at the player's current location with a slight forward offset.
   */
  spawnAtPlayer(itemId) {
    if (!this.gameApp || !this.gameApp.player) return null;
    const player = this.gameApp.player;
    const angle = player.currentRotation || 0;
    const spawnX = player.position.x + Math.sin(angle) * 2.2;
    const spawnZ = player.position.z + Math.cos(angle) * 2.2;
    return this.spawnDrop(itemId, spawnX, spawnZ);
  }

  /**
   * Immediately applies item or equips it directly without dropping on the ground.
   */
  giveDirectly(itemId) {
    const itemDef = this.getItemDef(itemId);
    if (!itemDef || !this.gameApp || !this.gameApp.player) return false;

    this.applyItemEffect(itemDef, true);
    return true;
  }

  /**
   * Creates stylized low-poly 3D models for dropped items.
   */
  createDropModel(itemDef) {
    const modelGroup = new THREE.Group();

    if (itemDef.category === 'weapon') {
      // 3D Floating Sword
      const bladeMat = itemDef.id === 'weapon_cleaver' ? this.mats.nether : (itemDef.id === 'weapon_dawnblade' ? this.mats.gold : this.mats.steel);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.4, 0.08), bladeMat);
      blade.position.y = 0.5;

      const cross = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.08, 0.12), this.mats.gold);
      cross.position.y = -0.15;

      const hilt = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.35, 6), this.mats.wood);
      hilt.position.y = -0.32;

      const pommel = new THREE.Mesh(new THREE.SphereGeometry(0.08, 6, 6), this.mats.gold);
      pommel.position.y = -0.52;

      modelGroup.add(blade, cross, hilt, pommel);
      modelGroup.rotation.z = Math.PI / 6;
      modelGroup.scale.set(1.2, 1.2, 1.2);

    } else if (itemDef.category === 'consumable') {
      if (itemDef.id === 'potion_feast') {
        // Roasted banquet roast turkey on bone
        const bone = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), this.mats.steel);
        bone.rotation.z = Math.PI / 4;
        const meat = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), this.mats.wood);
        meat.scale.set(1.4, 1.0, 1.0);
        modelGroup.add(bone, meat);
      } else {
        // 3D Glass Potion Flask
        const potMat = itemDef.id === 'potion_health' ? this.mats.potionRed : (itemDef.id === 'potion_mana' ? this.mats.potionBlue : this.mats.potionOrange);
        const flaskBody = new THREE.Mesh(new THREE.SphereGeometry(0.32, 10, 10), potMat);
        flaskBody.position.y = 0;

        const flaskNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 0.28, 8), this.mats.glass);
        flaskNeck.position.y = 0.36;

        const cork = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.12, 6), this.mats.wood);
        cork.position.y = 0.52;

        modelGroup.add(flaskBody, flaskNeck, cork);
        modelGroup.scale.set(1.3, 1.3, 1.3);
      }

    } else if (itemDef.category === 'treasure') {
      // 3D Wooden Chest with Brass Bands
      const chestBase = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.45, 0.48), this.mats.wood);
      const chestLid = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.7, 8, 1, false, 0, Math.PI), this.mats.gold);
      chestLid.rotation.z = Math.PI / 2;
      chestLid.position.y = 0.24;

      modelGroup.add(chestBase, chestLid);
      modelGroup.scale.set(1.1, 1.1, 1.1);

    } else {
      // 3D Floating Relic / Crystal
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.38, 0), this.mats.gold);
      crystal.scale.set(0.9, 1.5, 0.9);
      modelGroup.add(crystal);
    }

    return modelGroup;
  }

  /**
   * Applies the benefits of collecting or using an item.
   */
  applyItemEffect(itemDef, directEquip = false) {
    const player = this.gameApp.player;
    if (!player) return;

    if (itemDef.bonusAttack) {
      player.attackPower += itemDef.bonusAttack;
      if (this.gameApp.combatSystem) {
        this.gameApp.combatSystem.spawnFloatingText(
          player.position,
          `⚔️ Equipped ${itemDef.name} (+${itemDef.bonusAttack} ATK)!`,
          '#fbbf24',
          true
        );
      }
    }

    if (itemDef.healAmount) {
      player.currentHp = Math.min(player.maxHp, player.currentHp + itemDef.healAmount);
      if (this.gameApp.combatSystem) {
        this.gameApp.combatSystem.spawnFloatingText(
          player.position,
          `+${itemDef.healAmount} HP 💖`,
          '#34d399',
          true
        );
      }
    }

    if (itemDef.fullHeal) {
      player.currentHp = player.maxHp;
      const pet = this.gameApp.monsterManager?.getTamedMonster();
      if (pet) {
        pet.currentHp = pet.maxHp;
        if (pet.updateHpBar) pet.updateHpBar(pet.currentHp, pet.maxHp, pet.level, true);
      }
      if (this.gameApp.combatSystem) {
        this.gameApp.combatSystem.spawnFloatingText(
          player.position,
          `✨ 100% Full Vitality Restored!`,
          '#eab308',
          true
        );
      }
    }

    if (itemDef.goldAmount) {
      player.addGold(itemDef.goldAmount);
      if (this.gameApp.hud) {
        this.gameApp.hud.updateLevel(player.level, player.xp, player.xpToNext, player.gold);
      }
      if (this.gameApp.combatSystem) {
        this.gameApp.combatSystem.spawnFloatingText(
          player.position,
          `+${itemDef.goldAmount} Gold 🪙`,
          '#f59e0b',
          true
        );
      }
    }

    if (itemDef.xpAmount) {
      player.gainXP(itemDef.xpAmount, (lvl) => {
        if (this.gameApp.combatSystem) {
          this.gameApp.combatSystem.triggerLevelUp(player.group, player.characterId, lvl);
        }
      });
      if (this.gameApp.hud) {
        this.gameApp.hud.updateLevel(player.level, player.xp, player.xpToNext, player.gold);
      }
    }

    if (itemDef.resetCooldowns) {
      if (this.gameApp.skillSystem) {
        this.gameApp.skillSystem.cooldowns = {};
        if (this.gameApp.hud && this.gameApp.hud.updateSkillCooldowns) {
          this.gameApp.hud.updateSkillCooldowns({});
        }
      }
      if (this.gameApp.combatSystem) {
        this.gameApp.combatSystem.spawnFloatingText(
          player.position,
          `⚡ All Skill Cooldowns Reset!`,
          '#38bdf8',
          true
        );
      }
    }

    audioSystem.playDoorChime(true);
  }

  /**
   * Main animation loop: bobs floating drops, rotates beacon, and checks player proximity.
   */
  update(delta, playerPos) {
    if (this.drops.length === 0) return;

    for (let i = this.drops.length - 1; i >= 0; i--) {
      const drop = this.drops[i];
      drop.time += delta;

      // 1. Gentle floating bob & 360 rotation
      const bobY = Math.sin(drop.time * 2.8) * 0.22;
      drop.group.position.y = drop.baseY + bobY;
      drop.group.rotation.y += delta * 1.6;

      if (drop.groundRing) {
        drop.groundRing.rotation.z += delta * 1.8;
      }

      // 2. Check player proximity for auto-pickup (~2.4 meters)
      if (playerPos) {
        const dx = drop.group.position.x - playerPos.x;
        const dz = drop.group.position.z - playerPos.z;
        const dist = Math.hypot(dx, dz);

        if (dist <= 2.4) {
          // Player collected item!
          this.applyItemEffect(drop.itemDef, false);

          // Clean up drop from scene with geometry/material disposal
          this.disposeGroup(drop.group);
          this.scene.remove(drop.group);
          this.drops.splice(i, 1);
        }
      }
    }
  }

  /**
   * Helper to safely dispose meshes in a group
   */
  disposeGroup(group) {
    if (!group) return;
    group.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      // Materials in this.mats are shared and shouldn't be disposed,
      // but dynamically created materials (e.g. Rings) can be disposed
      if (obj.material && !Object.values(this.mats).includes(obj.material)) {
        if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });
  }

  /**
   * Spawns physical interactive world props (Bonfire, Mana Crystal, Training Dummy, Treasure Chest)
   */
  spawnProp(propType, x, z) {
    const y = getTerrainHeight(x, z);
    const group = new THREE.Group();
    group.position.set(x, y, z);

    if (propType === 'bonfire') {
      // Stone ring
      const stoneMat = new THREE.MeshLambertMaterial({ color: 0x475569, flatShading: true });
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 0), stoneMat);
        stone.position.set(Math.cos(angle) * 0.9, 0.15, Math.sin(angle) * 0.9);
        group.add(stone);
      }
      // Wood logs
      const logMat = new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true });
      for (let i = 0; i < 4; i++) {
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.1, 6), logMat);
        log.rotation.z = Math.PI / 4;
        log.rotation.y = (i * Math.PI) / 2;
        log.position.y = 0.25;
        group.add(log);
      }
      // Glowing flame cones
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xf97316 });
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.1, 6), flameMat);
      flame.position.y = 0.65;
      group.add(flame);
      // Light
      const fireLight = new THREE.PointLight(0xf97316, 2.8, 16);
      fireLight.position.set(0, 0.9, 0);
      group.add(fireLight);

    } else if (propType === 'crystal_pylon') {
      // Stone base pedestal
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.1, 1.2, 8), new THREE.MeshLambertMaterial({ color: 0x334155, flatShading: true }));
      base.position.y = 0.6;
      group.add(base);
      // Floating cyan mana crystal
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), new THREE.MeshBasicMaterial({ color: 0x06b6d4 }));
      crystal.position.y = 2.4;
      group.add(crystal);
      const light = new THREE.PointLight(0x38bdf8, 3.0, 18);
      light.position.set(0, 2.4, 0);
      group.add(light);

    } else if (propType === 'training_dummy') {
      // Wooden post
      const wood = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 6), new THREE.MeshLambertMaterial({ color: 0x78350f, flatShading: true }));
      wood.position.y = 1.1;
      // Straw body
      const straw = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.35, 1.2, 8), new THREE.MeshLambertMaterial({ color: 0xd97706, flatShading: true }));
      straw.position.y = 1.35;
      // Target shield
      const shield = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 12), new THREE.MeshLambertMaterial({ color: 0xef4444, flatShading: true }));
      shield.rotation.x = Math.PI / 2;
      shield.position.set(0, 1.35, 0.4);
      group.add(wood, straw, shield);

    } else {
      // Large Royal Treasure Chest
      const base = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 0.8), this.mats.wood);
      base.position.y = 0.35;
      const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.2, 8, 1, false, 0, Math.PI), this.mats.gold);
      lid.rotation.z = Math.PI / 2;
      lid.position.y = 0.7;
      const light = new THREE.PointLight(0xf59e0b, 2.0, 10);
      light.position.set(0, 0.8, 0);
      group.add(base, lid, light);
    }

    this.scene.add(group);
    audioSystem.playDoorChime(true);
    if (this.gameApp.combatSystem) {
      this.gameApp.combatSystem.spawnFloatingText(new THREE.Vector3(x, y + 2.0, z), `🏛️ Built ${propType.replace('_', ' ')}!`, '#38bdf8');
    }
    return group;
  }

  /**
   * Removes all dropped items from the world.
   */
  clearAll() {
    for (const drop of this.drops) {
      this.disposeGroup(drop.group);
      this.scene.remove(drop.group);
    }
    this.drops = [];
  }
}
