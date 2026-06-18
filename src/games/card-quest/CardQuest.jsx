import { useState, useEffect, useCallback, useRef } from "react";

const CARD_SUITS = ["♠", "♥", "♦", "♣"];
const CARD_VALUES = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
const RED_SUITS = ["♥", "♦"];
function buildDeck() {
  return CARD_VALUES.flatMap((v) =>
    CARD_SUITS.map((s) => ({ value: v, suit: s })),
  );
}
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}
function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}
function factorial(n) {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}
function C(n, r) {
  if (r > n || r < 0) return 0;
  return factorial(n) / (factorial(r) * factorial(n - r));
}
function P(n, r) {
  if (r > n || r < 0) return 0;
  return factorial(n) / factorial(n - r);
}

const SUM_COUNTS = {
  2: 1,
  3: 2,
  4: 3,
  5: 4,
  6: 5,
  7: 6,
  8: 5,
  9: 4,
  10: 3,
  11: 2,
  12: 1,
};

const DICE_DOTS = {
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
  ],
  5: [
    [0, 0],
    [0, 2],
    [1, 1],
    [2, 0],
    [2, 2],
  ],
  6: [
    [0, 0],
    [0, 2],
    [1, 0],
    [1, 2],
    [2, 0],
    [2, 2],
  ],
};

function DiceFace({ value, size = 52, highlight = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 3 3"
      style={{
        background: highlight ? "#1e1b4b" : "#f8fafc",
        borderRadius: size * 0.15,
        border: highlight ? "2px solid #818cf8" : "1.5px solid #cbd5e1",
        display: "block",
        flexShrink: 0,
        transition: "all 0.2s",
      }}
    >
      {(DICE_DOTS[value] || []).map(([r, c], i) => (
        <circle
          key={i}
          cx={c + 0.5}
          cy={r + 0.5}
          r={0.26}
          fill={highlight ? "#a5b4fc" : "#1e293b"}
        />
      ))}
    </svg>
  );
}

