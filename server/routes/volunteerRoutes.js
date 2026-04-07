const express = require('express');
const router = express.Router();
const {
  getVolunteers,
  registerVolunteer,
  updateVolunteer,
  dispatchVolunteer,
  deleteVolunteer,
  getVolunteerStats,
} = require('../controllers/volunteerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getVolunteerStats);
router.put('/dispatch/:id', dispatchVolunteer);
router.route('/').get(getVolunteers).post(registerVolunteer);
router.route('/:id').put(updateVolunteer).delete(deleteVolunteer);

module.exports = router;
