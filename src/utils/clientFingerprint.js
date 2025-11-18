const crypto = require('crypto');

/**
 * Returns an identifier representing an end user/device.
 * Priority order:
 *   1. Explicit client id header `x-client-id`
 *   2. Combination of IP + user-agent + accept-language
 *
 * @param {import('express').Request} req
 * @returns {string}
 */
const getClientFingerprint = (req) => {
  const explicitId = req.headers['x-client-id'];
  if (explicitId && typeof explicitId === 'string' && explicitId.trim().length > 0) {
    return explicitId.trim();
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  const ip = forwardedFor
    ? forwardedFor.split(',')[0].trim()
    : (req.ip || req.socket?.remoteAddress || 'unknown');

  const userAgent = req.headers['user-agent'] || 'unknown';
  const acceptLanguage = req.headers['accept-language'] || 'unknown';

  const raw = `${ip}|${userAgent}|${acceptLanguage}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
};

module.exports = { getClientFingerprint };

