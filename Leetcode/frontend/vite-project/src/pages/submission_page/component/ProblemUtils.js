// Shared editor settings and helper functions used by the problem page components.

// The value is what the React app stores; editorLanguage is what Monaco understands.
export const LANGUAGES = [
  { label: "C++", value: "cpp", editorLanguage: "cpp" },
  { label: "JavaScript", value: "javascript", editorLanguage: "javascript" },
  { label: "Python", value: "python", editorLanguage: "python" },
  { label: "Java", value: "java", editorLanguage: "java" },
];

// Normalize common aliases so "C++" and "cpp" match the same starter-code entry.
export function normalizeLanguage(language = "") {
  const value = String(language).toLowerCase();

  if (value === "c++" || value === "cpp") return "cpp";
  if (value === "js") return "javascript";
  if (value === "py") return "python";

  return value;
}

// Fallback templates are shown when a problem has no starter code for a language.
export function defaultStarterCode(language) {
  switch (normalizeLanguage(language)) {
    case "javascript":
      return `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar solution = function(nums, target) {\n    // Write your code here\n};`;

    case "python":
      return `class Solution:\n    def solution(self, nums, target):\n        # Write your code here\n        pass`;

    case "java":
      return `class Solution {\n    public int[] solution(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}`;

    default:
      return `class Solution {\npublic:\n    vector<int> solution(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};`;
  }
}

// Prefer the starter code saved with the problem; use a fallback if none matches.
export function getStarterCode(problem, language) {
  const starters = problem?.start_code ?? problem?.startCode ?? [];

  if (Array.isArray(starters)) {
    const matchingStarter = starters.find(
      (item) => normalizeLanguage(item?.language) === normalizeLanguage(language)
    );

    if (matchingStarter?.code) return matchingStarter.code;

    // If no language-specific entry exists, use the first saved snippet when possible.
    if (starters[0]?.code) return starters[0].code;
  }

  return defaultStarterCode(language);
}

// Your schema uses visible_testcases; the second name supports camelCase API data too.
export function getVisibleTestCases(problem) {
  const cases = problem?.visible_testcases ?? problem?.visibleTestCases ?? [];
  return Array.isArray(cases) ? cases : [];
}
