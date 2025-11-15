const { Sequelize } = require('sequelize');
require('dotenv').config();

// Ensure all database credentials are properly formatted as strings
const dbConfig = {
  database: String(process.env.DB_NAME || 'cliqdrop'),
  username: String(process.env.DB_USER || 'postgres'),
  password: String(process.env.DB_PASS || ''),
  host: String(process.env.DB_HOST || 'localhost'),
  port: parseInt(process.env.DB_PORT || '5432', 10),
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

// Debug: Log config (without password for security)
console.log('🔌 Database Config:', {
  database: dbConfig.database,
  username: dbConfig.username,
  host: dbConfig.host,
  port: dbConfig.port,
  passwordSet: !!dbConfig.password
});

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    pool: dbConfig.pool
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    console.error('\n📋 Please verify your database credentials in .env file:');
    console.error(`   DB_HOST: ${dbConfig.host}`);
    console.error(`   DB_PORT: ${dbConfig.port}`);
    console.error(`   DB_USER: ${dbConfig.username}`);
    console.error(`   DB_NAME: ${dbConfig.database}`);
    console.error(`   DB_PASS: ${dbConfig.password ? '***' + dbConfig.password.slice(-2) : 'NOT SET'}`);
    console.error('\n💡 Make sure:');
    console.error('   1. PostgreSQL is running');
    console.error('   2. Database exists (CREATE DATABASE postgres; or CREATE DATABASE cliqdrop;)');
    console.error('   3. Password is correct in .env file');
    console.error('   4. User has proper permissions\n');
    return false;
  }
};

module.exports = { sequelize, testConnection };

