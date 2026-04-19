const Progress = require('../models/Progress');

// Add new progress
const addProgress = async (req, res) => {
  try {
    const progressData = req.body;
    if (req.file) {
      progressData.image = req.file.path;
    }
    const progress = new Progress(progressData);
    const saved = await progress.save();
    res.status(201).json({ message: 'Progress added!', data: saved });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all progress
const getAllProgress = async (req, res) => {
  try {
    const progress = await Progress.find();
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single progress
const getProgressById = async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);
    if (!progress) return res.status(404).json({ message: 'Not found' });
    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update progress
const updateProgress = async (req, res) => {
  try {
    const updateData = req.body;
    if (req.file) {
      updateData.image = req.file.path;
    }
    const updated = await Progress.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Progress updated!', data: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete progress
const deleteProgress = async (req, res) => {
  try {
    const deleted = await Progress.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Not found' });
    res.status(200).json({ message: 'Progress deleted!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProgress,
  getAllProgress,
  getProgressById,
  updateProgress,
  deleteProgress
};