import User from '../models/User.js';

export const getGlobalLeaderboard = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find({ isVerified: true })
        .select('username avatar xp level problemsSolved streak acceptedSubmissions contestsParticipated')
        .sort({ xp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments({ isVerified: true }),
    ]);
    const data = users.map((u, i) => ({
      rank: skip + i + 1,
      ...u.toJSON(),
      totalSolved: u.problemsSolved.easy + u.problemsSolved.medium + u.problemsSolved.hard,
    }));
    res.json({ success: true, data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

export const getWeeklyLeaderboard = async (req, res, next) => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const users = await User.find({ isVerified: true, lastActiveDate: { $gte: oneWeekAgo } })
      .select('username avatar xp level problemsSolved streak')
      .sort({ xp: -1 })
      .limit(50);
    const data = users.map((u, i) => ({
      rank: i + 1,
      ...u.toJSON(),
      totalSolved: u.problemsSolved.easy + u.problemsSolved.medium + u.problemsSolved.hard,
    }));
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getMyRank = async (req, res, next) => {
  try {
    const myXP = req.user.xp;
    const rank = await User.countDocuments({ isVerified: true, xp: { $gt: myXP } }) + 1;
    const total = await User.countDocuments({ isVerified: true });
    res.json({ success: true, data: { rank, total, percentile: (((total - rank) / total) * 100).toFixed(1) } });
  } catch (error) {
    next(error);
  }
};
