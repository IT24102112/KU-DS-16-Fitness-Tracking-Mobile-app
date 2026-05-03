const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    reportName: {
      type: String,
      required: [true, 'Report name is required'],
      trim: true,
    },
    period: {
      type: String,
      enum: ['7D', '30D', '90D', 'custom'],
      required: [true, 'Period is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    data: {
      overview: {
        streak: { type: Number, default: 0 },
        caloriesBurned: { type: Number, default: 0 },
        weightChange: { type: Number, default: 0 },
        weightChangePercent: { type: Number, default: 0 },
        goalsDone: { type: Number, default: 0 },
        goalsTotal: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 },
      },
      weight: {
        entries: [
          {
            date: Date,
            weight: Number,
            chest: Number,
            waist: Number,
            hips: Number,
          },
        ],
        minWeight: { type: Number, default: 0 },
        maxWeight: { type: Number, default: 0 },
        avgWeight: { type: Number, default: 0 },
        trend: { type: Number, default: 0 },
      },
      workout: {
        total: { type: Number, default: 0 },
        totalDuration: { type: Number, default: 0 },
        completionRate: { type: Number, default: 0 },
        split: {
          strength: { type: Number, default: 0 },
          cardio: { type: Number, default: 0 },
          flexibility: { type: Number, default: 0 },
          hiit: { type: Number, default: 0 },
          yoga: { type: Number, default: 0 },
          sports: { type: Number, default: 0 },
          custom: { type: Number, default: 0 },
        },
        topExercises: [
          {
            name: String,
            muscleGroup: String,
            count: Number,
            personalRecords: [
              {
                value: Number,
                unit: String,
                date: Date,
                increase: Number,
              },
            ],
          },
        ],
      },
      nutrition: {
        totalCalories: { type: Number, default: 0 },
        dailyAvg: { type: Number, default: 0 },
        mealFrequency: {
          breakfast: { type: Number, default: 0 },
          lunch: { type: Number, default: 0 },
          dinner: { type: Number, default: 0 },
          snack: { type: Number, default: 0 },
        },
        macros: {
          totalProtein: { type: Number, default: 0 },
          totalCarbs: { type: Number, default: 0 },
          totalFat: { type: Number, default: 0 },
          avgProtein: { type: Number, default: 0 },
          avgCarbs: { type: Number, default: 0 },
          avgFat: { type: Number, default: 0 },
        },
        calorieEntries: [
          {
            date: Date,
            totalCalories: Number,
          },
        ],
      },
      goals: {
        active: [
          {
            _id: mongoose.Schema.Types.ObjectId,
            goalType: String,
            targetValue: Number,
            currentValue: Number,
            unit: String,
            deadline: Date,
            status: String,
            progress: Number,
          },
        ],
        completed: [
          {
            _id: mongoose.Schema.Types.ObjectId,
            goalType: String,
            targetValue: Number,
            completedValue: Number,
            unit: String,
            deadline: Date,
          },
        ],
        stats: {
          total: { type: Number, default: 0 },
          achieved: { type: Number, default: 0 },
          inProgress: { type: Number, default: 0 },
          failed: { type: Number, default: 0 },
        },
      },
      images: {
        progressImages: [
          {
            _id: mongoose.Schema.Types.ObjectId,
            imagePath: String,
            date: Date,
            weight: Number,
            notes: String,
          },
        ],
        nutritionImages: [
          {
            _id: mongoose.Schema.Types.ObjectId,
            imagePath: String,
            date: Date,
            mealType: String,
          },
        ],
        beforeAfter: {
          beforeImage: String,
          afterImage: String,
          beforeDate: Date,
          afterDate: Date,
          weightBefore: Number,
          weightAfter: Number,
          weightDifference: Number,
          daysDifference: Number,
        },
      },
    },
    pdfPath: {
      type: String,
      default: null,
    },
    fileSizeKB: {
      type: Number,
      default: 0,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

reportSchema.index({ user: 1, createdAt: -1 });
reportSchema.index({ user: 1, period: 1 });

module.exports = mongoose.model('Report', reportSchema);

