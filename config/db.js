
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Create Sequelize instance
const sequelize = new Sequelize(
  "server_crm", 
  "root", 
  // "SHA#1113#sha", //sohail
  // "Npminit@12", //anwaar
  "Sainaidu#2000", //sailaxmi
  {
    host:  'localhost',
    dialect: 'mysql',
    // port:  5000, //sohail
    // port: 3300, //anwaar
    port: 3306, //sailaxmi
  }
);

// Export the sequelize instance for use in models and other files
export default sequelize;
