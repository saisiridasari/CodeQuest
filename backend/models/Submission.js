import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
    contest: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', default: null },
    code: { type: String, required: true },
    language: { type: String, required: true },
    verdict: {
      type: String,
      enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Compilation Error', 'Pending'],
      default: 'Pending',
    },
    testCasesPassed: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    // Gemini analysis
    timeComplexity: { type: String, default: '' },
    spaceComplexity: { type: String, default: '' },
    explanation: { type: String, default: '' },
    suggestions: { type: String, default: '' },
    testResults: [
      {
        input: String,
        expectedOutput: String,
        actualOutput: String,
        passed: Boolean,
      },
    ],
  },
  { timestamps: true }
);

submissionSchema.index({ user: 1, problem: 1 });
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ contest: 1, user: 1 });

export default mongoose.model('Submission', submissionSchema);
