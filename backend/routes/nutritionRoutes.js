const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addMeal,
  getMeals,
  getMealById,
  updateMeal,
  deleteMeal,
  getDailySummary,
} = require('../controllers/nutritionController');

// IMPORTANT: /summary must come BEFORE /:id
// Otherwise Express will treat "summary" as an ID
router.get('/summary', protect, getDailySummary);

router.route('/')
  .get(protect, getMeals)       // GET /api/nutrition
  .post(protect, addMeal);      // POST /api/nutrition

router.route('/:id')
  .get(protect, getMealById)    // GET /api/nutrition/:id
  .put(protect, updateMeal)     // PUT /api/nutrition/:id
  .delete(protect, deleteMeal); // DELETE /api/nutrition/:id

module.exports = router;