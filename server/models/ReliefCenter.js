const mongoose = require('mongoose');

const reliefCenterSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Center name is required'], trim: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    address: { type: String, required: [true, 'Address is required'] },
    capacity: { type: Number, required: true, min: 0 },
    currentOccupancy: { type: Number, default: 0, min: 0 },
    contactNumber: { type: String, required: [true, 'Contact number is required'] },
    managerName: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive', 'full'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReliefCenter', reliefCenterSchema);
