const db = require("../utils/database");
const { Sequelize } = require("sequelize");

const ForgotPassword = db.define(
  "forgotPassword",
  {
    id: {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
    },
    isActive: Sequelize.BOOLEAN,
    expiresBy: Sequelize.DATE,
  },
  { timestamps: false }
);
module.exports = ForgotPassword;
