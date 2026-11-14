import * as THREE from 'three';
import { audioSystem } from '../systems/AudioSystem.js';
import { BRAIN_TIERS } from './NPCBrain.js';

/**
 * SocialEncounterEngine (Inspired by Stanford Generative Agents & AI Town)
 * 
 * Manages autonomous, emergent social encounters when NPCs cross paths:
 * - Detects physical proximity between characters (< 4.2m)
 * - Pauses movement so they turn and face one another
 * - Generates contextual dialogue based on their lore, relationship, and day-night phase
 * - Logs episodic memories into both characters' NPCBrain streams with importance scoring
 * - Renders 3D floating speech bubbles with character-signature heraldic colors
 */
export class SocialEncounterEngine {
  constructor(gameApp) {
    this.gameApp = gameApp;
    this.activeConversations = new Map(); // idA_idB -> { npcA, npcB, timer, duration, lines }
    this.cooldowns = new Map();           // pairKey -> timestamp
    this.encounterCheckTimer = 0;
    this.conversationDuration = 4.2;      // seconds per dialogue exchange
    this.cooldownDuration = 38.0;         // seconds before same pair can talk again
  }

  update(delta) {
    this.updateActiveConversations(delta);

    this.encounterCheckTimer -= delta;
    if (this.encounterCheckTimer <= 0) {
      this.encounterCheckTimer = 0.6; // Scan for nearby candidates twice per second
      this.scanForEncounters();
    }
  }

  getPairKey(idA, idB) {
    return idA < idB ? `${idA}_${idB}` : `${idB}_${idA}`;
  }

  /**
   * Scans all active NPCs across the world to detect spontaneous encounters.
   */
  scanForEncounters() {
    const allCitizens = this.collectAllCitizens();
    if (allCitizens.length < 2) return;

    const now = performance.now() * 0.001;
    const triggerRadius = 3.8; // Proximity threshold in meters

    for (let i = 0; i < allCitizens.length; i++) {
      const a = allCitizens[i];
      if (a.isTalking || a.isInteracting || (a.entity?.state && a.entity.state === 'fighting')) continue;

      for (let j = i + 1; j < allCitizens.length; j++) {
        const b = allCitizens[j];
        if (b.isTalking || b.isInteracting || (b.entity?.state && b.entity.state === 'fighting')) continue;

        // Both belong to same character id (e.g. self)
        if (a.id === b.id) continue;

        const pairKey = this.getPairKey(a.id, b.id);
        const lastChat = this.cooldowns.get(pairKey) || 0;
        if (now - lastChat < this.cooldownDuration) continue;

        const posA = a.getPosition();
        const posB = b.getPosition();
        if (!posA || !posB) continue;

        const dist = Math.hypot(posA.x - posB.x, posA.z - posB.z);
        if (dist <= triggerRadius) {
          this.initiateConversation(a, b, pairKey, now);
          return; // Trigger one conversation per check tick to keep pacing natural
        }
      }
    }
  }

  collectAllCitizens() {
    const list = [];

    // 1. The active player / hero
    if (this.gameApp.player) {
      const p = this.gameApp.player;
      list.push({
        id: p.characterId || 'hero',
        name: p.getCharacterConfig()?.name || 'Aiden',
        badge: p.getCharacterConfig()?.badge || 'Hero',
        race: p.getCharacterConfig()?.race || 'human',
        color: p.getCharacterConfig()?.color || '#3b82f6',
        entity: p,
        brain: p.brain,
        getPosition: () => p.position,
        isTalking: p.isAutonomous ? p._inAutoConversation : false
      });
    }

    // 2. The remaining 5 main characters
    if (this.gameApp.npcManager?.npcs) {
      this.gameApp.npcManager.npcs.forEach((data, id) => {
        if (!data.group || !data.group.visible) return;
        list.push({
          id: id,
          name: data.config?.name || id,
          badge: data.config?.badge || 'Main Character',
          race: data.config?.race || 'human',
          color: data.config?.color || '#a855f7',
          entity: data,
          brain: data.brain,
          getPosition: () => data.group.position,
          isTalking: data._inAutoConversation
        });
      });
    }

    return list;
  }

