import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'alltime'],
      required: true,
    },
    periodKey: { type: String, required: true },
    xp: { type: Number, default: 0 },
    problemsSolved: { type: Number, default: 0 },
    contestsWon: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
  },
  { timestamps: true }
);

leaderboardSchema.index({ period: 1, periodKey: 1, xp: -1 });
leaderboardSchema.index({ user: 1, period: 1 });

export default mongoose.model('Leaderboard', leaderboardSchema);
