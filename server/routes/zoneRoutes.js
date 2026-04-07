const express = require('express');
const router = express.Router();
const {
  getZones,
  getZoneById,
  reportZone,
  updateZone,
  deleteZone,
  getZoneStats,
} = require('../controllers/zoneController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getZoneStats);
router.route('/').get(getZones).post(reportZone);
router.route('/:id').get(getZoneById).put(updateZone).delete(deleteZone);

module.exports = router;
