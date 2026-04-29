
const INTENT_KEYS = [
    "cozy",
    "challenge",
    "exploration",
    "social",
    "narrative",
    "intensity",
];

const SCORING_RULES = [
    [
        { cozy: 2, narrative: 1 },
        { challenge: 2, intensity: 1 },
        { exploration: 2, narrative: 1 },
        { social: 2, intensity: 1 },
    ],
    [
        { cozy: 1, narrative: 2 },
        { challenge: 2, intensity: 1 },
        { exploration: 1, narrative: 2 },
        {},
    ],
    [
        { exploration: 2, cozy: 1 },
        { narrative: 2, intensity: 1 },
        { exploration: 2, intensity: 1 },
        { narrative: 2, exploration: 1 },
    ],
    [
        { intensity: 2, challenge: 1 },
        { narrative: 1, challenge: 1 },
        { exploration: 2, narrative: 1 },
        {},
    ],
    [
        { cozy: 2, narrative: 1 },
        { challenge: 2, intensity: 1 },
        { exploration: 2, narrative: 1 },
        { social: 2, narrative: 1 },
    ],
    [
        { cozy: 2, narrative: 1 },
        { intensity: 2, challenge: 1 },
        { narrative: 2, exploration: 1 },
        { social: 2, intensity: 1 },
    ],
];

function createEmptyScores() {
    const scores = {};

    for (const key of INTENT_KEYS) {
        scores[key] = 0;
    }

    return scores;
}

function normalizeScores(rawScores) {
    let total = 0;

    for (const key of INTENT_KEYS) {
        total += rawScores[key];
    }

    if (total === 0) {
        return createEmptyScores();
    }

    const scores = {};

    for (const key of INTENT_KEYS) {
        scores[key] = Number((rawScores[key] / total).toFixed(4));
    }

    return scores;
}

function getTopIntent(normalizedScores) {
    const best = { intent: null, score: 0 };

    for (const key of INTENT_KEYS) {
        if (normalizedScores[key] > best.score) {
            best.intent = key;
            best.score = normalizedScores[key];
        }
    }

    return best;
}

export default function quizScoring(answers = [], rules = SCORING_RULES) {
    const rawScores = createEmptyScores();

    answers.forEach((answerIndex, questionIndex) => {
        const questionRules = rules[questionIndex];
        if (!Array.isArray(questionRules)) return;

        const answerWeights = questionRules[answerIndex];
        if (!answerWeights || typeof answerWeights !== "object") return;

        Object.entries(answerWeights).forEach(([intent, points]) => {
            if (!INTENT_KEYS.includes(intent)) return;
            if (typeof points !== "number") return;
            rawScores[intent] += points;
        });
    });

    const normalizedScores = normalizeScores(rawScores);
    const topIntent = getTopIntent(normalizedScores);

    return {
        rawScores,
        normalizedScores,
        topIntent,
        answerCount: answers.length,
    };
}

export { INTENT_KEYS, SCORING_RULES };
    