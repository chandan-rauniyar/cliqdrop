const Share = require('../models/Share');

/**
 * Generate a random 6-character alphanumeric code
 * @returns {string} Random code
 */
const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

/**
 * Generate a unique code that doesn't exist in database
 * @returns {Promise<string>} Unique code
 */
const generateUniqueCode = async () => {
  let code = generateCode();
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const existing = await Share.findOne({ where: { code } });
    if (!existing) {
      return code;
    }
    code = generateCode();
    attempts++;
  }

  // If we couldn't find a unique code after max attempts, throw error
  throw new Error('Unable to generate unique code. Please try again.');
};

module.exports = { generateUniqueCode };

