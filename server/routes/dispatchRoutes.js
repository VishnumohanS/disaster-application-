const express = require('express');
const router = express.Router();
const {
  getDispatches,
  getActiveDispatches,
  createDispatch,
  updateDispatchStatus,
  deleteDispatch,
  getDispatchStats,
} = require('../controllers/dispatchController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getDispatchStats);
router.get('/active', getActiveDispatches);
router.route('/').get(getDispatches).post(createDispatch);
router.route('/:id').put(updateDispatchStatus).delete(deleteDispatch);

module.exports = router;