  initiateConversation(a, b, pairKey, now) {
    this.cooldowns.set(pairKey, now);

    a.isTalking = true;
    b.isTalking = true;
    if (a.entity) a.entity._inAutoConversation = true;
    if (b.entity) b.entity._inAutoConversation = true;

    // Face each other
    const posA = a.getPosition();
    const posB = b.getPosition();
    this.orientTowards(a.entity, posB);
    this.orientTowards(b.entity, posA);

    // Contextual Dialogue Lines
    const lines = this.generateDialogueLines(a, b);

    // Save active conversation
    this.activeConversations.set(pairKey, {
      a,
      b,
      timer: this.conversationDuration,
      lines,
      step: 0
    });

    // 1. Show First Line from A
    this.speakLine(a, lines.lineA, 0.2);

    // 2. Schedule Reply from B
    setTimeout(() => {
      if (this.activeConversations.has(pairKey)) {
        this.speakLine(b, lines.lineB, 0.4);
      }
    }, 1800);

    // 3. Record shared episodic memories in both brains
    if (a.brain) {
      a.brain.recordMemory(
        `Spoke with ${b.name}: "${lines.lineA}" (They replied: "${lines.lineB}")`,
        'CONVERSATION',
        7
      );
    }
    if (b.brain) {
      b.brain.recordMemory(
        `Spoke with ${a.name}: "${lines.lineB}" (They had said: "${lines.lineA}")`,
        'CONVERSATION',
        7
      );
    }

    // Play procedural RPG dialogue chime
    audioSystem.playChime();
  }

  speakLine(citizen, text, delay = 0) {
    if (!citizen || !text || !this.gameApp.combatSystem) return;

    const pos = citizen.getPosition().clone();
    pos.y += 2.8;

    const tag = `💬 ${citizen.name}: "${text}"`;
    this.gameApp.combatSystem.spawnFloatingText(pos, tag, citizen.color || '#38bdf8', false);

    if (this.gameApp.hud) {
      this.gameApp.hud.showAutonomousThoughtToast(citizen.name, `"${text}"`);
    }
  }

  orientTowards(entity, targetPos) {
    if (!entity || !targetPos) return;
    const pos = entity.position || entity.group?.position;
    if (!pos) return;

    const dx = targetPos.x - pos.x;
    const dz = targetPos.z - pos.z;
    const angle = Math.atan2(dx, dz);

    if (entity.currentRotation !== undefined) {
      entity.currentRotation = angle;
      entity.targetRotation = angle;
    }
    if (entity.group) {
      entity.group.rotation.y = angle;
    }
  }

  updateActiveConversations(delta) {
    if (this.activeConversations.size === 0) return;

    for (const [key, conv] of this.activeConversations.entries()) {
      conv.timer -= delta;

      // Keep both entities in an attentive idle stance
      this.maintainConversationPose(conv.a.entity, delta);
      this.maintainConversationPose(conv.b.entity, delta);

      if (conv.timer <= 0) {
        // Wrap up conversation
        conv.a.isTalking = false;
        conv.b.isTalking = false;
        if (conv.a.entity) conv.a.entity._inAutoConversation = false;
        if (conv.b.entity) conv.b.entity._inAutoConversation = false;
        this.activeConversations.delete(key);
      }
    }
  }

  maintainConversationPose(entity, delta) {
    if (!entity) return;

    // Zero out walking limbs
    if (entity.animNodes?.legL) entity.animNodes.legL.rotation.x = THREE.MathUtils.lerp(entity.animNodes.legL.rotation.x, 0, delta * 8.0);
    if (entity.animNodes?.legR) entity.animNodes.legR.rotation.x = THREE.MathUtils.lerp(entity.animNodes.legR.rotation.x, 0, delta * 8.0);

    // Subtle conversational gesture with right hand
    if (entity.animNodes?.armR) {
      const gesture = Math.sin(performance.now() * 0.005) * 0.25;
      entity.animNodes.armR.rotation.x = THREE.MathUtils.lerp(entity.animNodes.armR.rotation.x, -0.4 + gesture, delta * 5.0);
    }
  }

