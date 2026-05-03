const Report = require('../models/Report');
const Progress = require('../models/Progress');
const Workout = require('../models/Workout');
const Nutrition = require('../models/Nutrition');
const Goal = require('../models/Goal');
const Exercise = require('../models/Exercise');

// ── Helper: calculate streak ──────────────────────────
const calculateStreak = async (userId) => {
  const workouts = await Workout.find({ user: userId, status: 'completed' }).sort({ completedDate: -1 });
  if (!workouts.length) return 0;
  let streak = 1;
  for (let i = 1; i < workouts.length; i++) {
    const prev = new Date(workouts[i - 1].completedDate);
    const curr = new Date(workouts[i].completedDate);
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);
    const diffDays = Math.abs(prev - curr) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
};

// @desc    Generate report preview
// @route   POST /api/reports/generate
// @access  Private
const generateReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
    }
    const sd = new Date(startDate);
    const ed = new Date(endDate);
    if (isNaN(sd) || isNaN(ed)) return res.status(400).json({ success: false, message: 'Invalid date format' });
    if (sd > ed) return res.status(400).json({ success: false, message: 'startDate must be before endDate' });

    const userId = req.user._id;

    // Weight
    const progressEntries = await Progress.find({ user: userId, date: { $gte: sd, $lte: ed } }).sort({ date: 1 });
    let weightTrendData = [], bestWeight = 0, worstWeight = 0, avgWeight = 0, weightChange = 0, changePercent = 0;
    if (progressEntries.length) {
      const weights = progressEntries.map(p => p.weight);
      bestWeight = Math.min(...weights);
      worstWeight = Math.max(...weights);
      avgWeight = Math.round(weights.reduce((a, b) => a + b, 0) / weights.length);
      weightTrendData = progressEntries.map(p => ({ date: p.date, weight: p.weight }));
      if (progressEntries.length > 1) {
        weightChange = Number((progressEntries[progressEntries.length - 1].weight - progressEntries[0].weight).toFixed(1));
        changePercent = Number(((weightChange / progressEntries[0].weight) * 100).toFixed(1));
      }
    }

    // Workouts
    const workouts = await Workout.find({
      user: userId,
      $or: [{ completedDate: { $gte: sd, $lte: ed } }, { scheduledDate: { $gte: sd, $lte: ed } }],
    }).lean();
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);
    const completedCount = workouts.filter(w => w.status === 'completed').length;
    const completionRate = totalWorkouts ? Math.round((completedCount / totalWorkouts) * 100) : 0;
    const split = { strength: 0, cardio: 0, flexibility: 0, hiit: 0, yoga: 0, sports: 0, custom: 0 };
    workouts.forEach(w => { if (split[w.category] !== undefined) split[w.category]++; });
    // top exercises
    const exMap = {};
    const exIds = new Set();
    workouts.forEach(w => (w.exercises || []).forEach(ex => {
      if (ex.name) {
        if (!exMap[ex.name]) exMap[ex.name] = { name: ex.name, muscleGroup: 'Unknown', count: 0, exerciseId: ex.exerciseId };
        exMap[ex.name].count++;
      }
      if (ex.exerciseId) exIds.add(ex.exerciseId.toString());
    }));
    if (exIds.size) {
      const details = await Exercise.find({ _id: { $in: Array.from(exIds) } }).lean();
      const groupMap = {};
      details.forEach(d => groupMap[d._id.toString()] = d.muscleGroup);
      Object.values(exMap).forEach(e => { if (e.exerciseId && groupMap[e.exerciseId]) e.muscleGroup = groupMap[e.exerciseId]; });
    }
    const topExercises = Object.values(exMap).sort((a, b) => b.count - a.count).slice(0, 5);

    // Nutrition
    const meals = await Nutrition.find({ user: userId, date: { $gte: sd, $lte: ed } });
    const totalCalories = meals.reduce((sum, m) => sum + (m.totalCalories || 0), 0);
    const uniqueDays = new Set(meals.map(m => m.date.toISOString().split('T')[0])).size;
    const dailyAvg = uniqueDays ? Math.round(totalCalories / uniqueDays) : 0;
    const mealFreq = { breakfast: 0, lunch: 0, dinner: 0, snack: 0 };
    meals.forEach(m => {
      const type = m.mealType?.toLowerCase();
      if (mealFreq[type] !== undefined) mealFreq[type]++;
    });
    let totalProtein = 0, totalCarbs = 0, totalFat = 0;
    meals.forEach(m => m.items.forEach(i => {
      totalProtein += (i.protein || 0) * i.quantity;
      totalCarbs += (i.carbs || 0) * i.quantity;
      totalFat += (i.fat || 0) * i.quantity;
    }));
    const calorieEntries = meals.map(m => ({ date: m.date, totalCalories: m.totalCalories }));

    // Goals
    const goals = await Goal.find({ user: userId, deadline: { $gte: sd, $lte: ed } });
    const goalsList = goals.map(g => ({
      _id: g._id, goalType: g.goalType, targetValue: g.targetValue, currentValue: g.currentValue,
      unit: g.unit, deadline: g.deadline, status: g.status,
      progress: g.targetValue ? Math.round((g.currentValue / g.targetValue) * 100) : 0,
    }));
    const achievedGoals = goalsList.filter(g => g.status === 'Achieved').length;
    const onTrack = goalsList.filter(g => g.status === 'In Progress' && g.progress >= 50).length;

    // Images
    const progressImages = await Progress.find({ user: userId, date: { $gte: sd, $lte: ed }, image: { $exists: true, $ne: '' } }).sort({ date: -1 });
    const imagesList = progressImages.map(p => ({ imageUrl: p.image, date: p.date, weight: p.weight }));
    const beforeImg = progressImages.length > 0 ? progressImages[progressImages.length - 1] : null;
    const afterImg = progressImages.length > 0 ? progressImages[0] : null;

    // Overview
    const streak = await calculateStreak(userId);
    const caloriesBurned = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

    const reportData = {
      metrics: {
        weight: { weightTrendData, bestWeight, worstWeight, averageWeight: avgWeight, totalChange: weightChange, changePercentage: changePercent },
        workouts: { total: totalWorkouts, totalDuration, completionRate, split, topExercises },
        nutrition: { totalCalories, dailyAvg, calorieEntries, macros: { totalProtein, totalCarbs, totalFat }, mealsByType: mealFreq },
        goals: { goalsList, totalActiveGoals: goalsList.filter(g => g.status === 'In Progress').length, achievedGoals, onTrackGoals: onTrack, offTrackGoals: goalsList.filter(g => g.status === 'In Progress' && g.progress < 50).length },
      },
      summary: { activityDays: workouts.length, caloriesBurned, weightChange, weightChangePercent: changePercent, goalsDone: achievedGoals, goalsTotal: goals.length },
      images: { imagesList, beforeImage: beforeImg ? { imageUrl: beforeImg.image, date: beforeImg.date } : null, afterImage: afterImg ? { imageUrl: afterImg.image, date: afterImg.date } : null },
      generatedAt: new Date(),
    };

    console.log('Generated report data:', JSON.stringify(reportData, null, 2));

    res.status(200).json({ success: true, data: reportData });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ── CRUD for saved reports ─────────────────────────────
const createReport = async (req, res) => {
  try {
    const { reportName, startDate, endDate, reportData } = req.body;
    if (!reportName) return res.status(400).json({ success: false, message: 'Report name required' });
    const report = await Report.create({
      user: req.user._id,
      reportName,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      period: 'custom',
      data: reportData || {},
    });
    res.status(201).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const saveReport = createReport;

const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await Report.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });
    res.status(200).json({ success: true, message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a saved report
// @route   PUT /api/reports/:id
// @access  Private
const updateReport = async (req, res) => {
  try {
    const { reportName, startDate, endDate, reportData } = req.body;

    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    if (reportName) report.reportName = reportName;
    if (startDate) report.startDate = new Date(startDate);
    if (endDate) report.endDate = new Date(endDate);
    if (reportData) report.data = reportData;

    
    await report.save();

    res.status(200).json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateReport, createReport, saveReport, getReports, getReportById, deleteReport,updateReport, };