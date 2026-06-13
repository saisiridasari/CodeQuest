import User from '../models/User.js';
import Submission from '../models/Submission.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -refreshToken -resetPasswordToken -resetPasswordExpire')
      .populate('achievements.achievementId');
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const allowed = ['username', 'bio', 'location', 'github', 'linkedin', 'website', 'avatar', 'preferences'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
      .select('-password -refreshToken');
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('username avatar bio location github linkedin website xp level streak longestStreak problemsSolved totalSubmissions acceptedSubmissions contestsParticipated bestContestRank achievements createdAt')
      .populate('achievements.achievementId');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const [recentSubmissions, stats] = await Promise.all([
      Submission.find({ user: userId }).populate('problem', 'title slug difficulty').sort({ createdAt: -1 }).limit(10),
      Submission.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
            accepted: { $sum: { $cond: [{ $eq: ['$verdict', 'Accepted'] }, 1, 0] } },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]),
    ]);
    const totalSolved = req.user.problemsSolved.easy + req.user.problemsSolved.medium + req.user.problemsSolved.hard;
    const solvedObj = req.user.problemsSolved.toObject ? req.user.problemsSolved.toObject() : req.user.problemsSolved;
    res.json({
      success: true,
      data: {
        user: { xp: req.user.xp, level: req.user.level, streak: req.user.streak, longestStreak: req.user.longestStreak },
        problemsSolved: { ...solvedObj, total: totalSolved },
        submissions: { total: req.user.totalSubmissions, accepted: req.user.acceptedSubmissions },
        recentSubmissions,
        activityData: stats,
        achievementCount: req.user.achievements.length,
        contestsParticipated: req.user.contestsParticipated,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
