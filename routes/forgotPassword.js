const express = require("express");
const forgotPasswordRouter = express.Router();
const ForgotPasswordController = require("../controller/forgotPassword");
const path = require("path");

const authMiddle = (req, res, next) => {
  console.log("req.body", req.body);
  req.user = req.body.email;
  next();
};

forgotPasswordRouter
  // .get(
  //   "/password/authenticate_link/:id",
  //   ForgotPasswordController.authenticateLink
  // )
  .post(
    "/password/email_verification",

    ForgotPasswordController.emailVerifiaction
  )
  .post(
    "/password/forgotpassword",

    ForgotPasswordController.ForgotPassword
  )
  .post("/password/update_password", ForgotPasswordController.updatePassword);
// .get("/password/reset_password/:id", ForgotPasswordController.showReserForm)
module.exports = forgotPasswordRouter;
