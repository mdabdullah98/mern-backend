const { DataTypes } = require("sequelize");
const db = require("../utils/database");
const User = db.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    psw: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    token: DataTypes.TEXT,
    total_expense: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_income: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  { timestamps: false }
);
module.exports = User;
