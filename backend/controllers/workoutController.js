const Workout = require('../models/Workout');

// @desc  Get all workouts for logged-in user
// @route GET /api/workouts
// @access Private
const getWorkouts = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 10 } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    if (category) filter.category = category;

    const skip = (page - 1) * limit;
    const workouts = await Workout.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Workout.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: workouts.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: workouts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single workout
// @route GET /api/workouts/:id
// @access Private
const getWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOne({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    res.status(200).json({ success: true, data: workout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Create workout
// @route POST /api/workouts
// @access Private
const createWorkout = async (req, res) => {
  try {
    req.body.user = req.user._id;
    const workout = await Workout.create(req.body);
    res.status(201).json({ success: true, data: workout });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update workout
// @route PUT /api/workouts/:id
// @access Private
const updateWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    res.status(200).json({ success: true, data: workout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete workout
// @route DELETE /api/workouts/:id
// @access Private
const deleteWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    res.status(200).json({ success: true, message: 'Workout deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Mark workout as completed
// @route PATCH /api/workouts/:id/complete
// @access Private
const completeWorkout = async (req, res) => {
  try {
    const workout = await Workout.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status: 'completed', completedDate: new Date(), ...req.body },
      { new: true }
    );
    if (!workout) {
      return res.status(404).json({ success: false, message: 'Workout not found' });
    }
    res.status(200).json({ success: true, data: workout });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getWorkouts, getWorkout, createWorkout, updateWorkout, deleteWorkout, completeWorkout };
