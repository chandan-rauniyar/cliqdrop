const fs = require('fs');
const { getClientFingerprint } = require('../utils/clientFingerprint');

const TEXT_LIMIT_PER_MINUTE = 60;
const TEXT_WINDOW_MS = 60 * 1000;

const FILE_LIMIT_BYTES_PER_HOUR = 1024 * 1024 * 1024; // 1GB
const FILE_WINDOW_MS = 60 * 60 * 1000;

const textUsage = new Map();
const fileUsage = new Map();
const generalUsage = new Map();
const GENERAL_LIMIT_PER_MINUTE = 10;
const GENERAL_WINDOW_MS = 60 * 1000;

/**
 * Generates or retrieves the usage bucket for a given map.
 */
const getBucket = (usageMap, key, windowMs, now) => {
  const bucket = usageMap.get(key);
  if (!bucket || now - bucket.windowStart >= windowMs) {
    const freshBucket = { count: 0, windowStart: now };
    usageMap.set(key, freshBucket);
    return freshBucket;
  }
  return bucket;
};

/**
 * Middleware that limits text share requests to 60 per minute per end user.
 */
const textRateLimiter = (req, res, next) => {
  try {
    const clientId = getClientFingerprint(req);
    const now = Date.now();
    const bucket = getBucket(textUsage, clientId, TEXT_WINDOW_MS, now);

    bucket.count += 1;

    if (bucket.count > TEXT_LIMIT_PER_MINUTE) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded: You can only share up to 60 texts per minute.'
      });
    }

    return next();
  } catch (error) {
    console.error('Text rate limiter error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to process request at the moment.'
    });
  }
};

/**
 * Middleware that limits file upload volume to 1GB per hour per end user.
 * This middleware expects `req.file` to be populated (i.e., run after multer).
 */
const fileRateLimiter = (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'File is required.'
      });
    }

    const clientId = getClientFingerprint(req);
    const now = Date.now();
    const bucket = getBucket(fileUsage, clientId, FILE_WINDOW_MS, now);

    const incomingSize = req.file.size || 0;
    const projectedTotal = bucket.count + incomingSize;

    if (projectedTotal > FILE_LIMIT_BYTES_PER_HOUR) {
      // Clean up uploaded file since we're rejecting the request
      if (req.tempFilePath && fs.existsSync(req.tempFilePath)) {
        try {
          fs.unlinkSync(req.tempFilePath);
        } catch (cleanupErr) {
          console.error('Failed to clean up temp file after rate-limit rejection:', cleanupErr);
        }
      }

      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded: File upload limit is 1GB per hour.'
      });
    }

    bucket.count = projectedTotal;

    return next();
  } catch (error) {
    console.error('File rate limiter error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to process request at the moment.'
    });
  }
};

/**
 * Generic limiter for read-only endpoints (e.g., receive/download/health).
 */
const generalRateLimiter = (req, res, next) => {
  try {
    const clientId = getClientFingerprint(req);
    const now = Date.now();
    const bucket = getBucket(generalUsage, clientId, GENERAL_WINDOW_MS, now);

    bucket.count += 1;

    if (bucket.count > GENERAL_LIMIT_PER_MINUTE) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded: Too many requests. Please try again later.'
      });
    }

    return next();
  } catch (error) {
    console.error('General rate limiter error:', error);
    return res.status(500).json({
      success: false,
      error: 'Unable to process request at the moment.'
    });
  }
};

module.exports = {
  textRateLimiter,
  fileRateLimiter,
  generalRateLimiter
};

