import Achievement from '../models/Achievement.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

export const getAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({ isActive: true }).sort({ category: 1, tier: 1 });
    let data = achievements;
    if (req.user) {
      const unlockedIds = new Set(req.user.achievements.map((a) => a.achievementId.toString()));
      data = achievements.map((a) => ({ ...a.toJSON(), unlocked: unlockedIds.has(a._id.toString()) }));
    }
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const checkAndAwardAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;
    const achievements = await Achievement.find({ isActive: true });
    const unlockedIds = new Set(user.achievements.map((a) => a.achievementId.toString()));

    for (const achievement of achievements) {
      if (unlockedIds.has(achievement._id.toString())) continue;
      let earned = false;
      const totalSolved = user.problemsSolved.easy + user.problemsSolved.medium + user.problemsSolved.hard;
      switch (achievement.requirement.type) {
        case 'problems_solved': earned = totalSolved >= achievement.requirement.value; break;
        case 'easy_solved': earned = user.problemsSolved.easy >= achievement.requirement.value; break;
        case 'medium_solved': earned = user.problemsSolved.medium >= achievement.requirement.value; break;
        case 'hard_solved': earned = user.problemsSolved.hard >= achievement.requirement.value; break;
        case 'streak': earned = user.streak >= achievement.requirement.value; break;
        case 'contests': earned = user.contestsParticipated >= achievement.requirement.value; break;
        case 'xp': earned = user.xp >= achievement.requirement.value; break;
        case 'submissions': earned = user.totalSubmissions >= achievement.requirement.value; break;
      }
      if (earned) {
        user.achievements.push({ achievementId: achievement._id });
        user.xp += achievement.xpReward;
        user.calculateLevel();
        await Notification.create({
          user: userId,
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: `You earned "${achievement.name}" — ${achievement.description}`,
          icon: achievement.icon,
          link: '/achievements',
        });
      }
    }
    await user.save();
  } catch (error) {
    console.error('Achievement check error:', error.message);
  }
};

export const getUserAchievements = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId || req.user._id).populate('achievements.achievementId');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user.achievements });
  } catch (error) {
    next(error);
  }
};
