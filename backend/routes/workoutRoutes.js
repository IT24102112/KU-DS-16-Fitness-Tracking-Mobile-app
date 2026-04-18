const express = require('express');
const router = express.Router();
const {
  getWorkouts, getWorkout, createWorkout,
  updateWorkout, deleteWorkout, completeWorkout,
} = require('../controllers/workoutController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(getWorkouts).post(createWorkout);
router.route('/:id').get(getWorkout).put(updateWorkout).delete(deleteWorkout);
router.patch('/:id/complete', completeWorkout);

module.exports = router;
