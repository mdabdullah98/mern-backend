const { DataTypes } = require("sequelize");
const db = require("../utils/database");
const Expense = db.define(
  "expense",
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

    spent: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    describe: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    catagory: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: DataTypes.DATE,
  },
  { timestamps: false }
);
module.exports = Expense;
