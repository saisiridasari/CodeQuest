import User from '../models/User.js';
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import Contest from '../models/Contest.js';
import Notification from '../models/Notification.js';

// ═══════════════════════════════════════════════
//  DASHBOARD STATS
// ═══════════════════════════════════════════════
export const getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

    const [
      totalUsers, totalProblems, totalSubmissions, totalContests,
      activeUsersWeek, submissionsToday, acceptedSubmissions,
      recentUsers, languageStats, difficultyBreakdown
    ] = await Promise.all([
      User.countDocuments(),
      Problem.countDocuments({ isActive: true }),
      Submission.countDocuments(),
      Contest.countDocuments({ isActive: true }),
      User.countDocuments({ lastActiveDate: { $gte: sevenDaysAgo } }),
      Submission.countDocuments({ createdAt: { $gte: oneDayAgo } }),
      Submission.countDocuments({ verdict: 'Accepted' }),
      User.find().select('username email createdAt isVerified role xp level').sort({ createdAt: -1 }).limit(10),
      Submission.aggregate([{ $group: { _id: '$language', count: { $sum: 1 } } }, { $sort: { count: -1 } }]),
      Problem.aggregate([{ $match: { isActive: true } }, { $group: { _id: '$difficulty', count: { $sum: 1 } } }]),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProblems,
        totalSubmissions,
        totalContests,
        activeUsersWeek,
        submissionsToday,
        avgAcceptanceRate: totalSubmissions ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(1) : '0',
        recentUsers,
        languageStats,
        difficultyBreakdown,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════
//  USER MANAGEMENT
// ═══════════════════════════════════════════════
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};
    if (search) filter.$or = [{ username: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }];
    if (role) filter.role = role;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: users,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -refreshToken')
      .populate('achievements.achievementId');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const submissions = await Submission.find({ user: req.params.id })
      .populate('problem', 'title slug difficulty')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, data: { user, submissions } });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const allowed = ['role', 'isVerified', 'xp', 'level'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password -refreshToken');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot delete admin users' });
    await Promise.all([
      User.findByIdAndDelete(req.params.id),
      Submission.deleteMany({ user: req.params.id }),
      Notification.deleteMany({ user: req.params.id }),
    ]);
    res.json({ success: true, message: 'User and related data deleted' });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════
//  PROBLEM MANAGEMENT
// ═══════════════════════════════════════════════
export const getAllProblems = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, difficulty } = req.query;
    const filter = {};
    if (search) filter.$or = [{ title: new RegExp(search, 'i') }, { tags: new RegExp(search, 'i') }];
    if (difficulty) filter.difficulty = difficulty;
    const skip = (page - 1) * limit;
    const [problems, total] = await Promise.all([
      Problem.find(filter).sort({ order: 1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Problem.countDocuments(filter),
    ]);
    res.json({
      success: true,
      data: problems,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const createProblem = async (req, res, next) => {
  try {
    const slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const existing = await Problem.findOne({ slug });
    if (existing) return res.status(400).json({ success: false, message: 'A problem with this title already exists' });
    const problem = await Problem.create({ ...req.body, slug, createdBy: req.user._id });
    res.status(201).json({ success: true, data: problem });
  } catch (error) {
    next(error);
  }
};

export const updateProblem = async (req, res, next) => {
  try {
    if (req.body.title) {
      req.body.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    res.json({ success: true, data: problem });
  } catch (error) {
    next(error);
  }
};

export const deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found' });
    problem.isActive = false;
    await problem.save();
    res.json({ success: true, message: 'Problem deleted' });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════
//  CONTEST MANAGEMENT
// ═══════════════════════════════════════════════
export const getAllContests = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [contests, total] = await Promise.all([
      Contest.find(filter)
        .populate('problems', 'title slug difficulty')
        .sort({ startTime: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Contest.countDocuments(filter),
    ]);
    const data = contests.map((c) => ({
      ...c.toJSON(),
      participantCount: c.participants?.length || 0,
      participants: undefined,
    }));
    res.json({
      success: true,
      data,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

export const createContest = async (req, res, next) => {
  try {
    const slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const contest = await Contest.create({ ...req.body, slug, createdBy: req.user._id });
    res.status(201).json({ success: true, data: contest });
  } catch (error) {
    next(error);
  }
};

export const updateContest = async (req, res, next) => {
  try {
    if (req.body.title) {
      req.body.slug = req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('problems', 'title slug difficulty');
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    res.json({ success: true, data: contest });
  } catch (error) {
    next(error);
  }
};

export const deleteContest = async (req, res, next) => {
  try {
    const contest = await Contest.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    res.json({ success: true, message: 'Contest deleted' });
  } catch (error) {
    next(error);
  }
};

// ═══════════════════════════════════════════════
//  ANALYTICS
// ═══════════════════════════════════════════════
export const getAnalytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [dailySubmissions, topSolvers, recentSubmissions] = await Promise.all([
      Submission.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: 1 },
            accepted: { $sum: { $cond: [{ $eq: ['$verdict', 'Accepted'] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      User.find({ isVerified: true }).select('username xp level problemsSolved').sort({ xp: -1 }).limit(10),
      Submission.find().populate('user', 'username').populate('problem', 'title').sort({ createdAt: -1 }).limit(20),
    ]);
    res.json({ success: true, data: { dailySubmissions, topSolvers, recentSubmissions } });
  } catch (error) {
    next(error);
  }
};
