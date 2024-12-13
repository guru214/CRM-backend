import { sequelize } from './sqlconnection.js';

const sequelizeMiddleware = async (req, res, next) => {
  try {
    await sequelize.authenticate(); // Ensure the connection is alive
    req.sequelize = sequelize;
    console.log('Connection has been established successfully.');
    next();
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Close the connection after the response is sent
const closeSequelizeConnection = (req, res, next) => {
  res.on('finish', async () => {
    try {
      // No need to close here, as pooling handles this
      console.log('Request processing finished.');
    } catch (err) {
      console.error('Error closing the Sequelize connection:', err.message);
    }
  });
  next();
};

export { sequelizeMiddleware, closeSequelizeConnection };
