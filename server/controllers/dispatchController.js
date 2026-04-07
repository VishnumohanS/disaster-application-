const asyncHandler = require('express-async-handler');
const Dispatch = require('../models/Dispatch');
const Volunteer = require('../models/Volunteer');

// get all dispatches
const getDispatches = asyncHandler(async (req, res) => {
  const dispatches = await Dispatch.find();
  res.json(dispatches);
});

// get active dispatches
const getActiveDispatches = asyncHandler(async (req, res) => {
  const dispatches = await Dispatch.find({ status: 'active' });
  res.json(dispatches);
});

// create dispatch
const createDispatch = asyncHandler(async (req, res) => {
  const { volunteerId, reliefCenterId } = req.body;

  const volunteer = await Volunteer.findById(volunteerId);
  if (!volunteer) throw new Error('Volunteer not found');

  const dispatch = await Dispatch.create({ volunteerId, reliefCenterId });

  // update volunteer status
  await Volunteer.findByIdAndUpdate(volunteerId, {
    availabilityStatus: 'deployed',
  });

  res.json(dispatch);
});

// update dispatch status
const updateDispatchStatus = asyncHandler(async (req, res) => {
  const dispatch = await Dispatch.findById(req.params.id);
  if (!dispatch) throw new Error('Dispatch not found');

  dispatch.status = req.body.status;

  // if completed → volunteer becomes free
  if (req.body.status === 'completed') {
    await Volunteer.findByIdAndUpdate(dispatch.volunteerId, {
      availabilityStatus: 'available',
    });
  }

  await dispatch.save();
  res.json(dispatch);
});

// delete dispatch
const deleteDispatch = asyncHandler(async (req, res) => {
  const dispatch = await Dispatch.findById(req.params.id);
  if (!dispatch) throw new Error('Dispatch not found');

  await dispatch.deleteOne();
  res.json({ message: 'Deleted' });
});

// stats
const getDispatchStats = asyncHandler(async (req, res) => {
  const total = await Dispatch.countDocuments();
  res.json({ total });
});

module.exports = {
  getDispatches,
  getActiveDispatches,
  createDispatch,
  updateDispatchStatus,
  deleteDispatch,
  getDispatchStats,
};