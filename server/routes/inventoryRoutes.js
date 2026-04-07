const express = require('express');
const router = express.Router();
const {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  bulkUpdateInventory,
  getInventoryStats,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getInventoryStats);
router.post('/bulk-update', bulkUpdateInventory);
router.get('/item/:id', getInventoryItem);
router.route('/').get(getInventory).post(createInventoryItem);
router.route('/:id').put(updateInventoryItem).delete(deleteInventoryItem);

module.exports = router;
