const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    itemName: { type: String, required: [true, 'Item name is required'], trim: true },
    category: {
      type: String,
      enum: ['Food', 'Medicine', 'Clothing', 'Shelter', 'Equipment', 'Water', 'Other'],
      default: 'Other',
    },
    quantity: { type: Number, required: true, default: 0, min: 0 },
    unit: { type: String, default: 'units' },
    minimumThreshold: { type: Number, default: 10 },
    reliefCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReliefCenter',
      required: [true, 'Relief center is required'],
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inventory', inventorySchema);
