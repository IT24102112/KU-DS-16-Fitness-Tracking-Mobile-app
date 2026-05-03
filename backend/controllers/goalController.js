const Goal = require('../models/Goal');

// ─── USER FUNCTIONS ────────────────────────────────────────

// @desc    Create a new goal
// @route   POST /api/goals
// @access  Private
const createGoal = async (req, res) => {
  try {
    req.body.user = req.user._id;
    const goal = await Goal.create(req.body);
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all goals for logged-in user
// @route   GET /api/goals/my-goals
// @access  Private
const getMyGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: goals.length, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single goal by ID
// @route   GET /api/goals/:id
// @access  Private
const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found or not authorized' });
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found or not authorized' });
    res.status(200).json({ success: true, message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update goal status
// @route   PATCH /api/goals/:id/status
// @access  Private
const updateGoalStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found or not authorized' });
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update current progress
// @route   PATCH /api/goals/:id/progress
// @access  Private
const updateProgress = async (req, res) => {
  try {
    const { currentValue } = req.body;
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { currentValue },
      { new: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found or not authorized' });
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ADMIN FUNCTIONS ──────────────────────────────────────

// @desc    Get all goals (admin) – optional ?userId=
// @route   GET /api/goals/admin/all
// @access  Private/Admin
const adminGetAllGoals = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { user: userId } : {};
    const goals = await Goal.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: goals.length, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a goal for a specific user (admin)
// @route   POST /api/goals/admin
// @access  Private/Admin
const adminCreateGoal = async (req, res) => {
  try {
    const { userId, goalType, targetValue, unit, deadline } = req.body;
    if (!userId || !goalType || !targetValue || !deadline) {
      return res.status(400).json({ success: false, message: 'User ID, goal type, target value, and deadline are required' });
    }
    const goal = await Goal.create({
      user: userId,
      goalType,
      targetValue,
      unit: unit || 'kg',
      deadline,
    });
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update any goal (admin)
// @route   PUT /api/goals/admin/:id
// @access  Private/Admin
const adminUpdateGoal = async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete any goal (admin)
// @route   DELETE /api/goals/admin/:id
// @access  Private/Admin
const adminDeleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findByIdAndDelete(req.params.id);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update goal status for any goal (admin)
// @route   PATCH /api/goals/admin/:id/status
// @access  Private/Admin
const adminUpdateGoalStatus = async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update current progress for any goal (admin)
// @route   PATCH /api/goals/admin/:id/progress
// @access  Private/Admin
const adminUpdateProgress = async (req, res) => {
  try {
    const goal = await Goal.findByIdAndUpdate(
      req.params.id,
      { currentValue: req.body.currentValue },
      { new: true }
    );
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });
    res.status(200).json({ success: true, data: goal });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  createGoal,
  getMyGoals,
  getGoalById,
  updateGoal,
  deleteGoal,
  updateGoalStatus,
  updateProgress,
  adminGetAllGoals,
  adminCreateGoal,
  adminUpdateGoal,
  adminDeleteGoal,
  adminUpdateGoalStatus,
  adminUpdateProgress,
};