const express = require('express');
const router = express.Router();
const { uploadFile, shareText } = require('../controllers/send.controller');
const { getShareByCode, downloadFile } = require('../controllers/receive.controller');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const { authenticateRequest } = require('../middleware/secretAuth');
const { textRateLimiter, fileRateLimiter, generalRateLimiter } = require('../middleware/rateLimit');

// Every API route requires a valid API secret header.
router.use(authenticateRequest);

/**
 * @route   POST /api/send/file
 * @desc    Upload a file and get a share code
 * @access  Restricted via API secret + rate limit
 */
router.post('/send/file', uploadSingle, handleUploadError, fileRateLimiter, uploadFile);

/**
 * @route   POST /api/send/text
 * @desc    Share text and get a share code
 * @access  Restricted via API secret + rate limit
 */
router.post('/send/text', textRateLimiter, shareText);

/**
 * @route   GET /api/receive/:code
 * @desc    Get share data by code
 * @access  Restricted via API secret
 */
router.get('/receive/:code', generalRateLimiter, getShareByCode);

/**
 * @route   GET /api/download/:code
 * @desc    Download file by code
 * @access  Restricted via API secret
 */
router.get('/download/:code', generalRateLimiter, downloadFile);

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Restricted via API secret
 */
router.get('/health', generalRateLimiter, (req, res) => {
  res.json({
    success: true,
    message: 'CliqDrop API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

