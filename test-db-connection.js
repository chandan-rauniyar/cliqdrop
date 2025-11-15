/**
 * Test database connection script
 * Run: node test-db-connection.js
 */
const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbConfig = {
  database: String(process.env.DB_NAME || 'postgres'),
  username: String(process.env.DB_USER || 'postgres'),
  password: String(process.env.DB_PASS || ''),
  host: String(process.env.DB_HOST || 'localhost'),
  port: parseInt(process.env.DB_PORT || '5432', 10)
};

console.log('🔌 Testing database connection...');
console.log('   Host:', dbConfig.host);
console.log('   Port:', dbConfig.port);
console.log('   User:', dbConfig.username);
console.log('   Database:', dbConfig.database);
console.log('   Password:', dbConfig.password ? '***' + dbConfig.password.slice(-2) : 'NOT SET');
console.log('');

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: false
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection successful!');
    console.log('✅ You can now run: npm start');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database connection failed!');
    console.error('   Error:', error.message);
    console.error('');
    console.error('💡 Troubleshooting:');
    console.error('   1. Verify PostgreSQL is running');
    console.error('   2. Check your .env file has correct credentials');
    console.error('   3. Test connection with: psql -U postgres -h localhost');
    console.error('   4. Create database if needed: CREATE DATABASE postgres;');
    process.exit(1);
  });

