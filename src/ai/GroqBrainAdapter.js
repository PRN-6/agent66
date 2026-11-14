/**
 * CognitiveBrainAdapter — Multi-Backend Cognitive Brain for RPG Autonomous Minds.
 * Supports:
 *  1. ⚡ Groq Cloud LLM (Ultra-Fast ~500+ tok/s via llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768)
 *  2. 🦙 Local Ollama (Private & Offline via qwen2.5:7b-instruct, qwen2.5-coder:7b, llama3.1:8b)
 *  3. 🧠 High-Fidelity Procedural Cognitive Core (Zero latency heuristic fallback when offline)
 */

export class CognitiveBrainAdapter {
  constructor() {
    this.storageBackendKey = 'agent66_llm_backend';
    this.storageGroqKey = 'agent66_groq_api_key';
    this.storageGroqModel = 'agent66_groq_model';
    this.storageOllamaEndpoint = 'agent66_ollama_endpoint';
    this.storageOllamaModel = 'agent66_ollama_model';

    this.defaultGroqModel = 'llama-3.3-70b-versatile';
    this.defaultOllamaEndpoint = 'http://localhost:11434';
    this.defaultOllamaModel = 'qwen2.5:7b-instruct';

    this.availableGroqModels = [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Recommended - Deep & Nuanced)', speed: 'Fast' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Ultra-Fast ~600 tok/s)', speed: 'Ultra Fast' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Long Context & Creative)', speed: 'Fast' }
    ];

    this.recommendedOllamaModels = [
      { id: 'qwen2.5:7b-instruct', name: 'Qwen 2.5 7B Instruct (Recommended for Roleplay & Decisions)' },
      { id: 'qwen2.5-coder:7b', name: 'Qwen 2.5 Coder 7B (Currently Installed)' },
      { id: 'llama3.1:8b', name: 'Llama 3.1 8B (Meta Open Intelligence)' },
      { id: 'mistral:7b', name: 'Mistral 7B Instruct' }
    ];
  }

  // Backend Selector ('groq' | 'ollama')
  getBackend() {
    return localStorage.getItem(this.storageBackendKey) || 'groq';
  }

  setBackend(backend) {
    localStorage.setItem(this.storageBackendKey, backend);
  }

  // Groq Settings
  getApiKey() {
    return localStorage.getItem(this.storageGroqKey) || '';
  }

  setApiKey(key) {
    if (key) {
      localStorage.setItem(this.storageGroqKey, key.trim());
    } else {
      localStorage.removeItem(this.storageGroqKey);
    }
  }

  hasApiKey() {
    return Boolean(this.getApiKey().trim());
  }

  getGroqModel() {
    return localStorage.getItem(this.storageGroqModel) || this.defaultGroqModel;
  }

  setGroqModel(modelId) {
    localStorage.setItem(this.storageGroqModel, modelId);
  }

  // Backwards compatibility getter/setter
  getModel() {
    return this.getBackend() === 'ollama' ? this.getOllamaModel() : this.getGroqModel();
  }

  setModel(modelId) {
    if (this.getBackend() === 'ollama') {
      this.setOllamaModel(modelId);
    } else {
      this.setGroqModel(modelId);
    }
  }

  // Ollama Settings
  getOllamaEndpoint() {
    return localStorage.getItem(this.storageOllamaEndpoint) || this.defaultOllamaEndpoint;
  }

  setOllamaEndpoint(endpoint) {
    localStorage.setItem(this.storageOllamaEndpoint, (endpoint || '').trim());
  }

  getOllamaModel() {
    return localStorage.getItem(this.storageOllamaModel) || this.defaultOllamaModel;
  }

  setOllamaModel(modelId) {
    localStorage.setItem(this.storageOllamaModel, (modelId || '').trim());
  }

  /**
   * Helper to resolve the best URL for fetching Ollama.
   * If accessing localhost:11434 from the browser, we try the Vite proxy '/ollama' first
   * to guarantee zero CORS issues, falling back to direct endpoint.
   */
  resolveOllamaUrl(endpoint, path) {
    const cleanEndpoint = (endpoint || this.getOllamaEndpoint()).replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // If endpoint is localhost:11434 or 127.0.0.1:11434, use the Vite dev server proxy
    if (cleanEndpoint.includes('localhost:11434') || cleanEndpoint.includes('127.0.0.1:11434')) {
      return `/ollama${cleanPath}`;
    }
    return `${cleanEndpoint}${cleanPath}`;
  }

  /**
   * Fetches the list of locally installed Ollama models.
   */
  async fetchOllamaInstalledModels(endpoint = null) {
    const urlsToTry = [
      this.resolveOllamaUrl(endpoint, '/api/tags'),
      'http://localhost:11434/api/tags'
    ];

    for (const url of urlsToTry) {
      try {
        const response = await fetch(url, { method: 'GET', signal: AbortSignal.timeout(4000) });
        if (response.ok) {
          const data = await response.json();
          const list = (data.models || []).map(m => m.name || m.model);
          if (list.length > 0) return { success: true, models: list };
        }
      } catch {
        // Continue to fallback url
      }
    }
    return { success: false, models: [], error: 'Could not contact local Ollama server.' };
  }

  /**
   * Tests the Local Ollama connection with a quick ping and returns latency.
   */
  async testOllamaConnection(endpoint, modelId) {
    const targetModel = (modelId || this.getOllamaModel()).trim();
    const startTime = performance.now();

    const urlsToTry = [
      this.resolveOllamaUrl(endpoint, '/api/chat'),
      'http://localhost:11434/api/chat'
    ];

    let lastError = null;

    for (const url of urlsToTry) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: targetModel,
            messages: [
              { role: 'system', content: 'You are an RPG character mind ping test.' },
              { role: 'user', content: 'Respond with JSON: {"status": "ok"}' }
            ],
            stream: false,
            format: 'json'
          }),
          signal: AbortSignal.timeout(12000)
        });

        const elapsed = Math.round(performance.now() - startTime);

        if (response.ok) {
          const data = await response.json();
          return {
            success: true,
            backend: 'ollama',
            model: targetModel,
            latencyMs: elapsed,
            endpoint: url,
            rawMessage: data.message?.content
          };
        } else {
          const errData = await response.json().catch(() => ({}));
          lastError = errData.error || `HTTP ${response.status} ${response.statusText}`;
        }
      } catch (err) {
        lastError = err.message || 'Connection failed';
      }
    }

    return {
      success: false,
      backend: 'ollama',
      error: `Ollama error: ${lastError}. Make sure Ollama is running ('ollama serve') and model '${targetModel}' is downloaded.`
    };
  }

  /**
   * Tests the Groq API key with a fast ping test.
   */
  async testGroqConnection(apiKey, modelId) {
    const key = (apiKey || this.getApiKey()).trim();
    if (!key) {
      return { success: false, error: 'No Groq API key provided. Please paste your key.' };
    }

    const model = modelId || this.getGroqModel();
    const startTime = performance.now();

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: 'You are a test ping for an RPG character cognitive mind.' },
            { role: 'user', content: 'Reply with JSON: {"status": "ok"}' }
          ],
          max_tokens: 20,
          response_format: { type: 'json_object' }
        })
      });

      const elapsed = Math.round(performance.now() - startTime);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = errData.error?.message || `HTTP ${response.status} ${response.statusText}`;
        return { success: false, error: msg };
      }

      const data = await response.json();
      return {
        success: true,
        backend: 'groq',
        latencyMs: elapsed,
        model: model,
        tokensPerSecond: Math.round((data.usage?.completion_tokens || 10) / (elapsed / 1000) * 10) / 10
      };
    } catch (err) {
      return { success: false, error: err.message || 'Network connection failed' };
    }
  }

  /**
   * Unified test connection based on active backend.
   */
  async testConnection(param1, param2) {
    if (this.getBackend() === 'ollama') {
      return this.testOllamaConnection(param1, param2);
    }
    return this.testGroqConnection(param1, param2);
  }

  /**
   * Builds the comprehensive RPG system prompt incorporating persona, canonical race lifespans,
   * recent memories, spatial sensory snapshot, and available game actions.
   */
  buildSystemPrompt(character, sensorySnapshot, memoriesSummary = '', divineWhisper = null) {
    const race = sensorySnapshot.raceData || {};

    return `You are the autonomous inner consciousness of a living RPG character in a medieval low-poly fantasy kingdom.
You perceive the world around you in real-time, have cultural prejudices and canonical race lifespans, and make purposeful decisions.

YOUR PERSONA:
- Name: ${character.name}
- Title / Role: ${character.badge || character.title || 'Inhabitant'}
- Race: ${character.race || 'human'}
- Age: ${character.age ? `${character.age} years old` : 'Prime adulthood'}
- Canonical Lifespan: ${race.lifespan || '75-100 years'} (${race.agingSpeed || 'Mortal baseline'})
- Homeland: ${race.homeland || 'Kingdom of Valoria'}
- Cultural Disposition: ${race.dispositionTitle || 'Resourceful'} - ${race.attitude || 'Practical and adaptable.'}
- Inter-Racial Animosity:
  * Demons: Ageless (10,000+ yrs) - Universal Hatred; despise mortals.
  * Elves: 1,500-3,000 yrs - Proud Celestial Nobility; look down on humans as brief upstarts and dwarves as troglodytes.
  * Dwarves: 350-500 yrs - Mechanical Masters; ridicule elven vanity and human flimsy woodwork.
  * Humans: 75-100 yrs - Resourceful Versatility; pack three lifetimes of trade, craft, and courage into every sunrise.

WHAT YOU PHYSICALLY PERCEIVE RIGHT NOW:
${sensorySnapshot.sensorySummary}

${memoriesSummary ? `RECENT MEMORIES & EXPERIENCES:\n${memoriesSummary}\n` : ''}
${divineWhisper ? `⚡ [DIVINE REVELATION FROM THE CREATOR OF THE WORLD]:
The Divine Creator has directly whispered these words into your soul: "${divineWhisper}".
Acknowledge this divine voice in your inner thought and respond with appropriate awe, obedience, or astonishment!` : ''}

AVAILABLE ACTIONS:
- "WALK_TO": Travel towards a landmark or area (e.g. "Crossroads Sanctuary Bridge", "High Valoria Castle Town", "Valoria Market Bazaar", "The Dragon's Rest Tavern", "Elder Lodge", "Karak-Drak Stronghold", "Sylvaheim Glade", "Obsidian Dread Citadel").
- "WORK_AT": Perform occupational craft duties (e.g. "Smithy", "Farmlands", "Alchemist Spire", "Clocktower", "Barracks", "Royal Guard").
- "TALK_TO": Engage in conversation with a nearby citizen or the Creator.
- "TRADE_WITH": Visit a merchant stall or conduct business.
- "BUILD": Contribute to settlement expansion or construct new infrastructure.
- "FIGHT": Adopt combat stance or alert allies if beasts or enemies lurk.
- "REST_AT": Relax at the tavern, hearth, or quarters.

INSTRUCTIONS:
Respond STRICTLY with a single valid JSON object with these exact keys:
{
  "observation": "What your character notices first about their surroundings right now (1-2 sentences)",
  "inner_thought": "Your deep internal thoughts/monologue reflecting your race, lifespan, and context (2-3 sentences)",
  "feeling": "Current emotional state (e.g. Vigilant, Reverent, Proud, Suspicious, Cheerful, Weary, Determined)",
  "action": "One of: WALK_TO, WORK_AT, TALK_TO, TRADE_WITH, BUILD, FIGHT, REST_AT",
  "action_target": "The specific landmark, person, or facility you are acting upon",
  "intention": "What you plan or wish to do next (1 sentence)",
  "speech": "What you say out loud to anyone nearby or mutter to yourself (1 sentence)"
}`;
  }

  /**
   * Generates a structured cognitive thought using the active LLM backend (Groq or Ollama)
   * with procedural heuristic fallback.
   */
  async generateThought(character, sensorySnapshot, divineWhisper = null, memoriesSummary = '') {
    const backend = this.getBackend();

    if (backend === 'ollama') {
      return this.generateOllamaThought(character, sensorySnapshot, divineWhisper, memoriesSummary);
    } else {
      return this.generateGroqThought(character, sensorySnapshot, divineWhisper, memoriesSummary);
    }
  }

  /**
   * Ollama Generation Handler
   */
  async generateOllamaThought(character, sensorySnapshot, divineWhisper = null, memoriesSummary = '') {
    const model = this.getOllamaModel();
    const endpoint = this.getOllamaEndpoint();
    const systemPrompt = this.buildSystemPrompt(character, sensorySnapshot, memoriesSummary, divineWhisper);
    const userPrompt = `Reflect on your surroundings at (${sensorySnapshot.coords.x}, ${sensorySnapshot.coords.z}) at ${sensorySnapshot.timeFormatted}. Decide your next thought and action.`;

    const urlsToTry = [
      this.resolveOllamaUrl(endpoint, '/api/chat'),
      'http://localhost:11434/api/chat'
    ];

    const startTime = performance.now();
    let lastError = null;

    for (const url of urlsToTry) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            stream: false,
            format: 'json',
            options: {
              temperature: 0.72,
              num_predict: 350
            }
          }),
          signal: AbortSignal.timeout(18000)
        });

        const elapsed = Math.round(performance.now() - startTime);

        if (response.ok) {
          const data = await response.json();
          const content = data.message?.content || '{}';
          const parsed = this.cleanAndParseJSON(content);

          return {
            observation: parsed.observation || `I survey the vicinity of ${sensorySnapshot.nearestLandmark}.`,
            inner_thought: parsed.inner_thought || `The winds carry word across ${sensorySnapshot.biomeName}.`,
            feeling: parsed.feeling || 'Attentive',
            action: parsed.action || 'WALK_TO',
            action_target: parsed.action_target || sensorySnapshot.nearestLandmark,
            intention: parsed.intention || 'Attend to my duties in the realm.',
            speech: parsed.speech || 'May fortune favor our steps.',
            engine: `Ollama (${model}) • ${elapsed}ms`,
            isLLM: true,
            backend: 'ollama',
            divineWhisperProcessed: Boolean(divineWhisper)
          };
        } else {
          const errData = await response.json().catch(() => ({}));
          lastError = errData.error || `HTTP ${response.status}`;
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    console.warn('Ollama call failed, falling back to heuristic:', lastError);
    return this.generateHeuristicThought(
      character,
      sensorySnapshot,
      divineWhisper,
      `Ollama offline (${lastError || 'check if ollama serve is running'}). Using Heuristic Core.`
    );
  }

  /**
   * Groq Cloud Generation Handler
   */
  async generateGroqThought(character, sensorySnapshot, divineWhisper = null, memoriesSummary = '') {
    const apiKey = this.getApiKey().trim();

    if (!apiKey) {
      return this.generateHeuristicThought(
        character,
        sensorySnapshot,
        divineWhisper,
        'No Groq API Key set (Running on High-Fidelity Heuristic Core)'
      );
    }

    const model = this.getGroqModel();
    const systemPrompt = this.buildSystemPrompt(character, sensorySnapshot, memoriesSummary, divineWhisper);
    const startTime = performance.now();

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Reflect on your current surroundings at ${sensorySnapshot.coords.x}, ${sensorySnapshot.coords.z} (${sensorySnapshot.timeFormatted}). What is on your mind?` }
          ],
          temperature: 0.72,
          max_tokens: 350,
          response_format: { type: 'json_object' }
        })
      });

      const elapsed = Math.round(performance.now() - startTime);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        console.warn('Groq API Error, falling back to heuristic:', errJson);
        return this.generateHeuristicThought(
          character,
          sensorySnapshot,
          divineWhisper,
          `Groq API Error (${response.status}): ${errJson.error?.message || response.statusText}. Using Heuristic Fallback.`
        );
      }

      const data = await response.json();
      const contentStr = data.choices?.[0]?.message?.content || '{}';
      const parsed = this.cleanAndParseJSON(contentStr);

      return {
        observation: parsed.observation || `I gaze across the grounds of ${sensorySnapshot.nearestLandmark}.`,
        inner_thought: parsed.inner_thought || `Life in ${sensorySnapshot.biomeName} demands vigilance.`,
        feeling: parsed.feeling || 'Attentive',
        action: parsed.action || 'WALK_TO',
        action_target: parsed.action_target || sensorySnapshot.nearestLandmark,
        intention: parsed.intention || 'Continue my duties in the realm.',
        speech: parsed.speech || 'May the light guide our paths.',
        engine: `Groq (${model}) • ${elapsed}ms`,
        isLLM: true,
        backend: 'groq',
        divineWhisperProcessed: Boolean(divineWhisper)
      };
    } catch (err) {
      console.warn('Network error calling Groq, using fallback:', err);
      return this.generateHeuristicThought(
        character,
        sensorySnapshot,
        divineWhisper,
        `Network offline: ${err.message}. Using Heuristic Fallback.`
      );
    }
  }

  /**
   * Extracts and parses JSON safely even if fenced in markdown blocks.
   */
  cleanAndParseJSON(rawStr) {
    if (!rawStr) return {};
    let str = rawStr.trim();

    // Remove markdown code fences if present
    if (str.startsWith('```')) {
      str = str.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
    }

    try {
      return JSON.parse(str);
    } catch {
      // Find first { and last }
      const first = str.indexOf('{');
      const last = str.lastIndexOf('}');
      if (first !== -1 && last !== -1 && last > first) {
        try {
          return JSON.parse(str.slice(first, last + 1));
        } catch {
          // ignore
        }
      }
      return {};
    }
  }

  /**
   * High-fidelity procedural cognitive heuristic when offline or before API key is provided.
   */
  generateHeuristicThought(character, sensory, divineWhisper, note = '') {
    const race = character.race || 'human';
    const isHuman = (race === 'human');
    const isElf = (race === 'elf');
    const isDwarf = (race === 'dwarf');
    const isDemon = (race === 'demon');

    let observation = '';
    let thought = '';
    let feeling = 'Contemplative';
    let action = 'WALK_TO';
    let actionTarget = sensory.nearestLandmark || 'Crossroads Bridge';
    let intention = 'Survey the surrounding territory.';
    let speech = 'All seems well in this quadrant.';

    if (divineWhisper) {
      feeling = 'Awestruck & Reverent';
      observation = `A celestial warmth radiates through the air—the Creator's presence is unmistakable.`;
      thought = `A divine voice echoes directly inside my soul saying: "${divineWhisper}"! The Lord of the Realm watches over my humble steps. I shall heed this heavenly counsel.`;
      action = 'WALK_TO';
      actionTarget = 'Crossroads Sanctuary Bridge';
      intention = `Follow the divine guidance of the Creator.`;
      speech = `By the heavens... did you hear that divine resonance?`;
    } else if (sensory.nearbyMonsters.length > 0) {
      const beast = sensory.nearbyMonsters[0];
      feeling = 'Vigilant & On Guard';
      observation = `I spot a wild ${beast.name} prowling roughly ${beast.dist}m away outside the perimeter.`;
      thought = isDemon
        ? `A ${beast.name}... good. If it dares cross my path, its soul will feed the obsidian flames.`
        : `A prowling ${beast.name} is too close for comfort. Thank the kings our town sanctuary wards repel such beasts from breaching the gates.`;
      action = 'FIGHT';
      actionTarget = beast.name;
      intention = `Keep weapon drawn and alert the nearby garrison.`;
      speech = `Keep a sharp eye on the tree line—predators are prowling!`;
    } else if (sensory.isCreatorNearby) {
      feeling = 'Honored & Inspired';
      observation = `The Divine Creator walks amongst us, just ${sensory.playerDist}m away!`;
      thought = `To stand in the presence of the world's architect... our brief mortal endeavors are but dust, yet we build castles worthy of divine grace.`;
      action = 'TALK_TO';
      actionTarget = 'The Creator';
      intention = `Stand proud and perform my duties flawlessly before the Creator.`;
      speech = `Greetings, noble Creator of the world!`;
    } else if (sensory.nearestLandmark.includes('High Valoria') || sensory.nearestLandmark.includes('Castle')) {
      feeling = 'Proud & Prosperous';
      observation = `The twin barbicans and lion fountain of High Valoria gleam under the ${sensory.solarPhase}.`;
      thought = isElf
        ? `These humans build in stone with surprising speed for a race that fades in eighty winters. Still, their town lacks the quiet starlight nobility of Sylvaheim.`
        : isDwarf
        ? `Fine masonry on the clocktower, though my clan could forge clock gears that turn five centuries without a drop of grease!`
        : `High Valoria stands magnificent today. Market stalls are bustling, the bakery smells of fresh bread, and the castle walls hold strong against the dark.`;
      action = 'WORK_AT';
      actionTarget = 'High Valoria Bazaar';
      intention = `Stroll toward the artisan market and check the morning ledgers.`;
      speech = `A glorious day in the Capital Borough!`;
    } else {
      feeling = isDemon ? 'Brooding' : (isElf ? 'Serene' : 'Resolute');
      observation = `The winds blow across ${sensory.nearestLandmark}. ${sensory.timeFormatted} marks a quiet hour.`;
      thought = isDemon
        ? `Ten thousand years in the nether void have taught me patience. Mortals flutter like moths before the pyre.`
        : isElf
        ? `Centuries pass like ripples across the starlight mana pool. Our sacred boughs shall outlive all mortal kingdoms.`
        : isDwarf
        ? `Four hundred years of stone and steam. As long as our blast furnaces burn, the clans stand united!`
        : `A hundred years is short, but we humans pack three lifetimes of trade, craft, and courage into every sunrise.`;
      action = 'WALK_TO';
      actionTarget = sensory.nearestLandmark;
      intention = `Continue my patrol and inspect the boundary markers.`;
      speech = `The realm endures another day.`;
    }

    return {
      observation,
      inner_thought: thought,
      feeling,
      action,
      action_target: actionTarget,
      intention,
      speech,
      engine: 'Procedural Cognitive Core (Instant)',
      isLLM: false,
      backend: 'heuristic',
      note,
      divineWhisperProcessed: Boolean(divineWhisper)
    };
  }
}

// Backwards-compatible export alias
export const GroqBrainAdapter = CognitiveBrainAdapter;
