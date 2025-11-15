const Share = require('../models/Share');
const { generateUniqueCode } = require('../utils/codeGenerator');
const fs = require('fs');
const path = require('path');

/**
 * Calculate expiry time based on duration
 * @param {number} durationMinutes - Duration in minutes (default: 30, max: 1440 = 24 hours)
 * @returns {Date} Expiry date
 */
const calculateExpiry = (durationMinutes = 30) => {
  const maxMinutes = 1440; // 24 hours
  const minutes = Math.min(Math.max(durationMinutes, 1), maxMinutes);
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return expiry;
};

/**
 * Upload file and generate share code
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const { expiresIn, deleteAfterView } = req.body;
    const durationMinutes = expiresIn ? parseInt(expiresIn) : 30;
    const expiresAt = calculateExpiry(durationMinutes);
    const shouldDeleteAfterView = deleteAfterView === 'true' || deleteAfterView === true;

    // Generate unique code
    const code = await generateUniqueCode();

    // Create upload directory for this code
    const uploadDir = path.join(__dirname, '../../uploads', code);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Move file from temp to final location
    const finalFileName = req.file.originalname;
    const finalFilePath = path.join(uploadDir, finalFileName);
    fs.renameSync(req.tempFilePath, finalFilePath);

    // Save to database
    const share = await Share.create({
      code,
      type: 'file',
      file_path: `uploads/${code}/${finalFileName}`,
      mime_type: req.file.mimetype,
      file_size: req.file.size,
      expires_at: expiresAt,
      delete_after_view: shouldDeleteAfterView
    });

    res.status(201).json({
      success: true,
      code: code,
      expires_at: expiresAt,
      delete_after_view: shouldDeleteAfterView,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    // Clean up temp file if exists
    if (req.tempFilePath && fs.existsSync(req.tempFilePath)) {
      try {
        fs.unlinkSync(req.tempFilePath);
      } catch (err) {
        console.error('Error cleaning up temp file:', err);
      }
    }

    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload file'
    });
  }
};

/**
 * Share text and generate share code
 */
const shareText = async (req, res) => {
  try {
    const { content, expiresIn, deleteAfterView } = req.body;

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Text content is required'
      });
    }

    // Check word count (approximately 10K words)
    const wordCount = content.trim().split(/\s+/).length;
    if (wordCount > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Text content exceeds 10,000 words limit'
      });
    }

    const durationMinutes = expiresIn ? parseInt(expiresIn) : 30;
    const expiresAt = calculateExpiry(durationMinutes);
    const shouldDeleteAfterView = deleteAfterView === 'true' || deleteAfterView === true;

    // Generate unique code
    const code = await generateUniqueCode();

    // Save to database
    const share = await Share.create({
      code,
      type: 'text',
      content: content,
      expires_at: expiresAt,
      delete_after_view: shouldDeleteAfterView
    });

    res.status(201).json({
      success: true,
      code: code,
      expires_at: expiresAt,
      delete_after_view: shouldDeleteAfterView,
      word_count: wordCount,
      message: 'Text shared successfully'
    });
  } catch (error) {
    console.error('Share text error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to share text'
    });
  }
};

module.exports = {
  uploadFile,
  shareText
};

