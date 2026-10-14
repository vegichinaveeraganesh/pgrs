require('dotenv').config();

module.exports = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'YOUR_MONGODB_CONNECTION_STRING',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'default_jwt_secret_change_in_production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default_jwt_refresh_secret_change_in_production',
  jwtAccessExpiresIn: '2h',
  jwtRefreshExpiresIn: '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
  smsMode: process.env.SMS_MODE || 'simulation',
  ivrsMode: process.env.IVRS_MODE || 'simulation',
  pgrsSyncMode: process.env.PGRS_SYNC_MODE || 'simulation',
  slaDefaultDays: parseInt(process.env.SLA_DEFAULT_DAYS, 10) || 15,
  uploadDir: process.env.UPLOAD_DIR || './uploads'
};
