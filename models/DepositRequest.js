import { DataTypes, Model } from "sequelize";
import sequelize from "../config/db.js";
import User from "./User.js"; // Import the User model

class DepositRequest extends Model {}

DepositRequest.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    AccountID: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Deposit_mode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    image_proof: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "Pending",
    },
  },
  {
    sequelize,
    modelName: "DepositRequest",
    tableName: "deposit_requests",
    timestamps: true,
  }
);

// Establish a foreign key relationship
DepositRequest.belongsTo(User, { foreignKey: 'AccountID', targetKey: 'AccountID' });

export default DepositRequest;
