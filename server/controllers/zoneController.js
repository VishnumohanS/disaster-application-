const asyncHandler = require('express-async-handler');
const DisasterZone = require('../models/DisasterZone');

// get all zones
const getZones = asyncHandler(async (req, res) => {
  const zones = await DisasterZone.find();
  res.json(zones);
});

// get single zone
const getZoneById = asyncHandler(async (req, res) => {
  const zone = await DisasterZone.findById(req.params.id);
  if (!zone) throw new Error('Zone not found');

  res.json(zone);
});

// create zone
const reportZone = asyncHandler(async (req, res) => {
  const zone = await DisasterZone.create(req.body);

  // alert if high severity
  if (zone.severityLevel === 5) {
    console.log('🚨 High alert!');
  }

  res.json(zone);
});

// update zone
const updateZone = asyncHandler(async (req, res) => {
  const zone = await DisasterZone.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!zone) throw new Error('Zone not found');

  res.json(zone);
});

// delete zone
const deleteZone = asyncHandler(async (req, res) => {
  const zone = await DisasterZone.findById(req.params.id);
  if (!zone) throw new Error('Zone not found');

  await zone.deleteOne();

  res.json({ message: 'Deleted' });
});

// stats
const getZoneStats = asyncHandler(async (req, res) => {
  const total = await DisasterZone.countDocuments();
  res.json({ total });
});

module.exports = {
  getZones,
  getZoneById,
  reportZone,
  updateZone,
  deleteZone,
  getZoneStats,
};