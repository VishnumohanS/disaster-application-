const asyncHandler = require('express-async-handler');
const ReliefCenter = require('../models/ReliefCenter');
const Inventory = require('../models/Inventory');

// get all centers
const getCenters = asyncHandler(async (req, res) => {
  const centers = await ReliefCenter.find();
  res.json(centers);
});

// get single center + inventory
const getCenterById = asyncHandler(async (req, res) => {
  const center = await ReliefCenter.findById(req.params.id);
  if (!center) throw new Error('Center not found');

  const items = await Inventory.find({ reliefCenterId: req.params.id });

  res.json({ center, items });
});

// create center
const createCenter = asyncHandler(async (req, res) => {
  const center = await ReliefCenter.create(req.body);
  res.json(center);
});

// update center
const updateCenter = asyncHandler(async (req, res) => {
  const center = await ReliefCenter.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!center) throw new Error('Center not found');

  res.json(center);
});

// delete center
const deleteCenter = asyncHandler(async (req, res) => {
  const center = await ReliefCenter.findById(req.params.id);
  if (!center) throw new Error('Center not found');

  await center.deleteOne();
  res.json({ message: 'Deleted' });
});

// stats
const getCenterStats = asyncHandler(async (req, res) => {
  const total = await ReliefCenter.countDocuments();
  res.json({ total });
});

module.exports = {
  getCenters,
  getCenterById,
  createCenter,
  updateCenter,
  deleteCenter,
  getCenterStats,
};