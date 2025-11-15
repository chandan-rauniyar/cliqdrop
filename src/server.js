const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/db');
const Share = require('./models/Share');
const apiRoutes = require('./routes/api');
const { deleteExpiredShares } = require('./utils/deleteExpired');

const app = express();
const PORT = process.env.PORT || 8080;

// Ensure required directories exist
const ensureDirectories = () => {
  const dirs = ['uploads', 'temp', 'logs'];
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    }
  });
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to CliqDrop API',
    version: '1.0.0',
    endpoints: {
      uploadFile: 'POST /api/send/file',
      shareText: 'POST /api/send/text',
      getShare: 'GET /api/receive/:code',
      downloadFile: 'GET /api/download/:code',
      health: 'GET /api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Ensure required directories exist
    ensureDirectories();
    
    // Test database connection
    await testConnection();

    // Sync database (create tables if they don't exist)
    await Share.sync({ alter: false });
    console.log('✅ Database tables synced');

    // Start cron job to delete expired shares every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      await deleteExpiredShares();
    });
    console.log('✅ Cron job scheduled (runs every 5 minutes)');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`📚 Documentation: See README.md for API details`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Start the server
startServer();

module.exports = app;

