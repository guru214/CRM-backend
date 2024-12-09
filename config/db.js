
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

// Create Sequelize instance
const sequelize = new Sequelize(
  "server_crm", 
  "root", 
  // "SHA#1113#sha", //Sohail
  "Npminit@12",  //Anwaar
  {
    host:  'localhost',
    dialect: 'mysql',
    // port:  5000,  //Sohail
    port: 3300, //Anwaar
    
  }
);

// Export the sequelize instance for use in models and other files
export default sequelize;
