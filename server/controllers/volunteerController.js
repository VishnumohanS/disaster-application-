const asyncHandler = require('express-async-handler');
const Volunteer = require('../models/Volunteer');
const ReliefCenter = require('../models/ReliefCenter');

// get all volunteers
const getVolunteers = asyncHandler(async (req, res) => {
  const volunteers = await Volunteer.find();
  res.json(volunteers);
});

// register volunteer
const registerVolunteer = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const exists = await Volunteer.findOne({ email });
  if (exists) throw new Error('Volunteer already exists');

  const volunteer = await Volunteer.create(req.body);

  res.json(volunteer);
});

// update volunteer
const updateVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );

  if (!volunteer) throw new Error('Volunteer not found');

  res.json(volunteer);
});

// dispatch volunteer
const dispatchVolunteer = asyncHandler(async (req, res) => {
  const { centerId } = req.body;

  const volunteer = await Volunteer.findById(req.params.id);
  if (!volunteer) throw new Error('Volunteer not found');

  if (volunteer.availabilityStatus !== 'available')
    throw new Error('Not available');

  const center = await ReliefCenter.findById(centerId);
  if (!center) throw new Error('Center not found');

  volunteer.availabilityStatus = 'deployed';
  volunteer.assignedCenterId = centerId;

  await volunteer.save();

  res.json(volunteer);
});

// delete volunteer
const deleteVolunteer = asyncHandler(async (req, res) => {
  const volunteer = await Volunteer.findById(req.params.id);
  if (!volunteer) throw new Error('Volunteer not found');

  await volunteer.deleteOne();

  res.json({ message: 'Deleted' });
});

// stats
const getVolunteerStats = asyncHandler(async (req, res) => {
  const total = await Volunteer.countDocuments();
  res.json({ total });
});

module.exports = {
  getVolunteers,
  registerVolunteer,
  updateVolunteer,
  dispatchVolunteer,
  deleteVolunteer,
  getVolunteerStats,
};