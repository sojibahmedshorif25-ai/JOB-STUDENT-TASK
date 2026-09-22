"use client";

import * as React from "react";
import { CheckCircle2, Play, RefreshCw, Terminal, XCircle, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Challenge {
  id: string;
  title: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  initialCode: string;
  testFunction: string; // name of function to test
  tests: Array<{ input: any[]; expected: any; description: string }>;
}

const CHALLENGES: Challenge[] = [
  {
    id: "two-sum",
    title: "1. Two Sum Target Index",
    category: "Algorithms",
    difficulty: "Easy",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    initialCode: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    testFunction: "twoSum",
    tests: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1], description: "nums = [2,7,11,15], target = 9" },
      { input: [[3, 2, 4], 6], expected: [1, 2], description: "nums = [3,2,4], target = 6" },
      { input: [[3, 3], 6], expected: [0, 1], description: "nums = [3,3], target = 6" },
    ],
  },
  {
    id: "debounce",
    title: "2. Implement Debounce Function",
    category: "JavaScript & Async",
    difficulty: "Medium",
    description: "Create a debounce utility function that delays invoking func until after wait milliseconds have elapsed since the last time it was invoked.",
    initialCode: `function debounce(fn, delay) {
  let timerId = null;
  return function(...args) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}`,
    testFunction: "debounce",
    tests: [
      { input: [() => "called", 100], expected: "function", description: "returns a callable wrapped function" },
    ],
  },
  {
    id: "valid-parentheses",
    title: "3. Valid Parentheses Stack",
    category: "Data Structures",
    difficulty: "Easy",
    description: "Given a string s containing '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
    initialCode: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char in map) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
    testFunction: "isValid",
    tests: [
      { input: ["()"], expected: true, description: "s = '()'" },
      { input: ["()[]{}"], expected: true, description: "s = '()[]{}'" },
      { input: ["(]"], expected: false, description: "s = '(]'" },
      { input: ["([)]"], expected: false, description: "s = '([)]'" },
    ],
  },
];

export function CodePlayground() {
  const [activeChallengeIndex, setActiveChallengeIndex] = React.useState(0);
  const challenge = CHALLENGES[activeChallengeIndex];
  const [code, setCode] = React.useState(challenge.initialCode);
  const [output, setOutput] = React.useState<string[]>([]);
  const [testResults, setTestResults] = React.useState<Array<{ passed: boolean; desc: string; err?: string }>>([]);
  const [running, setRunning] = React.useState(false);

  React.useEffect(() => {
    setCode(challenge.initialCode);
    setOutput([]);
    setTestResults([]);
  }, [challenge]);

  const handleRun = () => {
    setRunning(true);
    const logs: string[] = [];
    const results: Array<{ passed: boolean; desc: string; err?: string }> = [];

    // Capture console.log
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" "));
      originalLog(...args);
    };

    try {
      // Evaluate user code safely in a sandbox function
      // eslint-disable-next-line no-new-func
      const fnScope = new Function(`
        ${code}
        return typeof ${challenge.testFunction} !== 'undefined' ? ${challenge.testFunction} : null;
      `);

      const userFn = fnScope();

      if (!userFn) {
        throw new Error(`Function ${challenge.testFunction} was not found or defined in scope.`);
      }

      for (const t of challenge.tests) {
        try {
          const res = userFn(...t.input);
          let passed = false;

          if (t.expected === "function") {
            passed = typeof res === "function";
          } else if (Array.isArray(t.expected)) {
            passed = JSON.stringify(res) === JSON.stringify(t.expected);
          } else {
            passed = res === t.expected;
          }

          results.push({
            passed,
            desc: t.description,
            err: passed ? undefined : `Expected ${JSON.stringify(t.expected)}, received ${JSON.stringify(res)}`,
          });
        } catch (err: any) {
          results.push({
            passed: false,
            desc: t.description,
            err: err.message || "Runtime error",
          });
        }
      }

      setOutput(logs.length > 0 ? logs : ["Code executed successfully."]);
      setTestResults(results);
    } catch (err: any) {
      setOutput([`Syntax / Execution Error: ${err.message}`]);
      setTestResults([{ passed: false, desc: "Execution Failed", err: err.message }]);
    } finally {
      console.log = originalLog;
      setRunning(false);
    }
  };

  const allPassed = testResults.length > 0 && testResults.every((r) => r.passed);

  return (
    <Card className="border shadow-sm overflow-hidden">
      <div className="flex flex-col border-b bg-card p-4 sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Code2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Interactive Coding Sandbox</h3>
            <p className="text-xs text-muted-foreground">Solve live technical coding challenges in browser</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={activeChallengeIndex}
            onChange={(e) => setActiveChallengeIndex(Number(e.target.value))}
            className="h-8 rounded-md border bg-background px-2.5 text-xs font-medium"
          >
            {CHALLENGES.map((c, idx) => (
              <option key={c.id} value={idx}>
                {c.title}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCode(challenge.initialCode);
              setOutput([]);
              setTestResults([]);
            }}
            className="h-8 text-xs"
          >
            <RefreshCw className="mr-1 h-3 w-3" /> Reset
          </Button>
          <Button size="sm" variant="gradient" onClick={handleRun} disabled={running} className="h-8 text-xs gap-1.5">
            <Play className="h-3.5 w-3.5" /> {running ? "Running..." : "Run & Test Code"}
          </Button>
        </div>
      </div>

      <CardContent className="p-0">
        <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x">
          {/* Editor pane */}
          <div className="flex flex-col h-[380px]">
            <div className="border-b bg-muted/40 px-4 py-2 text-xs flex items-center justify-between">
              <span className="font-semibold text-muted-foreground">JavaScript (ES6+)</span>
              <Badge variant="outline" className="text-[10px]">{challenge.difficulty}</Badge>
            </div>
            <div className="p-4 border-b bg-secondary/10 text-xs">
              <p className="font-semibold text-foreground mb-1">{challenge.title}</p>
              <p className="text-muted-foreground leading-relaxed">{challenge.description}</p>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full resize-none bg-slate-950 p-4 font-mono text-xs text-slate-100 focus:outline-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* Test & Console pane */}
          <div className="flex flex-col h-[380px] bg-card">
            <div className="border-b bg-muted/40 px-4 py-2 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold text-muted-foreground">
                <Terminal className="h-3.5 w-3.5" /> Test Runner & Output
              </span>
              {testResults.length > 0 && (
                <span className={`text-[11px] font-bold ${allPassed ? "text-emerald-500" : "text-amber-500"}`}>
                  {testResults.filter((r) => r.passed).length}/{testResults.length} Passed
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-mono">
              {/* Test Cases */}
              <div className="space-y-2">
                <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">Test Cases</p>
                {testResults.length === 0 ? (
                  <p className="text-muted-foreground italic text-xs font-sans">
                    Click &ldquo;Run & Test Code&rdquo; to execute the test suite.
                  </p>
                ) : (
                  testResults.map((r, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2 rounded-lg border p-2.5 ${
                        r.passed ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400" : "border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {r.passed ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold">{r.desc}</p>
                        {r.err && <p className="text-[11px] opacity-80 mt-0.5">{r.err}</p>}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Console Logs */}
              {output.length > 0 && (
                <div className="space-y-1 pt-2 border-t font-mono">
                  <p className="font-semibold text-foreground text-[11px] uppercase tracking-wider">Console Log</p>
                  <div className="rounded-lg bg-slate-950 p-3 text-slate-300 text-[11px] space-y-1">
                    {output.map((line, i) => (
                      <p key={i} className="leading-tight">&gt; {line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
