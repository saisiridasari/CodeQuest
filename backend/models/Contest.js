import mongoose from 'mongoose';

const contestParticipantSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, default: 0 },
    problemsSolved: { type: Number, default: 0 },
    penalty: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    submissions: [
      {
        problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
        solved: { type: Boolean, default: false },
        attempts: { type: Number, default: 0 },
        solvedAt: { type: Date, default: null },
        score: { type: Number, default: 0 },
      },
    ],
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const contestSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    status: {
      type: String,
      enum: ['upcoming', 'active', 'ended'],
      default: 'upcoming',
    },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard', 'Mixed'], default: 'Mixed' },
    participants: [contestParticipantSchema],
    maxParticipants: { type: Number, default: 1000 },
    xpReward: { type: Number, default: 50 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

contestSchema.index({ startTime: 1, status: 1 });
contestSchema.index({ 'participants.user': 1 });

export default mongoose.model('Contest', contestSchema);
