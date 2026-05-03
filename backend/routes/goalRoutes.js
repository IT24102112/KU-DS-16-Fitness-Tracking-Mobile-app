const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/goalController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect);

// ─── USER ROUTES ────────────────────────
router.post('/', createGoal);
router.get('/my-goals', getMyGoals);
router.get('/:id', getGoalById);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);
router.patch('/:id/status', updateGoalStatus);
router.patch('/:id/progress', updateProgress);

// ─── ADMIN ROUTES ───────────────────────
router.get('/admin/all', adminOnly, adminGetAllGoals);
router.post('/admin', adminOnly, adminCreateGoal);
router.put('/admin/:id', adminOnly, adminUpdateGoal);
router.delete('/admin/:id', adminOnly, adminDeleteGoal);
router.patch('/admin/:id/status', adminOnly, adminUpdateGoalStatus);
router.patch('/admin/:id/progress', adminOnly, adminUpdateProgress);

module.exports = router;