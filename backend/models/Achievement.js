import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon: { type: String, default: '🏆' },
    category: {
      type: String,
      enum: ['problems', 'contests', 'streaks', 'social', 'special'],
      required: true,
    },
    tier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
      default: 'bronze',
    },
    requirement: {
      type: { type: String, required: true },
      value: { type: Number, required: true },
    },
    xpReward: { type: Number, default: 25 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('Achievement', achievementSchema);
