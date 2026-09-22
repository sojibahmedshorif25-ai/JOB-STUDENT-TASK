export interface InterviewFeedback {
  score: number; // 0 - 100
  accuracy: number;
  clarity: number;
  depth: number;
  strengths: string[];
  improvements: string[];
  suggestedKeywords: string[];
  matchedKeywords: string[];
  feedbackSummary: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  JavaScript: [
    "closure",
    "prototype",
    "event loop",
    "promise",
    "async/await",
    "hoisting",
    "scope",
    "es6",
    "immutability",
    "call stack",
    "microtask",
    "v8",
    "callback",
  ],
  React: [
    "virtual dom",
    "reconciliation",
    "hooks",
    "useeffect",
    "usestate",
    "usememo",
    "usecallback",
    "props",
    "state management",
    "lifecycle",
    "context api",
    "component",
    "fiber",
    "render",
  ],
  "Next.js": [
    "server side rendering",
    "ssr",
    "static site generation",
    "ssg",
    "incremental static regeneration",
    "isr",
    "app router",
    "server components",
    "hydration",
    "api routes",
    "seo",
    "middleware",
    "turbopack",
  ],
  "Node.js": [
    "event driven",
    "non-blocking",
    "libuv",
    "stream",
    "buffer",
    "cluster",
    "middleware",
    "express",
    "rest api",
    "jwt",
    "worker threads",
    "scalability",
  ],
  MongoDB: [
    "nosql",
    "document",
    "aggregation pipeline",
    "indexing",
    "b-tree",
    "mongoose",
    "schema",
    "sharding",
    "replication",
    "transactions",
    "atomicity",
  ],
  Behavioral: [
    "star method",
    "situation",
    "task",
    "action",
    "result",
    "leadership",
    "communication",
    "collaboration",
    "conflict resolution",
    "impact",
    "metric",
    "deadline",
    "teamwork",
  ],
};

export function evaluateInterviewResponse(
  category: string,
  _question: string,
  userAnswer: string
): InterviewFeedback {
  const answer = userAnswer.trim();
  const wordCount = answer ? answer.split(/\s+/).length : 0;

  if (wordCount < 5) {
    return {
      score: 15,
      accuracy: 10,
      clarity: 20,
      depth: 10,
      strengths: ["Attempted to answer"],
      improvements: [
        "Answer is too short. Try to elaborate on technical details and provide concrete examples.",
        "Mention real-world use cases or projects where you applied this concept.",
      ],
      suggestedKeywords: CATEGORY_KEYWORDS[category] || ["architecture", "performance", "best practices"],
      matchedKeywords: [],
      feedbackSummary: "Your response is very brief. In real technical interviews, aim for 3-5 structured sentences minimum.",
    };
  }

  const categoryList = CATEGORY_KEYWORDS[category] || [
    "performance",
    "architecture",
    "scalability",
    "security",
    "best practices",
    "testing",
  ];

  const lowerAnswer = answer.toLowerCase();
  const matchedKeywords = categoryList.filter((kw) => lowerAnswer.includes(kw.toLowerCase()));
  const missingKeywords = categoryList.filter((kw) => !lowerAnswer.includes(kw.toLowerCase()));

  // Scoring weights:
  // 1. Length/Depth (0-35 pts)
  let depthScore = 0;
  if (wordCount >= 80) depthScore = 35;
  else if (wordCount >= 45) depthScore = 28;
  else if (wordCount >= 25) depthScore = 20;
  else depthScore = 12;

  // 2. Keyword density / Technical terminology (0-35 pts)
  const kwRatio = Math.min(matchedKeywords.length / 3, 1);
  const accuracyScore = Math.round(kwRatio * 35);

  // 3. Clarity & Structure (0-30 pts)
  let clarityScore = 15;
  if (answer.includes(".") && answer.split(".").length > 2) clarityScore += 8;
  if (/because|for example|such as|in order to|specifically|therefore/i.test(answer)) clarityScore += 7;
  clarityScore = Math.min(clarityScore, 30);

  const totalScore = Math.min(100, depthScore + accuracyScore + clarityScore);

  const strengths: string[] = [];
  if (depthScore >= 25) strengths.push("Strong depth and comprehensive explanation.");
  if (matchedKeywords.length >= 2) strengths.push(`Effectively integrated key industry terminology: ${matchedKeywords.slice(0, 3).join(", ")}.`);
  if (/for example|instance|project|used this/i.test(lowerAnswer)) strengths.push("Provided practical context / example.");
  if (clarityScore >= 25) strengths.push("Clear sentence structure and logical flow.");
  if (strengths.length === 0) strengths.push("Good baseline understanding demonstrated.");

  const improvements: string[] = [];
  if (matchedKeywords.length < 2 && missingKeywords.length > 0) {
    improvements.push(`Include more technical terms like: ${missingKeywords.slice(0, 3).join(", ")}.`);
  }
  if (!/for example|e\.g\.|in my project|production/i.test(lowerAnswer)) {
    improvements.push("Back up your answer with a concrete production example or project experience.");
  }
  if (wordCount < 40) {
    improvements.push("Expand on the 'why' (underlying mechanics or performance trade-offs), not just the 'what'.");
  }

  let summary = "";
  if (totalScore >= 85) summary = "Outstanding response! You demonstrated senior-level clarity, depth, and terminology.";
  else if (totalScore >= 70) summary = "Solid technical answer with good grasp of core concepts. Fine-tune with specific project examples.";
  else if (totalScore >= 50) summary = "Decent start. Expanding on architectural trade-offs and keyword precision will boost your score.";
  else summary = "Needs improvement. Review the topic documentation and practice answering in structured STAR format.";

  return {
    score: totalScore,
    accuracy: Math.round((accuracyScore / 35) * 100),
    clarity: Math.round((clarityScore / 30) * 100),
    depth: Math.round((depthScore / 35) * 100),
    strengths,
    improvements,
    suggestedKeywords: missingKeywords.slice(0, 4),
    matchedKeywords,
    feedbackSummary: summary,
  };
}
