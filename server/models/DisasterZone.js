const mongoose = require('mongoose');

const disasterZoneSchema = new mongoose.Schema(
  {
    zoneName: { type: String, required: [true, 'Zone name is required'], trim: true },
    disasterType: {
      type: String,
      enum: ['Flood', 'Earthquake', 'Cyclone', 'Landslide', 'Fire', 'Tsunami', 'Other'],
      required: [true, 'Disaster type is required'],
    },
    severityLevel: { type: Number, min: 1, max: 5, required: [true, 'Severity level (1-5) is required'] },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    affectedPopulation: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'contained', 'resolved'], default: 'active' },
    description: { type: String, default: '' },
    reportedBy: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DisasterZone', disasterZoneSchema);
