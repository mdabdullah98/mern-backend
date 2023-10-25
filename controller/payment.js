const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/order");

exports.paymentCheckout = async (req, res) => {
  const { username, email, id } = req.body;
  try {
    const instance = new Razorpay({
      key_id: process.env.RAZORPAYKEYID,
      key_secret: process.env.RAZORPAYSECRETKEY,
    });

    const options = {
      amount: 50000, // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11",
    };
    instance.orders.create(options, function (err, order) {
      if (err) throw Error(err);

      Order.create({
        order_id: order.id,
        amount: order.amount,
        payment_status: "pending",
        userId: id,
        username,
        email,
      });
      res.status(200).json(order);
    });
  } catch (err) {
    res.status(500).send("something went wrong");
  }
};

exports.paymentVerify = async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    username,
    email,
  } = req.body;
  // const findOrder = Order.findOne()

  const generatedSignature = crypto
    .createHmac("SHA256", process.env.RAZORPAYSECRETKEY)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  const isSignatureValid = generatedSignature == razorpay_signature;
  if (isSignatureValid) {
    const findOrder = await Order.findOne({
      where: { email: email, order_id: razorpay_order_id },
    });
    await findOrder.update({
      payment_status: "success",
    });
    await findOrder.save();

    // res.redirect(
    //   `http://localhost:5173/user/payment_success?refrence=${razorpay_payment_id}`
    // );
    res.status(200).send("payment sucessful");
  } else {
    res.status(400).json({ success: false, message: "payment did not verify" });
  }
};
