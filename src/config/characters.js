export const CHARACTERS = [
  {
    id: 'hero',
    name: 'Aiden',
    title: 'The Chosen Hero',
    badge: '⚔️ HERO',
    race: 'human',
    age: 21,
    lifespan: '75 – 100 Years',
    color: '#3b82f6',
    accentColor: '#60a5fa',
    spawn: { x: 0, z: 12 }, // Central Crossroads Sanctuary Bridge
    desc: 'Bearer of the Dawnblade, standing at the crossroads of Humans, Elves, Dwarves, and Demons.',
    dialogues: [
      "Four realms divided by ancient grudges: elven snobbery, dwarven machine-obsession, demon hatred, and human ambition.",
      "Humans may not have elven starlight or dwarven steam technology, but our adaptability and grit keep this kingdom alive!",
      "Master Vance taught me: Demons hate everyone, but if the other three races stop bickering, Malakor will fall.",
      "Stand with me! We'll show the elves, dwarves, and demons what human courage can achieve!"
    ]
  },
  {
    id: 'princess',
    name: 'Princess Aurelia',
    title: 'Crown Princess of the Realm',
    badge: '👑 PRINCESS',
    race: 'human',
    age: 19,
    lifespan: '75 – 100 Years',
    color: '#ec4899',
    accentColor: '#f472b6',
    spawn: { x: 470, z: -365 }, // Royal Sun Pavilion & Manor in East Royal Gardens
    desc: 'Daughter of High King Reginald, blessed with celestial elven healing magic and royal poise.',
    dialogues: [
      "Welcome to our royal pavilion. The elven tutors of Sylvaheim instilled in me true celestial nobility and grace.",
      "Dwarves scoff at our royal diplomacy and care only for their grease and cogwheels. How utterly unrefined.",
      "The demons despise all creation... their molten wrath respects neither elven nobility nor human treaties.",
      "A true monarch balances elven celestial dignity with the practical resilience of our human subjects."
    ]
  },
  {
    id: 'demonking',
    name: 'Malakor',
    title: 'The Shadow Monarch',
    badge: '🔥 DEMON KING',
    race: 'demon',
    age: 3400,
    lifespan: 'Ageless / Eternal (10,000+ Years)',
    color: '#ef4444',
    accentColor: '#b91c1c',
    spawn: { x: -220, z: -220 }, // Obsidian Dread Fortress Throne!
    desc: 'Dread lord crowned in obsidian horns and netherflame, ruling the volcanic dark territory.',
    dialogues: [
      "I despise you all! Elves prancing in white robes, dwarves drooling over clanking gears, humans cowering in stone pens!",
      "Do not speak to me of peace or pacts! Demons need no allies. The abyss devours all mortal weakness!",
      "The elves think their 'nobility' shields them. The dwarves think their 'technology' saves them. Both burn just as easily!",
      "Tremble, surface dwellers! When my netherflames cross the river, every arrogant kingdom will turn to black slag!"
    ]
  },
  {
    id: 'op_side',
    name: 'Kage',
    title: 'The Unmatched Shadow',
    badge: '⚡ OP SIDE CHARACTER',
    race: 'human',
    age: 24,
    lifespan: '75 – 100 Years',
    color: '#8b5cf6',
    accentColor: '#a78bfa',
    spawn: { x: 205, z: -110 }, // Kingdom Town Square / Bazaar
    desc: 'An aloof, ridiculously overpowered wandering swordsman who cuts mountains for fun.',
    dialogues: [
      "Elves think they're too noble to walk on mud. Dwarves worship their own iron gears. Demons hate their own shadows.",
      "And humans? Humans are obsessed with building stuff and taxing merchants. Honestly, none of them can dodge my nodachi.",
      "Malakor's demons hate everyone, but at least they're honest about it. The elf nobles smile while looking down their noses.",
      "Hmph. If all four races wipe each other out, at least the taverns might get a little quieter."
    ]
  },
  {
    id: 'king',
    name: 'King Reginald',
    title: 'High Sovereign of Valoria',
    badge: '⚜️ THE KING',
    race: 'human',
    age: 58,
    lifespan: '75 – 100 Years',
    color: '#f59e0b',
    accentColor: '#fbbf24',
    spawn: { x: 380, z: -375 }, // Inside the Grand Royal Castle Throne Room!
    desc: 'The High Sovereign ruling the human lands from his stone throne, adorned in velvet mantle.',
    dialogues: [
      "Halt! You stand before the Throne of Valoria! Humans built this citadel with blood, sweat, and sheer ingenuity!",
      "The Elves sneer at our courts as 'crude upstarts', yet when demons attack, who holds the front line? Valoria's knights!",
      "The Dwarves charge us exorbitant tariffs for their blast furnace technology, but human trade keeps their bellies full!",
      "Those demon fiends hate all breathing life. There is no negotiating with Malakor—only human resolve will prevail!"
    ]
  },
  {
    id: 'retired_hero',
    name: 'Master Vance',
    title: 'The Retired Hero',
    badge: '🛡️ RETIRED HERO',
    race: 'human',
    age: 72,
    lifespan: '75 – 100 Years',
    color: '#10b981',
    accentColor: '#34d399',
    spawn: { x: 130, z: 254 }, // Elder Lodge in the foothills
    desc: 'The legendary war hero who united Humans, Elves, and Dwarves 50 years ago to seal the Demon King.',
    dialogues: [
      "*Puffs old pipe* Fifty winters ago, I tried putting an elf high noble, a dwarf engineer, and a human general at one table.",
      "Spent four hours arguing! The elf complained about soot, the dwarf bragged about gear-ratios, and the human argued taxes!",
      "Meanwhile, Malakor's legions were marching! Demons don't care about our politics—they hate every last one of us.",
      "Young Aiden has to remember: each race is stubborn in their own way, but let the demons divide us and we all perish."
    ]
  }
];

export function getCharacterById(id) {
  return CHARACTERS.find(c => c.id === id) || CHARACTERS[0];
}
