const asyncHandler = require('express-async-handler');
const Inventory = require('../models/Inventory');
const ReliefCenter = require('../models/ReliefCenter');

// get all items
const getInventory = asyncHandler(async (req, res) => {
  const items = await Inventory.find();
  res.json(items);
});

// get single item
const getInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  if (!item) throw new Error('Item not found');

  res.json(item);
});

// create item
const createInventoryItem = asyncHandler(async (req, res) => {
  const { itemName, quantity, reliefCenterId } = req.body;

  const center = await ReliefCenter.findById(reliefCenterId);
  if (!center) throw new Error('Center not found');

  const item = await Inventory.create({ itemName, quantity, reliefCenterId });

  res.json(item);
});

// update item
const updateInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!item) throw new Error('Item not found');

  res.json(item);
});

// delete item
const deleteInventoryItem = asyncHandler(async (req, res) => {
  const item = await Inventory.findById(req.params.id);
  if (!item) throw new Error('Item not found');

  await item.deleteOne();
  res.json({ message: 'Deleted' });
});

// bulk update
const bulkUpdateInventory = asyncHandler(async (req, res) => {
  const updates = req.body.updates;

  const results = await Promise.all(
    updates.map(u =>
      Inventory.findByIdAndUpdate(u._id, { quantity: u.quantity }, { new: true })
    )
  );

  res.json(results);
});

// stats
const getInventoryStats = asyncHandler(async (req, res) => {
  const total = await Inventory.countDocuments();
  res.json({ total });
});

module.exports = {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  bulkUpdateInventory,
  getInventoryStats,
};