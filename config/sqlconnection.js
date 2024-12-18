import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Create a new Sequelize instance with connection pooling
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
  port: process.env.DB_PORT,
  pool: {
    max: 500, // maximum number of connections
    min: 0,  // minimum number of connections
    acquire: 30000, // maximum time (in ms) that pool will try to get connection before throwing error
    idle: 10000 // maximum time (in ms) that a connection can be idle before being released
  }
});

// Function to authenticate and open the connection
const openConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Exit process if connection fails
  }
};

// Function to close all connections
const closeConnection = async () => {
  try {
    sequelize.connectionManager.releaseConnection();
    console.log('Pool connection has been released.');
  } catch (error) {
    console.error('Error closing the connection:', error.message);
  }
};

export { sequelize, openConnection, closeConnection };
