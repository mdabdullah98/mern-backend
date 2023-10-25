const { Sequelize } = require("sequelize");
require("dotenv").config();

const db = new Sequelize(
  process.env.DBNAME,
  process.env.DBUSERNAME,
  process.env.SEQUELIZEPASS,
  {
    host: process.env.DBHOST,
    dialect: "mysql",
  }
);

module.exports = db;
