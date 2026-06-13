import validator from 'validator';

export const validateRegister = (req, res, next) => {
  const { username, email, password } = req.body;
  const errors = [];
  if (!username || username.trim().length < 3) errors.push('Username must be at least 3 characters');
  if (!email || !validator.isEmail(email)) errors.push('Valid email is required');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') });
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  next();
};

export const validateProblem = (req, res, next) => {
  const { title, description, difficulty } = req.body;
  const errors = [];
  if (!title?.trim()) errors.push('Title is required');
  if (!description?.trim()) errors.push('Description is required');
  if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) errors.push('Valid difficulty is required');
  if (errors.length) return res.status(400).json({ success: false, message: errors.join(', ') });
  next();
};

export const validateSubmission = (req, res, next) => {
  const { code, language } = req.body;
  if (!code?.trim()) return res.status(400).json({ success: false, message: 'Code is required' });
  if (!language?.trim()) return res.status(400).json({ success: false, message: 'Language is required' });
  next();
};
