const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);


const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Routes
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/workouts',  require('./routes/workoutRoutes'));
app.use('/api/nutrition', require('./routes/nutritionRoutes'));
app.use('/api/users',     require('./routes/userRoutes'));

// User routes below later:
// app.use('/api/diet-plans', require('./routes/dietPlanRoutes'));
//app.use('/api/exercises', require('./routes/exerciseRoutes'));
// app.use('/api/progress',   require('./routes/progressRoutes'));
// app.use('/api/goals',      require('./routes/goalRoutes'));
// app.use('/api/reports',    require('./routes/reportRoutes'));

// Health check
app.get('/', (_req, res) => res.json({ message: 'FitTrack API is running', status: 'OK' }));

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
