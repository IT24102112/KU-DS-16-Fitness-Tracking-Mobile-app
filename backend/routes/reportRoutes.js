const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  generateReport,
  createReport,
  getReports,
  getReportById,
  deleteReport,
  updateReport,
} = require('../controllers/reportController');

router.use(protect);

router.post('/generate', generateReport);

router.route('/')
  .post(createReport)
  .get(getReports);

router.route('/:id')
  .get(getReportById)
  .delete(deleteReport);

router.put('/:id', updateReport);  

module.exports = router;