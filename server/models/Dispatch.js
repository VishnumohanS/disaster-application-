const mongoose = require('mongoose');

const dispatchSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer',
      required: [true, 'Volunteer is required'],
    },
    reliefCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReliefCenter',
      required: [true, 'Relief center is required'],
    },
    dispatchType: {
      type: String,
      enum: ['Medical', 'Rescue', 'Logistics', 'Supply', 'Evacuation', 'Assessment'],
      required: [true, 'Dispatch type is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: { type: String, default: '' },
    dispatchedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Dispatch', dispatchSchema);