  /**
   * Generates rich, authentic character interactions based on pair identities.
   */
  generateDialogueLines(a, b) {
    const idA = a.id;
    const idB = b.id;

    // Helper to test pair match regardless of order
    const isPair = (x, y) => (idA === x && idB === y) || (idA === y && idB === x);

    // 1. Hero Aiden & Princess Aurelia
    if (isPair('hero', 'princess')) {
      const quotes = [
        {
          a: "Princess Aurelia! The outer bridges are secure. Are the castle gardens calm today?",
          b: "Peaceful as dawn, Aiden. Please take care when venturing near the shadow borders."
        },
        {
          a: "My blade is ready should the demon legions march, Your Highness.",
          b: "Your courage honors Valoria, hero. Father and I place our trust in you."
        },
        {
          a: "The celestial stars look unusually bright tonight over Sylvaheim.",
          b: "A sign that ancient starlight still watches over our mortal kingdom."
        }
      ];
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      return idA === 'hero' ? { lineA: q.a, lineB: q.b } : { lineA: q.b, lineB: q.a };
    }

    // 2. Hero Aiden & Master Vance
    if (isPair('hero', 'retired_hero')) {
      const quotes = [
        {
          a: "Master Vance! How fares the mountain air at your lodge?",
          b: "Crisp as forged steel, lad! Mind your footing on the wet cobblestones!"
        },
        {
          a: "I have been practicing the triple crescent slash you taught me.",
          b: "Keep your wrists steady and hips balanced! The blade follows the heart, Aiden."
        },
        {
          a: "Do you ever miss the battlefield, Master Vance?",
          b: "Hah! A good hearth and quiet pipe beat demon claws any winter's eve, boy!"
        }
      ];
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      return idA === 'hero' ? { lineA: q.a, lineB: q.b } : { lineA: q.b, lineB: q.a };
    }

    // 3. King Reginald & Hero Aiden
    if (isPair('king', 'hero')) {
      const quotes = [
        {
          a: "Your Majesty. Valoria's trade caravans report clear roads across the realm.",
          b: "Well done, Aiden. A kingdom flourishes only when its gates are guarded by valor."
        },
        {
          a: "I stand ever vigilant for your crown, King Reginald.",
          b: "May the ancestors grant strength to your Dawnblade, our champion."
        }
      ];
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      return idA === 'hero' ? { lineA: q.a, lineB: q.b } : { lineA: q.b, lineB: q.a };
    }

    // 4. Princess Aurelia & King Reginald (Father & Daughter)
    if (isPair('princess', 'king')) {
      const quotes = [
        {
          a: "Father, the harvest reports from Oakhaven farmlands look bountiful this season.",
          b: "Splendid news, my daughter. Our people will feast well before the winter frosts."
        },
        {
          a: "Have the Elven emissaries sent word from the Moon Spire, Father?",
          b: "Their archers remain aloof, but the sacred treaty holds steady."
        }
      ];
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      return idA === 'princess' ? { lineA: q.a, lineB: q.b } : { lineA: q.b, lineB: q.a };
    }

    // 5. King Reginald & Master Vance (Old War Veterans)
    if (isPair('king', 'retired_hero')) {
      const quotes = [
        {
          a: "Vance, old friend! The Great War feels like yesterday when I see your broadsword.",
          b: "Your beard is greyer than mine now, Reginald! Yet your kingdom stands proud."
        },
        {
          a: "Sit by the royal hearth tonight, Vance. We have vintage mead to share.",
          b: "Only if you spare me the courtly etiquette, Your Majesty!"
        }
      ];
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      return idA === 'king' ? { lineA: q.a, lineB: q.b } : { lineA: q.b, lineB: q.a };
    }

    // 6. Demon King Malakor & Anyone Mortal
    if (idA === 'demonking' || idB === 'demonking') {
      const demon = idA === 'demonking' ? a : b;
      const mortal = idA === 'demonking' ? b : a;
      return idA === 'demonking'
        ? {
            lineA: `Mortal insect... you dare cross the path of Malakor?!`,
            lineB: `Your nether darkness has no power here in Valoria's light!`
          }
        : {
            lineA: `Halt, demon lord! Step back into your volcanic wastes!`,
            lineB: `Puny mortal... your kingdoms crumble in fewer than a hundred winters!`
          };
    }

    // 7. OP Character Kage & Anyone
    if (idA === 'op_side' || idB === 'op_side') {
      const other = idA === 'op_side' ? b : a;
      return idA === 'op_side'
        ? {
            lineA: `Hmph. You walk with heavy steps, ${other.name}. Watch the rooftops.`,
            lineB: `Kage... always lurking in the market shadows.`
          }
        : {
            lineA: `Kage! What shadows do you hunt in the bazaar today?`,
            lineB: `Just observing the balance of the realm. Move along.`
          };
    }

    // 8. General Ambient Citizen Greeting
    return {
      lineA: `Greetings, ${b.name}! May good fortune bless your path today.`,
      lineB: `And yours, ${a.name}! The realm is peaceful under the open sky.`
    };
  }
}

