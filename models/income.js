const { DataTypes } = require("sequelize");
const db = require("../utils/database");
const Income = db.define(
  "income",
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
      allowNull: false,
    },

    earnings: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    income_description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: DataTypes.DATE,
  },
  { timestamps: false }
);
module.exports = Income;
