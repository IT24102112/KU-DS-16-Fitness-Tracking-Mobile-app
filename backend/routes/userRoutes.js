const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  getAllUsers,
  deleteUser,
} = require('../controllers/userController');

// Profile routes - any logged in user
router.route('/profile')
  .get(protect, getProfile)         // GET /api/users/profile
  .put(protect, updateProfile);     // PUT /api/users/profile

// Admin only routes
router.route('/')
  .get(protect, adminOnly, getAllUsers);  // GET /api/users

router.route('/:id')
  .delete(protect, adminOnly, deleteUser); // DELETE /api/users/:id

module.exports = router;