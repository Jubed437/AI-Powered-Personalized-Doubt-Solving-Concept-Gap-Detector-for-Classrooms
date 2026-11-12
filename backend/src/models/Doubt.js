const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    aiAnswer: {
      type: String,
      default: null,
    },
    detectedGaps: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ConceptGap',
    }],
    status: {
      type: String,
      enum: ['pending', 'answered', 'failed'],
      default: 'pending',
      required: true,
    },
  },
  { timestamps: true }
);

doubtSchema.index({ classroom: 1 });
doubtSchema.index({ student: 1 });

module.exports = mongoose.models.Doubt || mongoose.model('Doubt', doubtSchema);
