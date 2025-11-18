/**
 * Middleware to ensure only trusted clients with API secrets can access the API.
 *
 * Clients must send the header: `x-api-secret: <secret>`
 * The server reads accepted secrets from the environment variable `API_SECRETS`,
 * which should be a comma-separated list.
 */
const authenticateRequest = (req, res, next) => {
  const secretsConfig = process.env.API_SECRETS || '';
  const allowedSecrets = secretsConfig
    .split(',')
    .map((secret) => secret.trim())
    .filter(Boolean);

  if (allowedSecrets.length === 0) {
    console.warn('⚠️ API_SECRETS is not configured. All requests will be rejected.');
    return res.status(500).json({
      success: false,
      error: 'API is not configured for access. Please contact the administrator.'
    });
  }

  const requestSecret = req.headers['x-api-secret'];

  if (!requestSecret || typeof requestSecret !== 'string') {
    return res.status(401).json({
      success: false,
      error: 'Missing API secret. Include x-api-secret header.'
    });
  }

  const isAllowed = allowedSecrets.includes(requestSecret.trim());

  if (!isAllowed) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API secret.'
    });
  }

  // Attach identifier for downstream use (auditing, rate limiting logs etc.)
  req.clientSecretId = requestSecret.trim();

  next();
};

module.exports = { authenticateRequest };