function PlayingCard({ value, suit, selected, onClick, small = false }) {
  const red = RED_SUITS.includes(suit);
  const w = small ? 38 : 54,
    h = small ? 54 : 76;
  return (
    <div
      onClick={onClick}
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        border: selected ? "2.5px solid #818cf8" : "1.5px solid #cbd5e1",
        background: selected ? "#eef2ff" : "#fff",
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "3px 4px",
        boxSizing: "border-box",
        userSelect: "none",
        transform: selected ? "translateY(-8px) scale(1.05)" : "none",
        transition: "all 0.15s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          fontSize: small ? 9 : 11,
          fontWeight: 700,
          color: red ? "#dc2626" : "#1e293b",
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontSize: small ? 11 : 16,
          textAlign: "center",
          color: red ? "#dc2626" : "#1e293b",
          lineHeight: 1,
        }}
      >
        {suit}
      </span>
      <span
        style={{
          fontSize: small ? 9 : 11,
          fontWeight: 700,
          color: red ? "#dc2626" : "#1e293b",
          lineHeight: 1,
          alignSelf: "flex-end",
          transform: "rotate(180deg)",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function ProfessorModal({ interrupt, onDismiss }) {
  if (!interrupt) return null;
  const { correct, prediction, dice, profText, mathBreakdown, formula } =
    interrupt;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#0f172a",
          border: `2px solid ${correct ? "#4ade80" : "#f59e0b"}`,
          borderRadius: 16,
          maxWidth: 460,
          width: "100%",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            marginBottom: 14,
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: correct ? "#052e16" : "#1c1002",
              border: `2px solid ${correct ? "#4ade80" : "#f59e0b"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              flexShrink: 0,
            }}
          >
            {correct ? "🎓" : "🤔"}
          </div>
          <div>
            <p
              style={{
                margin: "0 0 2px",
                color: correct ? "#4ade80" : "#f59e0b",
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              Professor Nova — {correct ? "Well done!" : "Let me explain..."}
            </p>
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 12 }}>
              Prediction:{" "}
              <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
                {prediction.label}
              </span>
              {dice &&
                dice.length === 2 &&
                typeof dice[0] === "number" &&
                dice[0] <= 6 && (
                  <span>
                    {" "}
                    | Rolled:{" "}
                    <span style={{ color: "#e2e8f0", fontWeight: 600 }}>
                      {dice[0]}+{dice[1]}={dice[0] + dice[1]}
                    </span>
                  </span>
                )}
            </p>
          </div>
        </div>

        {dice &&
          dice.length === 2 &&
          typeof dice[0] === "number" &&
          dice[0] <= 6 && (
            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 14,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DiceFace value={dice[0]} size={44} highlight={!correct} />
              <span style={{ color: "#64748b", fontSize: 20 }}>+</span>
              <DiceFace value={dice[1]} size={44} highlight={!correct} />
              <span style={{ color: "#64748b", fontSize: 18 }}>=</span>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  background: correct ? "#052e16" : "#1c1002",
                  border: `1.5px solid ${correct ? "#4ade80" : "#f59e0b"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 700,
                  color: correct ? "#4ade80" : "#f59e0b",
                }}
              >
                {dice[0] + dice[1]}
              </div>
            </div>
          )}

        <div
          style={{
            background: "#1e293b",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 10,
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#e2e8f0",
              fontSize: 13,
              lineHeight: 1.65,
            }}
          >
            {profText}
          </p>
          {mathBreakdown && (
            <div
              style={{
                borderTop: "1px solid #334155",
                paddingTop: 8,
                marginTop: 6,
              }}
            >
              {mathBreakdown.map((line, i) => (
                <p
                  key={i}
                  style={{
                    margin: "3px 0",
                    fontSize: 12,
                    color: "#a5b4fc",
                    fontFamily: "'Courier New',monospace",
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          )}
        </div>
        {formula && (
          <div
            style={{
              background: "#1e1b4b",
              borderRadius: 8,
              padding: "9px 12px",
              marginBottom: 14,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 11,
                color: "#c7d2fe",
                fontFamily: "'Courier New',monospace",
              }}
            >
              {formula}
            </p>
          </div>
        )}

        <button
          onClick={onDismiss}
          style={{
            width: "100%",
            background: correct ? "#166534" : "#92400e",
            color: correct ? "#4ade80" : "#fbbf24",
            border: "none",
            borderRadius: 10,
            padding: "11px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {correct ? "Got it, keep going! →" : "Understood, try again →"}
        </button>
      </div>
    </div>
  );
}

const DICE_PREDICTIONS = [
  {
    id: "sum2",
    label: "Sum = 2",
    shortLabel: "=2",
    check: (a, b) => a + b === 2,
    prob: "1/36",
    probNum: 1 / 36,
    profCorrect:
      "Snake eyes! The only way to roll a 2 is (1,1). You spotted the rarest sum correctly.",
    profWrong:
      "Sum of 2 requires BOTH dice to show 1. Only 1 way out of 36 possible outcomes — P = 1/36 ≈ 2.8%. Very rare!",
    breakdown: [
      "Ways to get sum 2: only (1,1) → 1 way",
      "Total outcomes: 6×6 = 36",
      "P(sum=2) = 1/36 ≈ 2.78%",
    ],
    formula: "P(sum=2) = 1/36 ≈ 2.8%  [rarest sum]",
  },
  {
    id: "sum7",
    label: "Sum = 7",
    shortLabel: "=7",
    check: (a, b) => a + b === 7,
    prob: "6/36 = 1/6",
    probNum: 6 / 36,
    profCorrect:
      "7 is the most probable sum! Six pairs reach it: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1). You're thinking statistically!",
    profWrong:
      "Sum 7 is the MOST likely total — but probability still means it won't always hit. Six combinations give 7: P = 6/36 = 1/6 ≈ 16.7%.",
    breakdown: [
      "(1,6),(2,5),(3,4),(4,3),(5,2),(6,1) → 6 ways",
      "Total: 36 outcomes",
      "P(sum=7) = 6/36 = 1/6 ≈ 16.7%",
    ],
    formula: "P(sum=7) = 6/36 = 1/6 ≈ 16.7%  [MOST likely sum]",
  },
  {
    id: "sum12",
    label: "Sum = 12",
    shortLabel: "=12",
    check: (a, b) => a + b === 12,
    prob: "1/36",
    probNum: 1 / 36,
    profCorrect:
      "Boxcars! Like sum=2, rolling 12 requires (6,6) — one way out of 36. Equally rare as snake eyes.",
    profWrong:
      "Sum 12 needs both dice to show 6: only (6,6) works. P = 1/36 ≈ 2.8% — symmetric with sum=2 around the center (7).",
    breakdown: [
      "Ways to get sum 12: only (6,6) → 1 way",
      "Total: 36",
      "P(sum=12) = 1/36 ≈ 2.78%",
    ],
    formula: "P(sum=12) = 1/36 ≈ 2.8%  [equally rare as sum=2]",
  },
  {
    id: "doubles",
    label: "Doubles",
    shortLabel: "Dbl",
    check: (a, b) => a === b,
    prob: "6/36 = 1/6",
    probNum: 6 / 36,
    profCorrect:
      "Doubles! There are exactly 6 doubles: (1,1),(2,2),(3,3),(4,4),(5,5),(6,6). Same probability as rolling a 7!",
    profWrong:
      "Doubles = (1,1),(2,2),(3,3),(4,4),(5,5),(6,6) → 6 out of 36. P(doubles) = 1/6, same as P(sum=7). A beautiful coincidence!",
    breakdown: [
      "Doubles: (1,1),(2,2),(3,3),(4,4),(5,5),(6,6)",
      "6 outcomes out of 36",
      "P(doubles) = 6/36 = 1/6 — same as P(sum=7)!",
    ],
    formula: "P(doubles) = 6/36 = 1/6 ≈ 16.7%",
  },
  {
    id: "sumGt8",
    label: "Sum > 8",
    shortLabel: ">8",
    check: (a, b) => a + b > 8,
    prob: "10/36",
    probNum: 10 / 36,
    profCorrect:
      "Sum > 8 means sums 9,10,11,12: 4+3+2+1 = 10 ways out of 36. Just under 28%!",
    profWrong:
      "Sums 9,10,11,12 each contribute: 4+3+2+1 = 10 ways. P = 10/36 ≈ 27.8% — a bit less than 1/3.",
    breakdown: [
      "Sum 9: (3,6),(4,5),(5,4),(6,3) → 4",
      "Sum 10: (4,6),(5,5),(6,4) → 3",
      "Sum 11: (5,6),(6,5) → 2",
      "Sum 12: (6,6) → 1",
      "Total: 4+3+2+1 = 10 out of 36",
    ],
    formula: "P(sum>8) = 10/36 ≈ 27.8%",
  },
  {
    id: "sumLt6",
    label: "Sum < 6",
    shortLabel: "<6",
    check: (a, b) => a + b < 6,
    prob: "10/36",
    probNum: 10 / 36,
    profCorrect:
      "By symmetry, P(sum<6) = P(sum>8) = 10/36! The distribution is perfectly symmetric around 7.",
    profWrong:
      "Sums 2,3,4,5: 1+2+3+4 = 10 ways. Also 10/36 — exactly symmetric with sum>8, because 7 is the center of the distribution!",
    breakdown: [
      "Sum 2:1, Sum 3:2, Sum 4:3, Sum 5:4",
      "1+2+3+4 = 10 out of 36",
      "Symmetric with P(sum>8) — centered on 7!",
    ],
    formula: "P(sum<6) = 10/36 ≈ 27.8%  [symmetric with sum>8]",
  },
  {
    id: "even",
    label: "Sum Even",
    shortLabel: "Even",
    check: (a, b) => (a + b) % 2 === 0,
    prob: "18/36 = 1/2",
    probNum: 0.5,
    profCorrect:
      "Even sums come from both-odd or both-even dice: 3×3 + 3×3 = 18 out of 36 = exactly 50%!",
    profWrong:
      "Even sum = both dice same parity. Both even: 3×3=9. Both odd: 3×3=9. Total: 18/36 = 50% — exactly half of all rolls!",
    breakdown: [
      "Both even {2,4,6}×{2,4,6} = 9 outcomes",
      "Both odd {1,3,5}×{1,3,5} = 9 outcomes",
      "Total: 9+9 = 18/36 = 50%",
    ],
    formula: "P(even sum) = 18/36 = 1/2 = 50%",
  },
  {
    id: "odd",
    label: "Sum Odd",
    shortLabel: "Odd",
    check: (a, b) => (a + b) % 2 === 1,
    prob: "18/36 = 1/2",
    probNum: 0.5,
    profCorrect:
      "Odd sum needs one even, one odd die: 3×3 + 3×3 = 18/36 = 50%. Even and odd sums are equally likely!",
    profWrong:
      "Odd sum = one even + one odd. Odd×Even: 9 outcomes. Even×Odd: 9 outcomes. 18/36 = 50%. Identical probability to even sums!",
    breakdown: [
      "Odd die × Even die = 3×3 = 9",
      "Even die × Odd die = 3×3 = 9",
      "Total: 18/36 = 50%",
    ],
    formula: "P(odd sum) = 18/36 = 1/2 = 50%",
  },
  {
    id: "at_least_one_6",
    label: "≥ One 6",
    shortLabel: "≥1 six",
    check: (a, b) => a === 6 || b === 6,
    prob: "11/36",
    probNum: 11 / 36,
    profCorrect:
      "Nice use of the complement rule! P(≥1 six) = 1 - P(no 6s) = 1 - (5/6)² = 1 - 25/36 = 11/36 ≈ 30.6%.",
    profWrong:
      "Use the complement: P(≥1 six) = 1 - P(no 6 on either die) = 1 - (5/6)(5/6) = 1 - 25/36 = 11/36 ≈ 30.6%.",
    breakdown: [
      "P(no 6 on one die) = 5/6",
      "P(no 6 on either) = (5/6)² = 25/36",
      "P(at least one 6) = 1 - 25/36 = 11/36",
    ],
    formula: "P(≥1 six) = 1-(5/6)² = 11/36 ≈ 30.6%  [complement rule]",
  },
  {
    id: "prime",
    label: "Sum Prime",
    shortLabel: "Prime",
    check: (a, b) => [2, 3, 5, 7, 11].includes(a + b),
    prob: "15/36",
    probNum: 15 / 36,
    profCorrect:
      "Prime sums (2,3,5,7,11) — count the ways: 1+2+4+6+2 = 15. P = 15/36 ≈ 41.7%. Primes are surprisingly common!",
    profWrong:
      "Prime sums: 2(1 way),3(2),5(4),7(6),11(2) — total 15 ways. P = 15/36 ≈ 41.7%. More than a third of all rolls!",
    breakdown: [
      "Sum 2 (prime):1, Sum 3 (prime):2",
      "Sum 5 (prime):4, Sum 7 (prime):6",
      "Sum 11 (prime):2",
      "Total: 1+2+4+6+2 = 15 out of 36",
    ],
    formula: "P(prime sum) = 15/36 ≈ 41.7%",
  },
  {
    id: "sum_gte_7",
    label: "Sum ≥ 7",
    shortLabel: "≥7",
    check: (a, b) => a + b >= 7,
    prob: "21/36",
    probNum: 21 / 36,
    profCorrect:
      "Sums 7–12: 6+5+4+3+2+1 = 21 out of 36 ≈ 58.3%. More than half — because 7 (the peak) is included!",
    profWrong:
      "Sums 7 through 12: 6+5+4+3+2+1 = 21 out of 36 ≈ 58.3%. Since the mode (7) is included, this is slightly above 50%.",
    breakdown: [
      "7:6, 8:5, 9:4, 10:3, 11:2, 12:1",
      "6+5+4+3+2+1 = 21 out of 36",
      "≈ 58.3% — more than half!",
    ],
    formula: "P(sum≥7) = 21/36 ≈ 58.3%",
  },
  {
    id: "different",
    label: "Dice Differ",
    shortLabel: "Diff",
    check: (a, b) => a !== b,
    prob: "30/36 = 5/6",
    probNum: 5 / 6,
    profCorrect:
      "Non-doubles! Complement of doubles: 1 - 6/36 = 30/36 = 5/6 ≈ 83.3%. Most of the time the dice differ.",
    profWrong:
      "P(differ) = 1 - P(doubles) = 1 - 6/36 = 30/36 = 5/6 ≈ 83.3%. The complement rule turns a hard count into a trivial subtraction.",
    breakdown: [
      "Total: 36, Doubles: 6",
      "P(differ) = 1 - 6/36 = 30/36 = 5/6",
      "Complement rule makes this instant!",
    ],
    formula: "P(differ) = 1-P(doubles) = 5/6 ≈ 83.3%",
  },
];

const TOPICS = [
  {
    id: "counting",
    name: "Counting & Basics",
    icon: "#",
    color: "#3b82f6",
    level: 1,
  },
  {
    id: "probability",
    name: "Probability",
    icon: "⚄",
    color: "#8b5cf6",
    level: 2,
  },
  {
    id: "permutations",
    name: "Permutations",
    icon: "↻",
    color: "#ec4899",
    level: 3,
  },
  {
    id: "combinations",
    name: "Combinations",
    icon: "C",
    color: "#f59e0b",
    level: 4,
  },
  {
    id: "statistics",
    name: "Statistics",
    icon: "σ",
    color: "#10b981",
    level: 5,
  },
  {
    id: "expected_value",
    name: "Expected Value",
    icon: "E",
    color: "#06b6d4",
    level: 6,
  },
  {
    id: "linear_algebra",
    name: "Linear Algebra",
    icon: "[]",
    color: "#f97316",
    level: 7,
  },
  {
    id: "bayes",
    name: "Bayes' Theorem",
    icon: "B",
    color: "#a855f7",
    level: 8,
  },
];

const LESSONS = {
  counting: [
    {
      id: "c1",
      title: "Counting Outcomes",
      intro:
        "When we roll a single die, there are exactly 6 possible outcomes. Counting the size of a sample space is the foundation of all probability.",
      question: "How many total outcomes when rolling ONE six-sided die?",
      choices: ["3", "6", "12", "36"],
      answer: 1,
      explain:
        "A standard die has 6 faces → 6 possible outcomes. This set of all outcomes is called the sample space.",
      formula: "Sample space = 6 (one outcome per face)",
    },
    {
      id: "c2",
      title: "Multiplication Principle",
      intro:
        "When two events happen independently, MULTIPLY their counts. Two dice: 6 × 6 = 36 total combinations. This is the Fundamental Counting Principle.",
      question: "How many outcomes when rolling TWO dice?",
      choices: ["6", "12", "24", "36"],
      answer: 3,
      explain:
        "6 outcomes on die 1 × 6 outcomes on die 2 = 36 total outcome pairs. (1,1),(1,2),...,(6,6).",
      formula: "Total = 6 × 6 = 36",
    },
    {
      id: "c3",
      title: "Counting Cards",
      intro:
        "A standard deck: 4 suits × 13 values = 52 cards. Understanding structure lets us count any subset precisely and instantly.",
      question: "How many HEART cards in a 52-card deck?",
      choices: ["4", "12", "13", "26"],
      answer: 2,
      explain:
        "52 cards ÷ 4 suits = 13 per suit: A♥,2♥,...,K♥. Every value appears exactly once in each suit.",
      formula: "Cards per suit = 52 ÷ 4 = 13",
    },
  ],
  probability: [
    {
      id: "p1",
      title: "Basic Probability",
      intro:
        "Probability = favorable outcomes ÷ total outcomes. Always between 0 (impossible) and 1 (certain). This ratio is the core of all probability.",
      question: "P(rolling exactly 6) on one die?",
      choices: ["1/3", "1/4", "1/5", "1/6"],
      answer: 3,
      explain:
        "1 favorable outcome (the 6) ÷ 6 total outcomes = 1/6 ≈ 16.7%. Simple ratio!",
      formula: "P(event) = favorable / total = 1/6",
    },
    {
      id: "p2",
      title: "Most Likely Sum",
      intro:
        "With two dice, sums near 7 are most likely because more pairs produce them. Understanding WHY requires systematic counting.",
      question: "Which sum is most probable with two dice?",
      choices: ["2", "6", "7", "12"],
      answer: 2,
      explain:
        "Sum 7 has 6 ways: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1). More than any other! P(7) = 6/36 = 1/6.",
      formula: "P(sum=7) = 6/36 = 1/6 — most likely of all 11 possible sums",
    },
    {
      id: "p3",
      title: "Complement Rule",
      intro:
        "P(NOT A) = 1 − P(A). Often easier to calculate what you DON'T want. Especially powerful when 'at least one' events get complex.",
      question: "P(NOT rolling a 1) on one die?",
      choices: ["1/6", "3/6", "4/6", "5/6"],
      answer: 3,
      explain:
        "P(not 1) = 1 − 1/6 = 5/6. The complement rule avoids listing {2,3,4,5,6} individually.",
      formula: "P(not A) = 1 − P(A) = 1 − 1/6 = 5/6",
    },
    {
      id: "p4",
      title: "Independent Events",
      intro:
        "Two events are independent if knowing one gives no info about the other. Each die roll is independent — the dice have no memory!",
      question: "P(rolling 6 on BOTH dice)?",
      choices: ["1/6", "2/6", "1/36", "2/36"],
      answer: 2,
      explain:
        "P(6 on die 1) × P(6 on die 2) = 1/6 × 1/6 = 1/36. Multiply probabilities for independent events.",
      formula: "P(A and B) = P(A)×P(B) = 1/6×1/6 = 1/36",
    },
  ],
  permutations: [
    {
      id: "perm1",
      title: "What Are Permutations?",
      intro:
        "A permutation is an ORDERED arrangement. Order matters: A-K-Q and Q-K-A are different permutations. Passwords, rankings, sequences all use permutations.",
      question: "Cards A,K,Q — how many ordered arrangements of all 3?",
      choices: ["3", "4", "6", "9"],
      answer: 2,
      explain: "AKQ,AQK,KAQ,KQA,QAK,QKA = 6. Formula: 3! = 3×2×1 = 6.",
      formula: "n! = 3! = 3×2×1 = 6",
    },
    {
      id: "perm2",
      title: "Partial Permutations",
      intro:
        "P(n,r) = n!/(n−r)! counts ordered selections of r items from n. Think: awarding gold, silver, bronze from 10 athletes.",
      question: "From 5 cards, ordered selections of 3?",
      choices: ["10", "20", "60", "120"],
      answer: 2,
      explain:
        "P(5,3) = 5!/(5−3)! = 120/2 = 60. A-K-Q counts separately from Q-K-A.",
      formula: "P(5,3) = 5!/(5-3)! = 120/2 = 60",
    },
    {
      id: "perm3",
      title: "Perms vs Combos Preview",
      intro:
        "Each combination of r items generates r! permutations. The formulas differ only by that r! factor. This insight connects both concepts.",
      question: "Picking 2 from {A,B,C}: permutations vs combinations?",
      choices: ["6 perms, 3 combos", "3 perms, 6 combos", "6 each", "3 each"],
      answer: 0,
      explain:
        "Perms: AB,BA,AC,CA,BC,CB = 6. Combos: {AB},{AC},{BC} = 3. Ratio = 2! = 2.",
      formula: "P(3,2)/C(3,2) = 6/3 = r! = 2! = 2",
    },
  ],
  combinations: [
    {
      id: "com1",
      title: "What Are Combinations?",
      intro:
        "Combinations count selections where ORDER DOESN'T MATTER. A poker hand {A,K,Q,J,10} is identical regardless of how you hold the cards.",
      question: "2-card hands from {A,K,Q}?",
      choices: ["3", "4", "6", "9"],
      answer: 0,
      explain:
        "Just {AK},{AQ},{KQ} = 3. No ordering: AK and KA are the same hand.",
      formula: "C(3,2) = 3!/(2!·1!) = 3",
    },
    {
      id: "com2",
      title: "The Combination Formula",
      intro:
        "C(n,r) = n!/(r!×(n−r)!). The r! divides out all orderings, leaving only unique selections. Read it as 'n choose r'.",
      question: "5-card hands from 52 cards?",
      choices: ["2,598,960", "1,000,000", "52,520", "260,000"],
      answer: 0,
      explain:
        "C(52,5) = 52!/(5!·47!) = 2,598,960. Nearly 2.6 million unique hands!",
      formula: "C(52,5) = 52!/(5!·47!) = 2,598,960",
    },
    {
      id: "com3",
      title: "Combinations in Practice",
      intro:
        "Multi-stage selections: multiply C() values. Want exactly 2 aces in a 5-card hand? Choose which 2 aces × choose 3 remaining cards.",
      question: "Exactly 2 aces (from 4) + 3 non-aces (from 48)?",
      choices: ["288", "17,296", "103,776", "6"],
      answer: 2,
      explain: "C(4,2) × C(48,3) = 6 × 17,296 = 103,776 hands.",
      formula: "C(4,2)×C(48,3) = 6×17,296 = 103,776",
    },
  ],
  statistics: [
    {
      id: "s1",
      title: "Mean (Average)",
      intro:
        "Mean = sum/count. The 'balancing point' of your data. Sensitive to outliers — one extreme value can pull it far from the bulk of data.",
      question: "Rolls: 3,5,2,6,4 — mean?",
      choices: ["3.5", "4", "4.5", "5"],
      answer: 1,
      explain: "(3+5+2+6+4)/5 = 20/5 = 4.",
      formula: "Mean = Σx/n = (3+5+2+6+4)/5 = 20/5 = 4",
    },
    {
      id: "s2",
      title: "Median & Mode",
      intro:
        "Median = middle value when sorted. Mode = most frequent. These are resistant to outliers. A billionaire joining a room raises the mean salary enormously but barely moves the median.",
      question: "Data {2,3,3,5,7} — median?",
      choices: ["2", "3", "4", "5"],
      answer: 1,
      explain:
        "Sorted: 2,3,3,5,7 — middle value = 3. Mode = 3 (appears twice). Mean = 4. Three different measures!",
      formula: "Median = middle of sorted data = 3",
    },
    {
      id: "s3",
      title: "Variance & Std Dev",
      intro:
        "Variance = average squared deviation from mean. Std dev = √variance (back in original units). Low variance = tight cluster. High variance = wide spread.",
      question: "Higher variance: A={4,4,4,4,4} or B={1,2,4,6,7}?",
      choices: ["Dataset A", "Dataset B", "Equal", "Cannot tell"],
      answer: 1,
      explain:
        "Var(A)=0 (all identical!). Var(B): mean=4, deviations² sum = 9+4+0+4+9=26, Var=5.2. B is far more spread.",
      formula: "Var = Σ(x-μ)²/n → Var(A)=0, Var(B)=5.2",
    },
  ],
  expected_value: [
    {
      id: "ev1",
      title: "Expected Value",
      intro:
        "E(X) = Σ[outcome × probability]. Average gain over many trials. Casinos survive because every game has negative EV for players — guaranteed by math.",
      question: "Win $6 if you roll a 6, lose $1 otherwise. E(winnings)?",
      choices: ["−$0.83", "$0", "$0.17", "$1"],
      answer: 1,
      explain:
        "E = 6×(1/6) + (−1)×(5/6) = 1 − 5/6 = 1/6 ≈ 0. This is a perfectly fair game!",
      formula: "E(X) = 6·(1/6) + (−1)·(5/6) = 1/6 ≈ 0",
    },
    {
      id: "ev2",
      title: "EV for Decisions",
      intro:
        "Rational decision: choose the highest expected value option. This is the foundation of economics, finance, and AI decision-making.",
      question: "A: guaranteed $5. B: 50% → $12, 50% → $0. Higher EV?",
      choices: ["A ($5 EV)", "B ($6 EV)", "Equal EV", "Can't say"],
      answer: 1,
      explain:
        "E(A)=$5. E(B)=0.5×12+0.5×0=$6. Option B has $1 more EV despite being riskier!",
      formula: "E(B) = 0.5×12 + 0.5×0 = $6 > $5 = E(A)",
    },
  ],
  linear_algebra: [
    {
      id: "la1",
      title: "Vectors",
      intro:
        "A vector = ordered list of numbers. [3,2] means 'move 3 right, 2 up'. Vectors encode positions, forces, velocities — and in ML, entire data points.",
      question: "[3,2] + [1,−1] = ?",
      choices: ["[2,1]", "[4,1]", "[3,−1]", "[4,3]"],
      answer: 1,
      explain: "Add component-by-component: [3+1, 2+(−1)] = [4,1].",
      formula: "[a,b]+[c,d] = [a+c, b+d]",
    },
    {
      id: "la2",
      title: "Matrix × Vector",
      intro:
        "A matrix transforms a vector: rotating, scaling, shearing it. This is how 3D graphics render, how neural nets process input, how Google PageRank works.",
      question: "[[2,0],[0,3]] × [4,5] = ?",
      choices: ["[8,15]", "[6,8]", "[8,5]", "[4,15]"],
      answer: 0,
      explain:
        "Row1: 2×4+0×5=8. Row2: 0×4+3×5=15. Result: [8,15]. Scales x by 2, y by 3!",
      formula: "[[a,b],[c,d]]·[x,y] = [ax+by, cx+dy]",
    },
    {
      id: "la3",
      title: "Dot Product",
      intro:
        "[a,b]·[c,d] = ac+bd → scalar. Measures alignment. Zero means perpendicular. Powers cosine similarity in search engines and recommendation systems.",
      question: "[3,4]·[2,1] = ?",
      choices: ["5", "10", "14", "11"],
      answer: 1,
      explain:
        "3×2 + 4×1 = 6+4 = 10. If this were 0, the vectors would be perpendicular.",
      formula: "[a,b]·[c,d] = a·c + b·d = 6+4 = 10",
    },
  ],
  bayes: [
    {
      id: "b1",
      title: "Conditional Probability",
      intro:
        "P(A|B) = 'probability of A given B'. New information changes probabilities! This is how doctors update diagnoses, how AI updates beliefs.",
      question: "P(rolling a 6 | you rolled even)?",
      choices: ["1/6", "1/3", "1/4", "1/2"],
      answer: 1,
      explain:
        "Given even, only {2,4,6} possible — 3 outcomes. P(6|even) = 1/3. The condition reduced the sample space!",
      formula: "P(A|B) = P(A∩B)/P(B) = (1/6)/(3/6) = 1/3",
    },
    {
      id: "b2",
      title: "Bayes' Theorem",
      intro:
        "P(A|B) = P(B|A)·P(A)/P(B). Lets you 'flip' conditional probabilities. Backbone of spam filters, medical tests, self-driving cars, and AI.",
      question:
        "Rare disease: 1% prevalence. Test: 90% accurate. You test positive. P(have it)?",
      choices: ["90%", "~8.3%", "1%", "50%"],
      answer: 1,
      explain:
        "P(disease|+) = (0.9×0.01)/(0.9×0.01+0.1×0.99) ≈ 0.009/0.108 ≈ 8.3%. Low base rate dominates!",
      formula: "P(H|E) = P(E|H)·P(H)/P(E) ≈ 0.009/0.108 ≈ 8.3%",
    },
  ],
};

function FormulaBox({ text }) {
  return (
    <div
      style={{
        background: "#1e1b4b",
        color: "#a5b4fc",
        borderRadius: 8,
        padding: "10px 14px",
        fontFamily: "'Courier New',monospace",
        fontSize: 12,
        margin: "10px 0",
        lineHeight: 1.6,
      }}
    >
      {text}
    </div>
  );
}
function Badge({ children, color = "#6366f1" }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: 99,
        background: color + "22",
        color,
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}
function ProgressBar({ value, max, color = "#6366f1" }) {
  return (
    <div
      style={{
        height: 5,
        background: "#1e293b",
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.max(3, Math.round((value / max) * 100))}%`,
          background: color,
          transition: "width 0.4s",
          borderRadius: 3,
        }}
      />
    </div>
  );
}
function TeacherBubble({ text }) {
  return (
    <div
      style={{
        background: "#f0f4ff",
        border: "1.5px solid #c7d2fe",
        borderRadius: 12,
        padding: "12px 16px",
        position: "relative",
        marginBottom: 4,
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: -8,
          left: 20,
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "8px solid transparent",
          borderTop: "8px solid #c7d2fe",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -6.5,
          left: 21,
          width: 0,
          height: 0,
          borderLeft: "7px solid transparent",
          borderRight: "7px solid transparent",
          borderTop: "7px solid #f0f4ff",
        }}
      />
      <p
        style={{ margin: 0, fontSize: 13, color: "#312e81", lineHeight: 1.65 }}
      >
        {text}
      </p>
    </div>
  );
}

function HomeScreen({ onStart, scores }) {
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily: "Georgia,serif",
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 560 }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>🎲</div>
        <h1
          style={{
            fontSize: 40,
            fontWeight: 700,
            color: "#f8fafc",
            margin: "0 0 6px",
            letterSpacing: -1,
          }}
        >
          STEM Quest
        </h1>
        <p
          style={{
            color: "#94a3b8",
            fontSize: 15,
            margin: "0 0 26px",
            lineHeight: 1.5,
          }}
        >
          Master mathematics through dice, cards & gameplay — with Professor
          Nova as your guide
        </p>
        {total > 0 && (
          <div
            style={{
              background: "#1e293b",
              borderRadius: 12,
              padding: "10px 20px",
              marginBottom: 18,
              display: "inline-block",
            }}
          >
            <span style={{ color: "#94a3b8", fontSize: 13 }}>Total XP: </span>
            <span style={{ color: "#fbbf24", fontSize: 20, fontWeight: 700 }}>
              {total}
            </span>
          </div>
        )}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 24,
          }}
        >
          {TOPICS.map((t) => (
            <div
              key={t.id}
              style={{
                background: "#1e293b",
                borderRadius: 10,
                padding: "9px 12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: `1px solid ${scores[t.id] > 0 ? "#4ade80" : "#334155"}`,
              }}
            >
              <span style={{ fontSize: 16, color: t.color }}>{t.icon}</span>
              <div>
                <p
                  style={{
                    margin: 0,
                    color: "#f1f5f9",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {t.name}
                </p>
                {scores[t.id] > 0 && (
                  <p style={{ margin: 0, color: "#4ade80", fontSize: 10 }}>
                    +{scores[t.id]} XP
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onStart}
          style={{
            background: "#6366f1",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "13px 36px",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {total > 0 ? "Continue Quest →" : "Begin Learning →"}
        </button>
      </div>
    </div>
  );
}

function TopicSelectScreen({ onSelect, scores }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        padding: "1.5rem",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      <h2
        style={{
          color: "#f8fafc",
          textAlign: "center",
          fontSize: 22,
          marginBottom: 4,
        }}
      >
        Choose Your Topic
      </h2>
      <p
        style={{
          color: "#64748b",
          textAlign: "center",
          fontSize: 13,
          marginBottom: 22,
        }}
      >
        Complete lessons → unlock practice → earn XP
      </p>
      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: 9,
        }}
      >
        {TOPICS.map((t, i) => {
          const locked = i > 0 && !scores[TOPICS[i - 1].id];
          return (
            <div
              key={t.id}
              onClick={locked ? null : () => onSelect(t.id)}
              style={{
                background: locked ? "#161f30" : "#1e293b",
                borderRadius: 12,
                padding: "13px 16px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                border: `1.5px solid ${scores[t.id] > 0 ? "#4ade80" : locked ? "#1e293b" : "#334155"}`,
                cursor: locked ? "default" : "pointer",
                opacity: locked ? 0.5 : 1,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 9,
                  background: t.color + "22",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  color: t.color,
                  flexShrink: 0,
                }}
              >
                {t.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <p
                    style={{
                      margin: 0,
                      color: "#f1f5f9",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {t.name}
                  </p>
                  {locked && <Badge color="#64748b">Locked</Badge>}
                  {scores[t.id] > 0 && (
                    <Badge color="#4ade80">+{scores[t.id]} XP</Badge>
                  )}
                </div>
                <p style={{ margin: 0, color: "#64748b", fontSize: 11 }}>
                  Level {t.level} · {LESSONS[t.id].length} lessons
                </p>
              </div>
              {!locked && (
                <span style={{ color: "#6366f1", fontSize: 16 }}>→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LessonScreen({ topicId, lessonIndex, onComplete, onBack }) {
  const lessons = LESSONS[topicId];
  const lesson = lessons[lessonIndex];
  const topic = TOPICS.find((t) => t.id === topicId);
  const [phase, setPhase] = useState("read");
  const [chosen, setChosen] = useState(null);
  const submit = (idx) => {
    setChosen(idx);
    setPhase("result");
  };
  const correct = chosen === lesson.answer;
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        padding: "1.5rem",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <button
            onClick={onBack}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: 20,
              padding: 0,
            }}
          >
            ←
          </button>
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: "0 0 3px",
                color: topic.color,
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {topic.name}
            </p>
            <ProgressBar
              value={lessonIndex + 1}
              max={lessons.length}
              color={topic.color}
            />
          </div>
          <Badge color={topic.color}>
            Lesson {lessonIndex + 1}/{lessons.length}
          </Badge>
        </div>
        <h2 style={{ color: "#f8fafc", fontSize: 20, margin: "0 0 14px" }}>
          {lesson.title}
        </h2>
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 16,
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#1e293b",
              border: `2px solid ${topic.color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            🎓
          </div>
          <TeacherBubble text={lesson.intro} />
        </div>
        <FormulaBox text={lesson.formula} />
        {(phase === "question" || phase === "result") && (
          <div style={{ marginTop: 18 }}>
            <p
              style={{
                color: "#e2e8f0",
                fontWeight: 600,
                fontSize: 14,
                marginBottom: 10,
              }}
            >
              {lesson.question}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {lesson.choices.map((ch, i) => {
                let bg = "#1e293b",
                  border = "1.5px solid #334155",
                  color = "#e2e8f0";
                if (phase === "result") {
                  if (i === lesson.answer) {
                    bg = "#052e16";
                    border = "1.5px solid #4ade80";
                    color = "#4ade80";
                  } else if (i === chosen && chosen !== lesson.answer) {
                    bg = "#2d1515";
                    border = "1.5px solid #ef4444";
                    color = "#ef4444";
                  }
                }
                return (
                  <button
                    key={i}
                    onClick={phase === "question" ? () => submit(i) : null}
                    style={{
                      background: bg,
                      border,
                      borderRadius: 8,
                      padding: "11px 14px",
                      textAlign: "left",
                      color,
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: phase === "question" ? "pointer" : "default",
                    }}
                  >
                    <span style={{ color: "#64748b", marginRight: 8 }}>
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {ch}
                  </button>
                );
              })}
            </div>
            {phase === "result" && (
              <div
                style={{
                  marginTop: 14,
                  background: correct ? "#052e16" : "#2d1515",
                  borderRadius: 10,
                  padding: "13px 14px",
                  border: `1.5px solid ${correct ? "#4ade80" : "#ef4444"}`,
                }}
              >
                <p
                  style={{
                    margin: "0 0 5px",
                    color: correct ? "#4ade80" : "#ef4444",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {correct ? "✓ Correct! +20 XP" : "✗ Not quite — here's why:"}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "#cbd5e1",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  {lesson.explain}
                </p>
                <button
                  onClick={onComplete}
                  style={{
                    marginTop: 10,
                    background: topic.color,
                    color: "#fff",
                    border: "none",
                    borderRadius: 8,
                    padding: "9px 18px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {lessonIndex < lessons.length - 1
                    ? "Next Lesson →"
                    : "Start Practice →"}
                </button>
              </div>
            )}
          </div>
        )}
        {phase === "read" && (
          <button
            onClick={() => setPhase("question")}
            style={{
              marginTop: 18,
              background: topic.color,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 26px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Ready for the Question →
          </button>
        )}
      </div>
    </div>
  );
}

function DicePractice({ onBack, onScore }) {
  const [dice, setDice] = useState([1, 1]);
  const [pred, setPred] = useState(null);
  const [interrupt, setInterrupt] = useState(null);
  const [pts, setPts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [history, setHistory] = useState([]);
  const [totalRolls, setTotalRolls] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [activeGroup, setActiveGroup] = useState(0);

  const groups = [DICE_PREDICTIONS.slice(0, 6), DICE_PREDICTIONS.slice(6, 12)];
  const visiblePreds = groups[activeGroup];

  const doRoll = () => {
    if (!pred) return;
    const d = [rollDie(), rollDie()];
    setDice(d);
    const correct = pred.check(d[0], d[1]);
    const newStreak = correct ? streak + 1 : 0;
    setStreak(newStreak);
    const bonus = correct && newStreak >= 3 ? 5 : 0;
    const earned = correct ? 10 + bonus : -3;
    setPts((p) => p + earned);
    setTotalRolls((t) => t + 1);
    if (correct) setCorrectCount((c) => c + 1);
    setHistory((h) => [...h.slice(-14), { label: pred.shortLabel, correct }]);
    setInterrupt({
      correct,
      prediction: pred,
      dice: d,
      profText: correct ? pred.profCorrect : pred.profWrong,
      mathBreakdown: pred.breakdown,
      formula: pred.formula,
      bonus,
      earned,
    });
  };

  const dismiss = () => {
    setPred(null);
    setInterrupt(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        padding: "1.5rem",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      <ProfessorModal interrupt={interrupt} onDismiss={dismiss} />
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <button
            onClick={() => onScore(pts)}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: 20,
              padding: 0,
            }}
          >
            ←
          </button>
          <div style={{ flex: 1 }}>
            <p
              style={{
                margin: 0,
                color: "#8b5cf6",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Probability Practice — Professor Nova
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {streak >= 2 && (
              <span style={{ color: "#f59e0b", fontSize: 12, fontWeight: 600 }}>
                🔥×{streak}
              </span>
            )}
            <div
              style={{
                background: "#1e293b",
                borderRadius: 8,
                padding: "5px 12px",
              }}
            >
              <span style={{ color: "#fbbf24", fontWeight: 700, fontSize: 15 }}>
                {pts} XP
              </span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "#1e293b",
            borderRadius: 14,
            padding: "14px",
            border: "1px solid #334155",
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <DiceFace value={dice[0]} size={54} />
            <DiceFace value={dice[1]} size={54} />
            <div style={{ marginLeft: 8 }}>
              <p style={{ margin: 0, color: "#64748b", fontSize: 11 }}>
                Last sum
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#f8fafc",
                  fontSize: 26,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {dice[0] + dice[1]}
              </p>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <p style={{ margin: 0, color: "#64748b", fontSize: 11 }}>
                Accuracy
              </p>
              <p
                style={{
                  margin: 0,
                  color:
                    totalRolls > 0 && correctCount / totalRolls > 0.5
                      ? "#4ade80"
                      : "#f87171",
                  fontSize: 18,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {totalRolls > 0
                  ? Math.round((correctCount / totalRolls) * 100)
                  : "-"}
                %
              </p>
            </div>
          </div>
          {history.length > 0 && (
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              {history.map((h, i) => (
                <div
                  key={i}
                  style={{
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: h.correct ? "#052e16" : "#2d1515",
                    border: `1px solid ${h.correct ? "#4ade80" : "#ef4444"}`,
                    fontSize: 9,
                    color: h.correct ? "#4ade80" : "#f87171",
                    fontWeight: 600,
                  }}
                >
                  {h.label}
                  {h.correct ? "✓" : "✗"}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            background: "#1e293b",
            borderRadius: 14,
            padding: "14px",
            border: "1px solid #334155",
            marginBottom: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <p style={{ margin: 0, color: "#94a3b8", fontSize: 12 }}>
              Pick a prediction, then roll!
            </p>
            <div style={{ display: "flex", gap: 4 }}>
              {groups.map((_, gi) => (
                <button
                  key={gi}
                  onClick={() => {
                    setActiveGroup(gi);
                    setPred(null);
                  }}
                  style={{
                    padding: "3px 10px",
                    borderRadius: 6,
                    fontSize: 11,
                    border: `1px solid ${activeGroup === gi ? "#6366f1" : "#334155"}`,
                    background: activeGroup === gi ? "#6366f1" : "transparent",
                    color: activeGroup === gi ? "#fff" : "#64748b",
                    cursor: "pointer",
                  }}
                >
                  {gi === 0 ? "Basic" : "Advanced"}
                </button>
              ))}
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 7,
            }}
          >
            {visiblePreds.map((p) => {
              const sel = pred?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setPred(p)}
                  style={{
                    background: sel ? "#312e81" : "#0f172a",
                    border: `1.5px solid ${sel ? "#818cf8" : "#334155"}`,
                    borderRadius: 9,
                    padding: "9px 5px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 2px",
                      color: sel ? "#c7d2fe" : "#e2e8f0",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    {p.shortLabel}
                  </p>
                  <p
                    style={{
                      margin: "0 0 2px",
                      color: sel ? "#a5b4fc" : "#64748b",
                      fontSize: 9,
                      lineHeight: 1.3,
                    }}
                  >
                    {p.label}
                  </p>
                  <p
                    style={{
                      margin: 0,
                      color: sel ? "#818cf8" : "#475569",
                      fontSize: 9,
                      fontFamily: "monospace",
                    }}
                  >
                    {p.prob}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={doRoll}
          disabled={!pred}
          style={{
            width: "100%",
            background: pred ? "#6366f1" : "#1e293b",
            color: pred ? "#fff" : "#475569",
            border: "none",
            borderRadius: 11,
            padding: "12px",
            fontSize: 14,
            fontWeight: 700,
            cursor: pred ? "pointer" : "default",
            marginBottom: 12,
          }}
        >
          {pred
            ? `Roll! — predicting: "${pred.label}"`
            : "← Select a prediction first"}
        </button>

        <div
          style={{
            background: "#1e293b",
            borderRadius: 12,
            padding: "12px",
            border: "1px solid #334155",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#64748b",
              fontSize: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Two-Dice Probability Distribution
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 3,
              height: 52,
            }}
          >
            {Object.entries(SUM_COUNTS).map(([sum, count]) => {
              const highlight =
                (pred && pred.check(1, parseInt(sum) - 1)) || false;
              return (
                <div
                  key={sum}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      background:
                        sum === "7"
                          ? "#6366f1"
                          : pred &&
                              [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
                                .filter((s) =>
                                  pred.check(
                                    Math.ceil(s / 2),
                                    Math.floor(s / 2),
                                  ),
                                )
                                .includes(parseInt(sum))
                            ? "#10b981"
                            : "#334155",
                      borderRadius: "2px 2px 0 0",
                      height: `${Math.round((count / 6) * 44)}px`,
                      transition: "background 0.2s",
                    }}
                  />
                  <p style={{ margin: 0, color: "#475569", fontSize: 8 }}>
                    {sum}
                  </p>
                </div>
              );
            })}
          </div>
          <p
            style={{
              margin: "4px 0 0",
              color: "#475569",
              fontSize: 9,
              textAlign: "center",
            }}
          >
            Indigo = sum 7 (most likely). Green = sums your prediction covers.
          </p>
        </div>
      </div>
    </div>
  );
}

function ComboPractice({ topicId, onBack, onScore }) {
  const topic = TOPICS.find((t) => t.id === topicId);
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [pts, setPts] = useState(0);
  const [interrupt, setInterrupt] = useState(null);
  const draw = useCallback(() => {
    setCards(shuffle(buildDeck()).slice(0, 5));
    setSelected([]);
    setResult(null);
    setInterrupt(null);
  }, []);
  useEffect(() => draw(), [draw]);
  const check = () => {
    const r = selected.length;
    if (r < 2) return;
    const combos = C(5, r),
      perms = P(5, r);
    setPts((p) => p + 15);
    setResult({ combos, perms, r });
    setInterrupt({
      correct: true,
      prediction: { label: `${r} cards selected` },
      dice: [r, 5],
      profText: `With ${r} cards selected from 5: C(5,${r})=${combos} combinations vs P(5,${r})=${perms} permutations. The ratio is r! = ${r}! = ${factorial(r)}. That's how many orderings each combination generates!`,
      mathBreakdown: [
        `C(5,${r}) = 5!/(${r}!×${5 - r}!) = ${factorial(5)}/(${factorial(r)}×${factorial(5 - r)}) = ${combos}`,
        `P(5,${r}) = 5!/${5 - r}! = ${factorial(5)}/${factorial(5 - r)} = ${perms}`,
        `Ratio: ${perms}/${combos} = ${r}! = ${factorial(r)}`,
      ],
      formula: `C(n,r) = n!/(r!(n-r)!)   P(n,r) = n!/(n-r)!`,
    });
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        padding: "1.5rem",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      <ProfessorModal
        interrupt={interrupt}
        onDismiss={() => setInterrupt(null)}
      />
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <button
            onClick={() => onScore(pts)}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: 20,
              padding: 0,
            }}
          >
            ←
          </button>
          <h2 style={{ margin: 0, color: "#f8fafc", fontSize: 18, flex: 1 }}>
            {topic.name} Practice
          </h2>
          <div
            style={{
              background: "#1e293b",
              borderRadius: 8,
              padding: "5px 12px",
            }}
          >
            <span style={{ color: "#fbbf24", fontWeight: 700 }}>{pts} XP</span>
          </div>
        </div>
        <div
          style={{
            background: "#1e293b",
            borderRadius: 14,
            padding: "16px",
            border: "1px solid #334155",
            marginBottom: 12,
          }}
        >
          <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 12px" }}>
            Select 2–5 cards. Professor Nova will calculate and explain
            combinations vs permutations for your selection.
          </p>
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            {cards.map((c, i) => (
              <PlayingCard
                key={i}
                value={c.value}
                suit={c.suit}
                selected={selected.includes(i)}
                onClick={() =>
                  setSelected((s) =>
                    s.includes(i) ? s.filter((x) => x !== i) : [...s, i],
                  )
                }
              />
            ))}
          </div>
          {selected.length >= 2 && (
            <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 10px" }}>
              Selected {selected.length} of 5 cards
            </p>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={check}
              disabled={selected.length < 2 || !!result}
              style={{
                background:
                  selected.length >= 2 && !result ? "#6366f1" : "#1e293b",
                color: selected.length >= 2 && !result ? "#fff" : "#475569",
                border: "none",
                borderRadius: 8,
                padding: "9px 16px",
                fontSize: 13,
                fontWeight: 600,
                cursor: selected.length >= 2 && !result ? "pointer" : "default",
              }}
            >
              Calculate C & P →
            </button>
            <button
              onClick={draw}
              style={{
                background: "transparent",
                color: "#94a3b8",
                border: "1.5px solid #334155",
                borderRadius: 8,
                padding: "9px 16px",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              New Hand
            </button>
          </div>
        </div>
        {result && (
          <div
            style={{
              background: "#1e293b",
              borderRadius: 12,
              padding: "14px",
              border: "1px solid #334155",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <div
                style={{
                  background: "#0f172a",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                <p style={{ margin: 0, color: "#64748b", fontSize: 11 }}>
                  Combinations C(5,{result.r})
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "#f59e0b",
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  {result.combos}
                </p>
                <p style={{ margin: 0, color: "#475569", fontSize: 10 }}>
                  order doesn't matter
                </p>
              </div>
              <div
                style={{
                  background: "#0f172a",
                  borderRadius: 8,
                  padding: "10px 12px",
                }}
              >
                <p style={{ margin: 0, color: "#64748b", fontSize: 11 }}>
                  Permutations P(5,{result.r})
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "#ec4899",
                    fontSize: 24,
                    fontWeight: 700,
                  }}
                >
                  {result.perms}
                </p>
                <p style={{ margin: 0, color: "#475569", fontSize: 10 }}>
                  order matters
                </p>
              </div>
            </div>
            <p
              style={{
                margin: "10px 0 0",
                color: "#64748b",
                fontSize: 11,
                textAlign: "center",
              }}
            >
              Ratio: {result.perms}/{result.combos} = {result.r}! ={" "}
              {factorial(result.r)}
            </p>
          </div>
        )}
        <div
          style={{
            background: "#1e293b",
            borderRadius: 12,
            padding: "14px",
            border: "1px solid #334155",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#64748b",
              fontSize: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Pascal's Triangle — C(n,r)
          </p>
          {[0, 1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 5,
                marginBottom: 3,
              }}
            >
              {Array.from({ length: n + 1 }, (_, r) => (
                <div
                  key={r}
                  style={{
                    width: 26,
                    height: 20,
                    borderRadius: 4,
                    background:
                      n === 5 && r === selected.length ? "#312e81" : "#0f172a",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10,
                    color:
                      n === 5 && r === selected.length ? "#a5b4fc" : "#64748b",
                    border: `1px solid ${n === 5 && r === selected.length ? "#6366f1" : "#1e293b"}`,
                    fontWeight: n === 5 ? "600" : "400",
                  }}
                >
                  {C(n, r)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsPractice({ onBack, onScore }) {
  const [rolls, setRolls] = useState([]);
  const [d, setD] = useState(3);
  const [interrupt, setInterrupt] = useState(null);
  const [pts, setPts] = useState(0);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [ansResult, setAnsResult] = useState(null);

  const doRoll = () => {
    const val = rollDie();
    const newRolls = [...rolls, val];
    setRolls(newRolls);
    setD(val);
    if (newRolls.length >= 5 && newRolls.length % 5 === 0)
      generateQuestion(newRolls);
  };

  const generateQuestion = (vals) => {
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const sorted = [...vals].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? parseFloat(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1))
      : sorted[mid];
    const freq = {};
    vals.forEach((v) => {
      freq[v] = (freq[v] || 0) + 1;
    });
    const mode = parseInt(
      Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0],
    );
    const variance =
      vals.reduce((a, v) => a + (v - mean) ** 2, 0) / vals.length;
    const qs = [
      {
        q: "What is the MEAN of your rolls? (round to 1 decimal)",
        a: parseFloat(mean.toFixed(1)),
        explain: `Mean = (${vals.join("+")})/n = ${vals.reduce((a, b) => a + b, 0)}/${vals.length} = ${mean.toFixed(2)}`,
      },
      {
        q: "What is the MEDIAN of your rolls?",
        a: median,
        explain: `Sorted: [${sorted.join(",")}]. Median = ${sorted.length % 2 === 0 ? `(${sorted[mid - 1]}+${sorted[mid]})/2` : `middle value at index ${mid}`} = ${median}`,
      },
      {
        q: "What is the MODE of your rolls?",
        a: mode,
        explain: `${mode} appeared most frequently (${freq[mode]} times)`,
      },
      {
        q: "What is the VARIANCE? (1 decimal)",
        a: parseFloat(variance.toFixed(1)),
        explain: `Var = Σ(x-μ)²/n, μ=${mean.toFixed(1)}, = ${variance.toFixed(2)}`,
      },
    ];
    const q = qs[Math.floor(Math.random() * qs.length)];
    setQuestion({ ...q, vals: [...vals] });
    setAnswer("");
    setAnsResult(null);
  };

  const checkAnswer = () => {
    if (!question) return;
    const correct = Math.abs(parseFloat(answer) - question.a) < 0.2;
    if (correct) setPts((p) => p + 20);
    setAnsResult(correct ? "correct" : "wrong");
    setInterrupt({
      correct,
      prediction: { label: answer },
      dice: null,
      profText: correct
        ? `Excellent! ${question.explain}`
        : `Not quite. ${question.explain}`,
      mathBreakdown: [
        `Data: [${question.vals.join(", ")}]`,
        `${question.q}`,
        `Answer: ${question.a}`,
      ],
      formula: `Mean=Σx/n  |  Median=middle(sorted)  |  Var=Σ(x-μ)²/n`,
    });
  };

  const stats =
    rolls.length >= 3
      ? {
          mean: (rolls.reduce((a, b) => a + b, 0) / rolls.length).toFixed(2),
          median: (() => {
            const s = [...rolls].sort((a, b) => a - b);
            const m = Math.floor(s.length / 2);
            return s.length % 2 === 0
              ? ((s[m - 1] + s[m]) / 2).toFixed(1)
              : s[m];
          })(),
          stddev: Math.sqrt(
            rolls.reduce(
              (a, v) =>
                a + (v - rolls.reduce((x, y) => x + y, 0) / rolls.length) ** 2,
              0,
            ) / rolls.length,
          ).toFixed(2),
          count: rolls.length,
        }
      : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        padding: "1.5rem",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      <ProfessorModal
        interrupt={interrupt}
        onDismiss={() => setInterrupt(null)}
      />
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <button
            onClick={() => onScore(pts)}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: 20,
              padding: 0,
            }}
          >
            ←
          </button>
          <h2 style={{ margin: 0, color: "#f8fafc", fontSize: 18, flex: 1 }}>
            Statistics Practice
          </h2>
          <div
            style={{
              background: "#1e293b",
              borderRadius: 8,
              padding: "5px 12px",
            }}
          >
            <span style={{ color: "#fbbf24", fontWeight: 700 }}>{pts} XP</span>
          </div>
        </div>
        <div
          style={{
            background: "#1e293b",
            borderRadius: 14,
            padding: "14px",
            border: "1px solid #334155",
            marginBottom: 12,
          }}
        >
          <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 10px" }}>
            Roll dice to build your dataset. Every 5 rolls, Professor Nova asks
            a statistics question!
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 10,
            }}
          >
            <DiceFace value={d} size={48} />
            <div>
              <p style={{ margin: 0, color: "#64748b", fontSize: 11 }}>
                Rolls: {rolls.length}
              </p>
              {rolls.length > 0 && (
                <p
                  style={{
                    margin: 0,
                    color: "#e2e8f0",
                    fontSize: 11,
                    fontFamily: "monospace",
                  }}
                >
                  [{rolls.slice(-12).join(",")}]
                </p>
              )}
            </div>
          </div>
          <button
            onClick={doRoll}
            style={{
              background: "#10b981",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "9px 18px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Roll & Record
          </button>
        </div>
        {stats && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {[
              ["Mean", stats.mean, "#06b6d4"],
              ["Median", stats.median, "#8b5cf6"],
              ["Std Dev", stats.stddev, "#f59e0b"],
              ["Count", stats.count, "#10b981"],
            ].map(([k, v, c]) => (
              <div
                key={k}
                style={{
                  background: "#1e293b",
                  borderRadius: 10,
                  padding: "10px 12px",
                  border: "1px solid #334155",
                }}
              >
                <p style={{ margin: 0, color: "#64748b", fontSize: 11 }}>{k}</p>
                <p
                  style={{
                    margin: 0,
                    color: c,
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {v}
                </p>
              </div>
            ))}
          </div>
        )}
        {rolls.length >= 5 && (
          <div
            style={{
              background: "#1e293b",
              borderRadius: 12,
              padding: "12px",
              border: "1px solid #334155",
              marginBottom: 12,
            }}
          >
            <p
              style={{
                margin: "0 0 7px",
                color: "#64748b",
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Your Roll Distribution vs Theoretical (dashed)
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 4,
                height: 48,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((v) => {
                const cnt = rolls.filter((r) => r === v).length;
                const max = Math.max(
                  1,
                  ...[1, 2, 3, 4, 5, 6].map(
                    (x) => rolls.filter((r) => r === x).length,
                  ),
                );
                return (
                  <div
                    key={v}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        background: "#10b981",
                        borderRadius: "2px 2px 0 0",
                        height: `${Math.round((cnt / max) * 40)}px`,
                      }}
                    />
                    <p style={{ margin: 0, color: "#64748b", fontSize: 9 }}>
                      {v}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {question && !ansResult && (
          <div
            style={{
              background: "#1e293b",
              borderRadius: 12,
              padding: "14px",
              border: "1.5px solid #f59e0b",
            }}
          >
            <p
              style={{
                margin: "0 0 3px",
                color: "#f59e0b",
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              🎓 PROFESSOR NOVA'S QUESTION
            </p>
            <p
              style={{
                margin: "0 0 8px",
                color: "#e2e8f0",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              {question.q}
            </p>
            <p style={{ margin: "0 0 8px", color: "#64748b", fontSize: 11 }}>
              Data: [{question.vals.join(", ")}]
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
                placeholder="Your answer..."
                style={{
                  flex: 1,
                  background: "#0f172a",
                  color: "#f8fafc",
                  border: "1.5px solid #334155",
                  borderRadius: 8,
                  padding: "9px 12px",
                  fontSize: 13,
                }}
              />
              <button
                onClick={checkAnswer}
                disabled={!answer}
                style={{
                  background: answer ? "#f59e0b" : "#1e293b",
                  color: answer ? "#000" : "#475569",
                  border: "none",
                  borderRadius: 8,
                  padding: "9px 16px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: answer ? "pointer" : "default",
                }}
              >
                Check
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LinearAlgebraPractice({ onBack, onScore }) {
  const [mode, setMode] = useState("add");
  const [vecA, setVecA] = useState([2, 3]);
  const [vecB, setVecB] = useState([1, -1]);
  const [mat, setMat] = useState([
    [2, 0],
    [0, 3],
  ]);
  const [ans, setAns] = useState(["", ""]);
  const [dotAns, setDotAns] = useState("");
  const [result, setResult] = useState(null);
  const [pts, setPts] = useState(0);
  const [interrupt, setInterrupt] = useState(null);
  useEffect(() => {
    setAns(["", ""]);
    setDotAns("");
    setResult(null);
    setInterrupt(null);
  }, [mode]);
  const newProb = () => {
    setVecA([
      Math.floor(Math.random() * 5) + 1,
      Math.floor(Math.random() * 5) + 1,
    ]);
    setVecB([
      Math.floor(Math.random() * 5) - 2,
      Math.floor(Math.random() * 5) - 2,
    ]);
    setMat([
      [Math.floor(Math.random() * 3) + 1, Math.floor(Math.random() * 2)],
      [Math.floor(Math.random() * 2), Math.floor(Math.random() * 3) + 1],
    ]);
    setAns(["", ""]);
    setDotAns("");
    setResult(null);
    setInterrupt(null);
  };
  const check = () => {
    let correct,
      correctAns = [],
      breakdown = [],
      formula = "",
      explanation = "";
    if (mode === "add") {
      correctAns = [vecA[0] + vecB[0], vecA[1] + vecB[1]];
      correct =
        parseInt(ans[0]) === correctAns[0] &&
        parseInt(ans[1]) === correctAns[1];
      breakdown = [
        `[${vecA[0]},${vecA[1]}] + [${vecB[0]},${vecB[1]}]`,
        `= [${vecA[0]}+${vecB[0]}, ${vecA[1]}+${vecB[1]}]`,
        `= [${correctAns[0]}, ${correctAns[1]}]`,
      ];
      formula = "[a,b]+[c,d]=[a+c,b+d]";
      explanation = correct
        ? "Vector addition: add component by component. Simple but foundational to all of linear algebra!"
        : "Vector addition just means adding matching components: first+first, second+second. No cross-multiplication!";
    } else if (mode === "matrix") {
      correctAns = [
        mat[0][0] * vecA[0] + mat[0][1] * vecA[1],
        mat[1][0] * vecA[0] + mat[1][1] * vecA[1],
      ];
      correct =
        parseInt(ans[0]) === correctAns[0] &&
        parseInt(ans[1]) === correctAns[1];
      breakdown = [
        `Row 1: ${mat[0][0]}×${vecA[0]} + ${mat[0][1]}×${vecA[1]} = ${mat[0][0] * vecA[0] + mat[0][1] * vecA[1]}`,
        `Row 2: ${mat[1][0]}×${vecA[0]} + ${mat[1][1]}×${vecA[1]} = ${mat[1][0] * vecA[0] + mat[1][1] * vecA[1]}`,
        `Result vector: [${correctAns[0]}, ${correctAns[1]}]`,
      ];
      formula = "Each row of matrix · vector = one component of result";
      explanation = correct
        ? "Matrix-vector multiplication: each row of the matrix takes a dot product with the vector. This is how transformations work in graphics and ML!"
        : "For matrix-vector multiplication: take each ROW of the matrix, multiply term by term with the vector, and sum up.";
    } else {
      const dot = vecA[0] * vecB[0] + vecA[1] * vecB[1];
      correct = parseInt(dotAns) === dot;
      correctAns = [dot];
      breakdown = [
        `[${vecA[0]},${vecA[1]}] · [${vecB[0]},${vecB[1]}]`,
        `= ${vecA[0]}×${vecB[0]} + ${vecA[1]}×${vecB[1]}`,
        `= ${vecA[0] * vecB[0]} + ${vecA[1] * vecB[1]} = ${dot}`,
      ];
      formula = "[a,b]·[c,d] = ac+bd  (scalar result!)";
      explanation = correct
        ? `Dot product = ${dot}. This scalar measures how much the two vectors point in the same direction. If it were 0, they'd be perpendicular!`
        : `Dot product: multiply matching pairs and ADD them all together. The result is a single number (scalar), not a vector!`;
    }
    if (correct) setPts((p) => p + 15);
    setResult(correct ? "correct" : "wrong");
    setInterrupt({
      correct,
      prediction: { label: mode === "dot" ? dotAns : ans.join(",") },
      dice: null,
      profText: explanation,
      mathBreakdown: breakdown,
      formula,
    });
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        padding: "1.5rem",
        fontFamily: "system-ui,sans-serif",
      }}
    >
      <ProfessorModal
        interrupt={interrupt}
        onDismiss={() => setInterrupt(null)}
      />
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <button
            onClick={() => onScore(pts)}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: 20,
              padding: 0,
            }}
          >
            ←
          </button>
          <h2 style={{ margin: 0, color: "#f8fafc", fontSize: 18, flex: 1 }}>
            Linear Algebra Practice
          </h2>
          <div
            style={{
              background: "#1e293b",
              borderRadius: 8,
              padding: "5px 12px",
            }}
          >
            <span style={{ color: "#fbbf24", fontWeight: 700 }}>{pts} XP</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          {[
            ["add", "Vector Addition"],
            ["matrix", "Matrix × Vector"],
            ["dot", "Dot Product"],
          ].map(([m, l]) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setResult(null);
                setAns(["", ""]);
                setDotAns("");
              }}
              style={{
                flex: 1,
                padding: "8px 4px",
                borderRadius: 8,
                border: `1.5px solid ${mode === m ? "#f97316" : "#334155"}`,
                background: mode === m ? "#1c1002" : "#1e293b",
                color: mode === m ? "#fb923c" : "#64748b",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <div
          style={{
            background: "#1e293b",
            borderRadius: 14,
            padding: "16px",
            border: "1px solid #334155",
            marginBottom: 10,
          }}
        >
          {mode === "add" && (
            <>
              <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 12px" }}>
                Add the two vectors — component by component:
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    background: "#0f172a",
                    borderRadius: 8,
                    padding: "9px 12px",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "#a5b4fc",
                      fontFamily: "monospace",
                      fontSize: 13,
                    }}
                  >
                    [{vecA[0]}, {vecA[1]}]
                  </p>
                </div>
                <span style={{ color: "#64748b", fontSize: 18 }}>+</span>
                <div
                  style={{
                    background: "#0f172a",
                    borderRadius: 8,
                    padding: "9px 12px",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "#f9a8d4",
                      fontFamily: "monospace",
                      fontSize: 13,
                    }}
                  >
                    [{vecB[0]}, {vecB[1]}]
                  </p>
                </div>
                <span style={{ color: "#64748b", fontSize: 18 }}>=</span>
                <input
                  value={ans[0]}
                  onChange={(e) => setAns([e.target.value, ans[1]])}
                  placeholder="?"
                  style={{
                    width: 46,
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "1.5px solid #334155",
                    borderRadius: 8,
                    padding: "8px",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                />
                <input
                  value={ans[1]}
                  onChange={(e) => setAns([ans[0], e.target.value])}
                  placeholder="?"
                  style={{
                    width: 46,
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "1.5px solid #334155",
                    borderRadius: 8,
                    padding: "8px",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                />
              </div>
            </>
          )}
          {mode === "matrix" && (
            <>
              <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 12px" }}>
                Multiply the 2×2 matrix by the vector:
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    background: "#0f172a",
                    borderRadius: 8,
                    padding: "9px 12px",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "#fb923c",
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  >
                    [{mat[0][0]} {mat[0][1]}]
                  </p>
                  <p
                    style={{
                      margin: 0,
                      color: "#fb923c",
                      fontFamily: "monospace",
                      fontSize: 12,
                    }}
                  >
                    [{mat[1][0]} {mat[1][1]}]
                  </p>
                </div>
                <span style={{ color: "#64748b", fontSize: 18 }}>×</span>
                <div
                  style={{
                    background: "#0f172a",
                    borderRadius: 8,
                    padding: "9px 12px",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "#a5b4fc",
                      fontFamily: "monospace",
                      fontSize: 13,
                    }}
                  >
                    [{vecA[0]},{vecA[1]}]
                  </p>
                </div>
                <span style={{ color: "#64748b", fontSize: 18 }}>=</span>
                <input
                  value={ans[0]}
                  onChange={(e) => setAns([e.target.value, ans[1]])}
                  placeholder="?"
                  style={{
                    width: 46,
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "1.5px solid #334155",
                    borderRadius: 8,
                    padding: "8px",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                />
                <input
                  value={ans[1]}
                  onChange={(e) => setAns([ans[0], e.target.value])}
                  placeholder="?"
                  style={{
                    width: 46,
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "1.5px solid #334155",
                    borderRadius: 8,
                    padding: "8px",
                    fontSize: 14,
                    textAlign: "center",
                  }}
                />
              </div>
            </>
          )}
          {mode === "dot" && (
            <>
              <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 12px" }}>
                Compute the dot product (multiply pairs, sum everything):
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    background: "#0f172a",
                    borderRadius: 8,
                    padding: "9px 12px",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "#a5b4fc",
                      fontFamily: "monospace",
                      fontSize: 13,
                    }}
                  >
                    [{vecA[0]}, {vecA[1]}]
                  </p>
                </div>
                <span style={{ color: "#64748b", fontSize: 18 }}>·</span>
                <div
                  style={{
                    background: "#0f172a",
                    borderRadius: 8,
                    padding: "9px 12px",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: "#f9a8d4",
                      fontFamily: "monospace",
                      fontSize: 13,
                    }}
                  >
                    [{vecB[0]}, {vecB[1]}]
                  </p>
                </div>
                <span style={{ color: "#64748b", fontSize: 18 }}>=</span>
                <input
                  value={dotAns}
                  onChange={(e) => setDotAns(e.target.value)}
                  placeholder="?"
                  style={{
                    width: 56,
                    background: "#0f172a",
                    color: "#f8fafc",
                    border: "1.5px solid #334155",
                    borderRadius: 8,
                    padding: "8px",
                    fontSize: 16,
                    textAlign: "center",
                  }}
                />
              </div>
            </>
          )}
          <svg
            width="130"
            height="120"
            style={{
              marginTop: 12,
              background: "#0f172a",
              borderRadius: 8,
              display: "block",
            }}
            viewBox="-1 -5 9 9"
          >
            <defs>
              <marker
                id="va2"
                markerWidth="5"
                markerHeight="5"
                refX="2.5"
                refY="2.5"
                orient="auto"
              >
                <path d="M0,0 L5,2.5 L0,5 Z" fill="#a5b4fc" />
              </marker>
              <marker
                id="vb2"
                markerWidth="5"
                markerHeight="5"
                refX="2.5"
                refY="2.5"
                orient="auto"
              >
                <path d="M0,0 L5,2.5 L0,5 Z" fill="#f9a8d4" />
              </marker>
              <marker
                id="vr2"
                markerWidth="5"
                markerHeight="5"
                refX="2.5"
                refY="2.5"
                orient="auto"
              >
                <path d="M0,0 L5,2.5 L0,5 Z" fill="#4ade80" />
              </marker>
            </defs>
            {[-1, 0, 1, 2, 3, 4, 5, 6, 7].map((x) => (
              <line
                key={x}
                x1={x}
                y1={-5}
                x2={x}
                y2={4}
                stroke="#1e293b"
                strokeWidth="0.15"
              />
            ))}
            {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4].map((y) => (
              <line
                key={y}
                x1={-1}
                y1={y}
                x2={8}
                y2={y}
                stroke="#1e293b"
                strokeWidth="0.15"
              />
            ))}
            <line
              x1={-1}
              y1={0}
              x2={8}
              y2={0}
              stroke="#334155"
              strokeWidth="0.2"
            />
            <line
              x1={0}
              y1={-5}
              x2={0}
              y2={4}
              stroke="#334155"
              strokeWidth="0.2"
            />
            {vecA[0] !== 0 && (
              <line
                x1={0.05}
                y1={-0.05}
                x2={Math.max(0.2, vecA[0] - 0.35)}
                y2={Math.min(3.5, -vecA[1] + 0.18)}
                stroke="#a5b4fc"
                strokeWidth="0.3"
                markerEnd="url(#va2)"
              />
            )}
            {mode === "add" && (
              <line
                x1={vecA[0] + 0.05}
                y1={-vecA[1] - 0.05}
                x2={vecA[0] + vecB[0] - 0.35}
                y2={-vecA[1] - vecB[1] + 0.18}
                stroke="#f9a8d4"
                strokeWidth="0.3"
                markerEnd="url(#vb2)"
              />
            )}
            {result === "correct" && mode === "add" && (
              <line
                x1={0.05}
                y1={-0.05}
                x2={vecA[0] + vecB[0] - 0.35}
                y2={-(vecA[1] + vecB[1]) + 0.18}
                stroke="#4ade80"
                strokeWidth="0.25"
                strokeDasharray="0.4"
                markerEnd="url(#vr2)"
              />
            )}
          </svg>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={check}
            disabled={
              !!result || (mode === "dot" ? !dotAns : !ans[0] || !ans[1])
            }
            style={{
              flex: 1,
              background:
                result || (mode === "dot" ? !dotAns : !ans[0] || !ans[1])
                  ? "#1e293b"
                  : "#f97316",
              color:
                result || (mode === "dot" ? !dotAns : !ans[0] || !ans[1])
                  ? "#475569"
                  : "#fff",
              border: "none",
              borderRadius: 8,
              padding: "11px",
              fontSize: 14,
              fontWeight: 600,
              cursor: result ? "default" : "pointer",
            }}
          >
            Check Answer
          </button>
          <button
            onClick={newProb}
            style={{
              background: "transparent",
              color: "#94a3b8",
              border: "1.5px solid #334155",
              borderRadius: 8,
              padding: "11px 14px",
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            New Problem
          </button>
        </div>
      </div>
    </div>
  );
}

export default function STEMQuest() {
  const [screen, setScreen] = useState("home");
  const [topicId, setTopicId] = useState(null);
  const [lessonIdx, setLessonIdx] = useState(0);
  const [scores, setScores] = useState({});
  const addScore = (tid, pts) =>
    setScores((s) => ({ ...s, [tid]: (s[tid] || 0) + pts }));
  const handleLessonComplete = () => {
    const lessons = LESSONS[topicId];
    addScore(topicId, 20);
    if (lessonIdx < lessons.length - 1) {
      setLessonIdx((i) => i + 1);
    } else {
      setScreen("practice");
    }
  };
  const handleTopicSelect = (tid) => {
    setTopicId(tid);
    setLessonIdx(0);
    setScreen("lesson");
  };
  const handlePracticeScore = (pts) => {
    if (pts > 0) addScore(topicId, pts);
    setScreen("topics");
  };
  const renderPractice = () => {
    if (
      ["probability", "counting", "expected_value", "bayes"].includes(topicId)
    )
      return (
        <DicePractice
          onBack={() => setScreen("topics")}
          onScore={handlePracticeScore}
        />
      );
    if (["combinations", "permutations"].includes(topicId))
      return (
        <ComboPractice
          topicId={topicId}
          onBack={() => setScreen("topics")}
          onScore={handlePracticeScore}
        />
      );
    if (topicId === "statistics")
      return (
        <StatsPractice
          onBack={() => setScreen("topics")}
          onScore={handlePracticeScore}
        />
      );
    if (topicId === "linear_algebra")
      return (
        <LinearAlgebraPractice
          onBack={() => setScreen("topics")}
          onScore={handlePracticeScore}
        />
      );
    return null;
  };
  if (screen === "home")
    return <HomeScreen onStart={() => setScreen("topics")} scores={scores} />;
  if (screen === "topics")
    return <TopicSelectScreen onSelect={handleTopicSelect} scores={scores} />;
  if (screen === "lesson" && topicId)
    return (
      <LessonScreen
        key={`${topicId}-${lessonIdx}`}
        topicId={topicId}
        lessonIndex={lessonIdx}
        onComplete={handleLessonComplete}
        onBack={() => setScreen("topics")}
      />
    );
  if (screen === "practice" && topicId) return renderPractice();
  return null;
}
