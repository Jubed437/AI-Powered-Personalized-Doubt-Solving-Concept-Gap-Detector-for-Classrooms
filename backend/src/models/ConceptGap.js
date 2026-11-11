const mongoose = require('mongoose');

const conceptGapSchema = new mongoose.Schema(
  {
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    concept: {
      type: String,
      required: true,
      trim: true,
    },
    prerequisiteOf: {
      type: String,
      default: null,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    doubts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doubt',
    }],
    occurrences: {
      type: Number,
      min: 1,
      required: true,
    },
  },
  { timestamps: true }
);

conceptGapSchema.index({ student: 1, concept: 1 }, { unique: true });

module.exports = mongoose.models.ConceptGap
  || mongoose.model('ConceptGap', conceptGapSchema);
