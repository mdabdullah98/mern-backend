const express = require("express");
const userRouter = express.Router();
const userControler = require("../controller/user");

userRouter
  .post("/user/signup", userControler.signup)
  .post("/user/login", userControler.login)
  .post("/user/expense", userControler.addExpenseToDB)
  .post("/user/income", userControler.addIncomeToDB)
  .get("/user/getExpenseAndIncome", userControler.getExpenseAndIncome)
  .get("/user/getUserDeatils", userControler.getUSer)
  .get("/user/get_total_expense", userControler.getTotalExpense)
  .get("/user/download_expense/:id", userControler.downloadExpense)
  .delete("/user/deleteExpense/:id", userControler.deleteExpense);
// .post("/user/getIncomes", userControler.getIncomes);
module.exports = userRouter;
