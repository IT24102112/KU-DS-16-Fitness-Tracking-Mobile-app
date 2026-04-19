const express = require('express');
const router = express.Router();
const upload = require('../upload');
const {
  addProgress,
  getAllProgress,
  getProgressById,
  updateProgress,
  deleteProgress
} = require('../controllers/progressController');

router.post('/', upload.single('image'), addProgress);
router.get('/', getAllProgress);
router.get('/:id', getProgressById);
router.put('/:id', updateProgress);
router.delete('/:id', deleteProgress);

module.exports = router;