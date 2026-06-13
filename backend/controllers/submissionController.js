import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import User from '../models/User.js';
import { evaluateCode, runCodeWithAI } from '../services/aiService.js';
import { checkAndAwardAchievements } from './achievementController.js';

// ── Submit solution (full evaluation) ────────────────────────
export const submitSolution = async (req, res, next) => {
  try {
    const { problemId, code, language, contestId } = req.body;
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });

    // Evaluate via Gemini
    const evaluation = await evaluateCode({
      code,
      language,
      problemTitle: problem.title,
      problemDescription: problem.description,
      testCases: problem.testCases,
      examples: problem.examples,
    });

    const verdict = evaluation.status === 'Accepted' ? 'Accepted' : evaluation.status || 'Wrong Answer';
    const testResults = evaluation.testResults || [];
    const passed = testResults.filter((r) => r.passed).length;

    const submission = await Submission.create({
      user: req.user._id,
      problem: problemId,
      contest: contestId || null,
      code,
      language,
      verdict,
      testCasesPassed: passed,
      totalTestCases: problem.testCases.length,
      score: evaluation.score || 0,
      timeComplexity: evaluation.timeComplexity || '',
      spaceComplexity: evaluation.spaceComplexity || '',
      explanation: evaluation.explanation || '',
      suggestions: evaluation.suggestions || '',
      testResults: testResults.map((r) => ({
        input: r.input || '',
        expectedOutput: r.expectedOutput || '',
        actualOutput: r.actualOutput || '',
        passed: !!r.passed,
      })),
    });

    // Update problem stats
    problem.totalSubmissions += 1;
    if (verdict === 'Accepted') problem.acceptedSubmissions += 1;
    await problem.save();

    // Update user stats
    const user = await User.findById(req.user._id);
    user.totalSubmissions += 1;
    if (verdict === 'Accepted') {
      user.acceptedSubmissions += 1;
      if (!user.solvedProblems.includes(problemId)) {
        user.solvedProblems.push(problemId);
        const diffKey = problem.difficulty.toLowerCase();
        if (user.problemsSolved[diffKey] !== undefined) user.problemsSolved[diffKey] += 1;
        user.xp += problem.xpReward;
        user.calculateLevel();
      }
    }
    await user.save();

    // Check achievements
    try { await checkAndAwardAchievements(req.user._id); } catch { /* non-fatal */ }

    res.json({
      success: true,
      data: {
        submission: submission.toJSON(),
        analysis: {
          verdict,
          testResults,
          explanation: evaluation.explanation,
          timeComplexity: evaluation.timeComplexity,
          spaceComplexity: evaluation.spaceComplexity,
          suggestions: evaluation.suggestions,
          score: evaluation.score,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Run code (quick check, no save) ──────────────────────────
export const runCode = async (req, res, next) => {
  try {
    const { code, language, input, problemId } = req.body;
    if (!code?.trim()) return res.status(400).json({ success: false, message: 'Code is required' });

    let expectedOutput = '';
    let problemTitle = '';
    let problemDescription = '';

    if (problemId) {
      const problem = await Problem.findById(problemId);
      if (problem) {
        problemTitle = problem.title;
        problemDescription = problem.description;
        const matchingTC = problem.testCases.find((tc) => tc.input === input);
        if (matchingTC) expectedOutput = matchingTC.expectedOutput;
        if (!expectedOutput && problem.examples?.length > 0) {
          const matchingEx = problem.examples.find((ex) => ex.input === input);
          if (matchingEx) expectedOutput = matchingEx.output;
        }
      }
    }

    const result = await runCodeWithAI({ code, language, input: input || '', expectedOutput });

    res.json({
      success: true,
      data: {
        output: result.output || '',
        error: result.error || '',
        status: result.status || 'Unknown',
        timeComplexity: result.timeComplexity || '',
        spaceComplexity: result.spaceComplexity || '',
        explanation: result.explanation || '',
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get user submissions ─────────────────────────────────────
export const getSubmissions = async (req, res, next) => {
  try {
    const { problemId, page = 1, limit = 20 } = req.query;
    const filter = { user: req.user._id };
    if (problemId) filter.problem = problemId;
    const skip = (page - 1) * limit;
    const [submissions, total] = await Promise.all([
      Submission.find(filter)
        .populate('problem', 'title slug difficulty')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Submission.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: submissions,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

// ── Get single submission ────────────────────────────────────
export const getSubmission = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id).populate('problem', 'title slug difficulty');
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
    if (submission.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, data: submission });
  } catch (error) {
    next(error);
  }
};
