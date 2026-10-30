const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require("dotenv").config();
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
connectDB();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.use('/api/auth',       require('./routes/auth'));
app.use('/api/teachers',   require('./routes/teachers'));
app.use('/api/classes',    require('./routes/classes'));
app.use('/api/rooms',      require('./routes/rooms'));
app.use('/api/subjects',   require('./routes/subjects'));
app.use('/api/simple-timetable', require('./routes/simpleTimetable'));
app.use('/api/dashboard',  require('./routes/dashboard'));


app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Timetable API is running', timestamp: new Date() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
