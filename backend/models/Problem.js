import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema(
  {
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const problemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    tags: [{ type: String, trim: true }],
    constraints: { type: String, default: '' },
    inputFormat: { type: String, default: '' },
    outputFormat: { type: String, default: '' },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    testCases: [testCaseSchema],
    starterCode: {
      javascript: { type: String, default: '' },
      python: { type: String, default: '' },
      cpp: { type: String, default: '' },
      java: { type: String, default: '' },
      c: { type: String, default: '' },
      typescript: { type: String, default: '' },
      go: { type: String, default: '' },
      rust: { type: String, default: '' },
    },
    solution: { type: String, default: '' },
    hints: [{ type: String }],
    timeLimit: { type: Number, default: 2 },
    memoryLimit: { type: Number, default: 256 },
    totalSubmissions: { type: Number, default: 0 },
    acceptedSubmissions: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    xpReward: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

problemSchema.index({ difficulty: 1, isActive: 1 });
problemSchema.index({ tags: 1 });
// slug already has unique:true which creates an index — no duplicate needed
problemSchema.index({ title: 'text', description: 'text' });

problemSchema.virtual('acceptanceRate').get(function () {
  if (this.totalSubmissions === 0) return 0;
  return ((this.acceptedSubmissions / this.totalSubmissions) * 100).toFixed(1);
});

problemSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Problem', problemSchema);
