const Share = require('../models/Share');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

/**
 * Delete expired shares and their associated files
 */
const deleteExpiredShares = async () => {
  try {
    const now = new Date();
    
    // Find all expired shares
    const expiredShares = await Share.findAll({
      where: {
        expires_at: {
          [Op.lt]: now
        }
      }
    });

    let deletedCount = 0;

    for (const share of expiredShares) {
      // Delete file if it exists
      if (share.file_path) {
        const filePath = path.join(__dirname, '../../', share.file_path);
        try {
          if (fs.existsSync(filePath)) {
            // Delete the file
            fs.unlinkSync(filePath);
            
            // Try to delete the directory if it's empty
            const dirPath = path.dirname(filePath);
            try {
              const files = fs.readdirSync(dirPath);
              if (files.length === 0) {
                fs.rmdirSync(dirPath);
              }
            } catch (err) {
              // Directory not empty or other error, ignore
            }
          }
        } catch (err) {
          console.error(`Error deleting file ${filePath}:`, err.message);
        }
      }

      // Delete database record
      await share.destroy();
      deletedCount++;
    }

    if (deletedCount > 0) {
      console.log(`✅ Deleted ${deletedCount} expired share(s) at ${now.toISOString()}`);
    }

    return deletedCount;
  } catch (error) {
    console.error('❌ Error deleting expired shares:', error.message);
    throw error;
  }
};

module.exports = { deleteExpiredShares };

