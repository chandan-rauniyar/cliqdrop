const Share = require('../models/Share');
const path = require('path');
const fs = require('fs');

/**
 * Get share data by code
 */
const getShareByCode = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code || code.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Invalid code format'
      });
    }

    // Find share
    const share = await Share.findOne({
      where: { code: code.toUpperCase() }
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: 'Share code not found or expired'
      });
    }

    // Check if expired
    if (new Date() > new Date(share.expires_at)) {
      return res.status(404).json({
        success: false,
        error: 'Share code has expired'
      });
    }

    // Increment view count
    await share.increment('view_count');

    // If delete_after_view is true and this is the first view, mark for deletion
    if (share.delete_after_view && share.view_count === 1) {
      // Set expiry to now (will be cleaned up by cron)
      share.expires_at = new Date();
      await share.save();
    }

    // Return share data
    res.json({
      success: true,
      type: share.type,
      content: share.type === 'text' ? share.content : null,
      file_info: share.type === 'file' ? {
        filename: path.basename(share.file_path),
        mime_type: share.mime_type,
        file_size: share.file_size,
        size_mb: (share.file_size / (1024 * 1024)).toFixed(2)
      } : null,
      expires_at: share.expires_at,
      created_at: share.created_at,
      view_count: share.view_count
    });
  } catch (error) {
    console.error('Get share error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve share'
    });
  }
};

/**
 * Download file by code
 */
const downloadFile = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code || code.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Invalid code format'
      });
    }

    // Find share
    const share = await Share.findOne({
      where: { code: code.toUpperCase() }
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        error: 'Share code not found or expired'
      });
    }

    if (share.type !== 'file') {
      return res.status(400).json({
        success: false,
        error: 'This code is for text sharing, not a file'
      });
    }

    // Check if expired
    if (new Date() > new Date(share.expires_at)) {
      return res.status(404).json({
        success: false,
        error: 'Share code has expired'
      });
    }

    // Check if file exists
    const filePath = path.join(__dirname, '../../', share.file_path);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found on server'
      });
    }

    // Increment view count
    await share.increment('view_count');

    // If delete_after_view is true and this is the first view, mark for deletion
    if (share.delete_after_view && share.view_count === 1) {
      share.expires_at = new Date();
      await share.save();
    }

    // Set headers and send file
    const filename = path.basename(share.file_path);
    res.setHeader('Content-Type', share.mime_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', share.file_size);

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to download file'
    });
  }
};

module.exports = {
  getShareByCode,
  downloadFile
};

