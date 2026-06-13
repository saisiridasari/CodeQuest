import Contest from '../models/Contest.js';
import User from '../models/User.js';

export const getContests = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { isActive: true };
    if (status) filter.status = status;
    const now = new Date();
    // Auto-update statuses
    await Contest.updateMany({ startTime: { $lte: now }, endTime: { $gt: now }, status: 'upcoming' }, { status: 'active' });
    await Contest.updateMany({ endTime: { $lte: now }, status: { $ne: 'ended' } }, { status: 'ended' });

    const skip = (page - 1) * limit;
    const [contests, total] = await Promise.all([
      Contest.find(filter).select('-participants.submissions').sort({ startTime: -1 }).skip(skip).limit(Number(limit)),
      Contest.countDocuments(filter),
    ]);
    const data = contests.map((c) => ({
      ...c.toJSON(),
      participantCount: c.participants.length,
      participants: undefined,
    }));
    res.json({ success: true, data, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    next(error);
  }
};

export const getContest = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
    const query = isObjectId ? { _id: idOrSlug } : { slug: idOrSlug };
    const contest = await Contest.findOne(query)
      .populate('problems', 'title slug difficulty xpReward')
      .populate('participants.user', 'username avatar level');
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });

    const data = contest.toJSON();
    data.participantCount = contest.participants.length;
    if (req.user) {
      data.isJoined = contest.participants.some((p) => p.user.toString() === req.user._id.toString());
      data.myParticipation = contest.participants.find((p) => p.user.toString() === req.user._id.toString());
    }
    // Show leaderboard
    data.leaderboard = contest.participants
      .sort((a, b) => b.score - a.score || a.penalty - b.penalty)
      .slice(0, 50)
      .map((p, i) => ({ rank: i + 1, user: p.user, score: p.score, problemsSolved: p.problemsSolved, penalty: p.penalty }));
    data.participants = undefined;
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const joinContest = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    if (contest.status === 'ended') return res.status(400).json({ success: false, message: 'Contest has ended' });
    if (contest.participants.some((p) => p.user.toString() === req.user._id.toString())) {
      return res.status(400).json({ success: false, message: 'Already joined' });
    }
    if (contest.participants.length >= contest.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Contest is full' });
    }
    contest.participants.push({
      user: req.user._id,
      submissions: contest.problems.map((pid) => ({ problem: pid, solved: false, attempts: 0, score: 0 })),
    });
    await contest.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { contestsParticipated: 1 } });
    res.json({ success: true, message: 'Joined contest successfully' });
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
    const contest = await Contest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    res.json({ success: true, data: contest });
  } catch (error) {
    next(error);
  }
};

export const deleteContest = async (req, res, next) => {
  try {
    await Contest.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Contest deleted' });
  } catch (error) {
    next(error);
  }
};

export const getContestLeaderboard = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id).populate('participants.user', 'username avatar level');
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found' });
    const leaderboard = contest.participants
      .sort((a, b) => b.score - a.score || a.penalty - b.penalty)
      .map((p, i) => ({ rank: i + 1, user: p.user, score: p.score, problemsSolved: p.problemsSolved, penalty: p.penalty }));
    res.json({ success: true, data: leaderboard });
  } catch (error) {
    next(error);
  }
};
