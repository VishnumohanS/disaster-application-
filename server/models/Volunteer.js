const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: { type: String, required: [true, 'Phone is required'] },
    skills: [
      {
        type: String,
        enum: ['Medical', 'Rescue', 'Logistics', 'Communication', 'Engineering', 'Cooking', 'First Aid', 'Driving'],
      },
    ],
    availabilityStatus: {
      type: String,
      enum: ['available', 'deployed', 'unavailable'],
      default: 'available',
    },
    assignedCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReliefCenter',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Volunteer', volunteerSchema);
