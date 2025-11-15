const express = require('express');
const router = express.Router();
const { uploadFile, shareText } = require('../controllers/send.controller');
const { getShareByCode, downloadFile } = require('../controllers/receive.controller');
const { uploadSingle, handleUploadError } = require('../middleware/upload');

/**
 * @route   POST /api/send/file
 * @desc    Upload a file and get a share code
 * @access  Public
 */
router.post('/send/file', uploadSingle, handleUploadError, uploadFile);

/**
 * @route   POST /api/send/text
 * @desc    Share text and get a share code
 * @access  Public
 */
router.post('/send/text', shareText);

/**
 * @route   GET /api/receive/:code
 * @desc    Get share data by code
 * @access  Public
 */
router.get('/receive/:code', getShareByCode);

/**
 * @route   GET /api/download/:code
 * @desc    Download file by code
 * @access  Public
 */
router.get('/download/:code', downloadFile);

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CliqDrop API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

