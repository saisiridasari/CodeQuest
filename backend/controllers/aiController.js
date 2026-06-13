import { getHint, explainError, explainProblem, optimizeCode } from '../services/aiService.js';
import Problem from '../models/Problem.js';

export const getAIHint = async (req, res, next) => {
  try {
    const { problemId } = req.body;
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    const hint = await getHint(problem.title, problem.description, problem.difficulty);
    res.json({ success: true, data: { hint } });
  } catch (error) {
    next(error);
  }
};

export const getAIErrorExplanation = async (req, res, next) => {
  try {
    const { code, language, errorMessage } = req.body;
    if (!code || !errorMessage) return res.status(400).json({ success: false, message: 'Code and error message are required' });
    const explanation = await explainError(code, language, errorMessage);
    res.json({ success: true, data: { explanation } });
  } catch (error) {
    next(error);
  }
};

export const getAIProblemExplanation = async (req, res, next) => {
  try {
    const { problemId } = req.body;
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    const explanation = await explainProblem(problem.title, problem.description, problem.examples);
    res.json({ success: true, data: { explanation } });
  } catch (error) {
    next(error);
  }
};

export const getAIOptimization = async (req, res, next) => {
  try {
    const { code, language, problemId } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Code is required' });
    const problem = await Problem.findById(problemId);
    const suggestions = await optimizeCode(code, language, problem?.title || 'Unknown');
    res.json({ success: true, data: { suggestions } });
  } catch (error) {
    next(error);
  }
};
