# Claude Code Guide for Agent66

Agent66 is a stylized low-poly open world medieval kingdom RPG built with Three.js and Vite.

## Commands
- Dev Server: `npm run dev -- --host`
- Production Build: `npm run build`
- Preview: `npm run preview`

## Invariant Rules
- Setting is strictly Old Era Medieval Kingdom (Castles, timber houses, thatched roofs, blacksmith forge, tavern, warhorse steed, armored knight patrols, ox carts). No modern buildings or cars.
- Collisions must be airtight. Every structure registers bounding box or cylinder colliders in `this.colliders`. Sub-stepping is implemented in `src/utils/collision.js`.
- 6 Playable & NPC Characters: Hero Aiden, Princess Aurelia, Demon King Malakor, Kage, King Reginald, Master Vance.
- Refer to `AGENTS.md` and `docs/` for deep dive details on architecture, coordinate system, and prioritized roadmap.

