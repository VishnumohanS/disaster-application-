const express = require('express');
const router = express.Router();
const {
  getCenters,
  getCenterById,
  createCenter,
  updateCenter,
  deleteCenter,
  getCenterStats,
} = require('../controllers/centerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getCenterStats);
router.route('/').get(getCenters).post(createCenter);
router.route('/:id').get(getCenterById).put(updateCenter).delete(deleteCenter);

module.exports = router;
