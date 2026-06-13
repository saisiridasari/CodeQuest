import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;

const getModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      'Gemini API key required. Set GEMINI_API_KEY in .env (free at aistudio.google.com/apikey).'
    );
  }
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
};

// ── Core: Evaluate user code via Gemini ─────────────────────
export const evaluateCode = async ({ code, language, problemTitle, problemDescription, testCases, examples }) => {
  const model = getModel();

  const visibleTests = testCases
    .filter((tc) => !tc.isHidden)
    .map((tc) => `Input: ${tc.input}\nExpected Output: ${tc.expectedOutput}`);

  const hiddenTests = testCases
    .filter((tc) => tc.isHidden)
    .map((tc) => `Input: ${tc.input}\nExpected Output: ${tc.expectedOutput}`);

  const allTests = testCases.map(
    (tc) => `Input: ${tc.input}\nExpected Output: ${tc.expectedOutput}`
  );

  const prompt = `You are a strict code evaluation engine. Evaluate the following code submission precisely.

PROBLEM: ${problemTitle}
DESCRIPTION: ${problemDescription}

LANGUAGE: ${language}

USER CODE:
\`\`\`${language}
${code}
\`\`\`

TEST CASES:
${allTests.join('\n\n')}

INSTRUCTIONS:
1. Mentally trace through the code for EVERY test case.
2. Determine if the code produces the exact expected output for each test case.
3. Check for edge cases, off-by-one errors, and runtime errors.
4. Analyze time and space complexity.

Respond ONLY with valid JSON (no markdown fences, no explanation outside JSON):
{
  "status": "Accepted" or "Wrong Answer" or "Runtime Error" or "Compilation Error",
  "testResults": [
    {
      "input": "the input",
      "expectedOutput": "expected",
      "actualOutput": "what the code would produce",
      "passed": true or false
    }
  ],
  "explanation": "Brief explanation of the evaluation",
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "suggestions": "Improvement suggestions or empty string if correct",
  "score": number from 0 to 100
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  // Strip markdown fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback if Gemini returns non-JSON
    return {
      status: 'Wrong Answer',
      testResults: [],
      explanation: text,
      timeComplexity: 'Unknown',
      spaceComplexity: 'Unknown',
      suggestions: '',
      score: 0,
    };
  }
};

// ── Run code (quick execution check) ────────────────────────
export const runCodeWithAI = async ({ code, language, input, expectedOutput }) => {
  const model = getModel();

  const prompt = `You are a code execution engine. Execute the following code mentally and determine the output.

LANGUAGE: ${language}
CODE:
\`\`\`${language}
${code}
\`\`\`
INPUT: ${input || '(none)'}
${expectedOutput ? `EXPECTED OUTPUT: ${expectedOutput}` : ''}

Respond ONLY with valid JSON (no markdown fences):
{
  "output": "the exact output the code would produce",
  "error": "error message if any, empty string if none",
  "status": "Success" or "Error",
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "explanation": "Brief trace of execution"
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      output: '',
      error: text,
      status: 'Error',
      timeComplexity: 'Unknown',
      spaceComplexity: 'Unknown',
      explanation: 'Failed to parse AI response',
    };
  }
};

// ── Hint ─────────────────────────────────────────────────────
export const getHint = async (problemTitle, problemDescription, difficulty) => {
  const model = getModel();
  const prompt = `You are a coding mentor. Give a helpful hint for this problem without revealing the solution. Suggest the right data structure or algorithm direction.\n\nProblem: ${problemTitle}\nDifficulty: ${difficulty}\nDescription: ${problemDescription}\n\nMax 150 words. Be encouraging.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// ── Explain Error ────────────────────────────────────────────
export const explainError = async (code, language, errorMessage) => {
  const model = getModel();
  const prompt = `You are a debugging assistant. Explain this error simply and suggest a fix. Do NOT write corrected code.\n\nLanguage: ${language}\nCode:\n\`\`\`\n${code}\n\`\`\`\nError: ${errorMessage}\n\nProvide: 1) What went wrong 2) Why 3) How to fix. Max 200 words.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// ── Explain Problem ──────────────────────────────────────────
export const explainProblem = async (problemTitle, problemDescription, examples) => {
  const model = getModel();
  const prompt = `You are a coding tutor. Explain this problem simply. Walk through examples step-by-step. Suggest an approach without giving solution code.\n\nProblem: ${problemTitle}\nDescription: ${problemDescription}\nExamples: ${JSON.stringify(examples)}\n\nMax 250 words.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};

// ── Optimize Code ────────────────────────────────────────────
export const optimizeCode = async (code, language, problemTitle) => {
  const model = getModel();
  const prompt = `You are a code optimization expert. Analyze and suggest improvements. Do NOT rewrite the solution.\n\nProblem: ${problemTitle}\nLanguage: ${language}\nCode:\n\`\`\`\n${code}\n\`\`\`\n\nProvide: 1) Current complexity 2) Optimization suggestions 3) Better approach hint. Max 200 words.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
};
