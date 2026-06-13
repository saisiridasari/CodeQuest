import mongoose from 'mongoose';

const dailyChallengeSchema = new mongoose.Schema(
  {
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    date: { type: Date, required: true, unique: true },
    completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    xpBonus: { type: Number, default: 20 },
  },
  { timestamps: true }
);

dailyChallengeSchema.index({ date: -1 });

export default mongoose.model('DailyChallenge', dailyChallengeSchema);
