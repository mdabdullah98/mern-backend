const express = require("express");
const paymentRouter = express.Router();
const paymentController = require("../controller/payment");

paymentRouter
  .post("/checkout/create_order", paymentController.paymentCheckout)
  .post("/paymentVerification", paymentController.paymentVerify);
module.exports = paymentRouter;
