export { questions, vibes };

const questions = [
  {
    q: "It's a Friday night and you've got 2 hours free. What sounds right?",
    opts: [
      { icon: "🌙", label: "Something chill I can zone out to" },
      { icon: "⚔️", label: "A challenge — I want to feel the rush" },
      { icon: "🗺️", label: "Getting lost in a huge world" },
      { icon: "👥", label: "Playing with friends, doesn't matter what" },
    ],
  },
  {
    q: "When a game gets hard, you usually...",
    opts: [
      { icon: "📖", label: "Look up a guide — I play for the story" },
      { icon: "🔁", label: "Retry until I figure it out" },
      { icon: "🎛️", label: "Drop the difficulty and keep going" },
      { icon: "🚪", label: "Shelve it and find something else" },
    ],
  },
  {
    q: "What kind of game world feels most alive to you?",
    opts: [
      { icon: "🌿", label: "Open fields, forests, slow exploration" },
      { icon: "🏙️", label: "Gritty cities with dense stories" },
      { icon: "🚀", label: "Sci-fi or surreal — the stranger the better" },
      { icon: "🏰", label: "Classic fantasy with lore to uncover" },
    ],
  },
  {
    q: "How long do your gaming sessions usually run?",
    opts: [
      { icon: "⚡", label: "Quick — under 30 mins" },
      { icon: "🕐", label: "Medium — 1 to 2 hours" },
      { icon: "🌙", label: "Long — 3+ hours when I can" },
      { icon: "🎲", label: "Totally random, depends on the day" },
    ],
  },
  {
    q: "Which feeling do you chase most in games?",
    opts: [
      { icon: "😌", label: "Peace and calm — I want to unwind" },
      { icon: "🏆", label: "Victory — beating something hard" },
      { icon: "😲", label: "Wonder — discovering something unexpected" },
      { icon: "🤝", label: "Connection — shared moments with others" },
    ],
  },
  {
    q: "Pick the game vibe that fits you right now:",
    opts: [
      { icon: "🎋", label: "Cozy and low-stakes" },
      { icon: "🔥", label: "Intense and competitive" },
      { icon: "🌊", label: "Deep and narrative-driven" },
      { icon: "🎉", label: "Fun and chaotic with others" },
    ],
  },
];

const vibes = {
  "0000": {
    name: "Chill Explorer",
    desc: "You play to escape and breathe. Slow worlds, soft music, no rush — you game on your own terms.",
    traits: ["Cozy", "Low-pressure", "Story-first", "Solo or co-op"],
  },
  "1111": {
    name: "Apex Hunter",
    desc: "You live for the grind. The harder the challenge, the more satisfying the win. Rankings, speedruns, bragging rights.",
    traits: ["Competitive", "Skill-driven", "High-intensity", "Persistent"],
  },
  "2222": {
    name: "World Wanderer",
    desc: "You fall into games like books. The world, the lore, the hidden corners — you'll find them all.",
    traits: ["Exploratory", "Lore-loving", "Patient", "Immersive"],
  },
  "3333": {
    name: "Chill Socializer",
    desc: "Games are better with people. You're there to share stories, tactics, laughs, and all the memories made together.",
    traits: ["Social", "Party-friendly", "Flexible", "Fun-first"],
  },
  default0: {
    name: "Chill Loner",
    desc: "You keep it low-key and you know what you want — peace.",
    traits: ["Relaxed", "Story-curious", "Solo-friendly"],
  },
  default1: {
    name: "Focused Duelist",
    desc: "You're here to get good. Improvement is the game inside the game.",
    traits: ["Competitive", "Methodical", "High-focus"],
  },
  default2: {
    name: "Deep Diver",
    desc: "You need a world you can sink into. You're a bit of a lore wh*re and surface-level games just won't cut it.",
    traits: ["Narrative", "Exploratory", "Patient"],
  },
  default3: {
    name: "Party Animal",
    desc: "Life's too short for solo play. You want chaos, laughter, and good company while you rack up those kills.",
    traits: ["Social", "Multiplayer", "Energetic"],
  },
};