require("dotenv").config();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Expense = require("../models/expense");
const Income = require("../models/income");
const Order = require("../models/order");
const jwt = require("jsonwebtoken");
const aws = require("aws-sdk");

const verifyJwt = (token) => {
  return jwt.verify(token, process.env.SECRET);
};

// store the data to the database so the siguped user can login next time
exports.signup = async (req, res) => {
  const { username, email, psw } = req.body;
  const saltRounds = 10;
  try {
    const user = await User.findOne({ where: { email: email } });
    // console.log("use", userSigned);

    var token = jwt.sign({ email: email }, process.env.SECRET);

    bcrypt.hash(psw, saltRounds, async function (err, hash) {
      // Store hashed password to the DB.

      if (err) throw Error(err);
      const user = await User.create({
        username,
        email,
        psw: hash,
        token: token,
      });

      res.json({ success: true, message: "sign up  succesfully" });
    });
  } catch (err) {
    res
      .status(400)
      .send({ err: err, message: "someting went wrong ", success: false });
  }
};

exports.login = async (req, res) => {
  const { email, psw } = req.body;

  try {
    //find user accroding to the email which is coming in the req.body if no user found then goin in else part
    const user = await User.findOne({ where: { email: email } });
    if (user) {
      //comparing the password if the hash password is === to req.body.psw then seingin res.json(user.token); else res.status(401).json("password is incorrect");

      bcrypt.compare(psw, user.psw, function (err, result) {
        if (err) throw Error(err);
        if (result) {
          res.json(user.token);
        } else {
          res.status(401).json("password is incorrect");
        }
      });
    } else {
      res.status(404).json("email does not exist");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// //accroding to login user I am stroing income into the databse .Here i used  post request to this api endpoint axios.post('http://localhost:8080/user/income), after hitting the backend routes storing the income into the income table.storing the Expense according the logged userid so that when we doing get request on expense table so send only that user data which is logged in

exports.addExpenseToDB = async (req, res) => {
  const input = req.body.input;
  const { spent, describe, catagory } = input;
  const { token } = req.body;
  const { email } = verifyJwt(token);

  try {
    const user = await User.findOne({ where: { email: email } });
    const expense = await Expense.findOne({
      where: { email: email, catagory: catagory },
    });
    if (!expense) {
      const expense = await Expense.create({
        username: user.username,
        email: user.email,
        spent: Number(spent),
        describe,
        catagory,
        date: new Date(Date.now()),
        userId: user.id,
      });
    } else {
      await expense.update({
        spent: expense.spent + Number(spent),
        describe: describe,
      });
      await expense.save();
    }

    await user.update({ total_expense: user.total_expense + Number(spent) });
    await user.save();

    // res.resdirect(301, "http://localhost:5173/");
    return res.status(200).json({ succes: true, message: "added succesfully" });
  } catch (err) {
    res.status(500).json({
      err: err,
      succes: false,
      message: "something went wrong please try again",
    });
  }
};

//accroding to login user I am stroing income into the databse .Here i used  post request to this api endpoint axios.post('http://localhost:8080/user/income), after hitting the backend routes storing the income into the income table.Storing the income according the logged userid so that when we doing get request on income table so send only that user data which is logged in user.
exports.addIncomeToDB = async (req, res) => {
  const { input } = req.body;
  const { earnings, describe } = input;
  const { token } = req.body;
  const { email } = verifyJwt(token);
  try {
    //find the user accrdoing to email so that i can set the userid column according to logged in user
    const user = await User.findOne({ where: { email: email } });
    if (user) {
      await Income.create({
        username: user.username,
        email: user.email,
        earnings: +earnings,
        income_description: describe,
        date: new Date(Date.now()),
        userId: user.id,
      });
    }
    // here updating the total incom column
    await user.update({
      total_income: user.total_income + +earnings,
    });
    user.save();
    // res.resdirect(301, "http://localhost:5173/");
    return res.status(200).json({ succes: true, message: "added succesfully" });
  } catch (err) {
    res.status(500).json({
      err: err,
      succes: false,
      message: "something went wrong please try again",
    });
  }
};

// when user hit login button get the data accodring to email id and then
//using bycrypt.campare method and comparing the stored password in database with the typed password by the user which is commin in req.body

// getExpenseAndIncome this function getting all the expense ,income and user  accroding to logged in user
// this function acces three tables and return all three tables data at once so that i dont have to multiple request to the server

exports.getExpenseAndIncome = async (req, res) => {
  const token = req.get("Authorization");
  const { email } = verifyJwt(token);

  try {
    const user = await User.findOne({ where: { email: email } });

    const dataExpense = await User.findByPk(user.id, {
      include: [
        {
          model: Expense,
          attributes: ["spent", "describe", "catagory", "date", "id"], // You can specify which attributes you want to retriev
        },
        {
          model: Income,
          attributes: ["earnings", "income_description", "date", "id"], // You can specify which attributes you want to retrieve
        },
      ],
    });
    if (dataExpense) {
      res.status(200).json({
        expenseAndIncome: dataExpense,
        user: {
          id: user.id,
          total_expense: user.total_expense,
          total_income: user.total_income,
        },
      });
    } else {
      res.json("did not get any expenses and income");
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

// get user detials for the razor payment option which will open a wondow and showing user details

exports.getUSer = async (req, res) => {
  try {
    const token = req.get("Authorization");
    const { email } = verifyJwt(token);
    const user = await User.findOne({ where: { email: email } });
    const order = await Order.findOne({
      where: { userId: user.id, payment_status: "success" },
    });

    // if no user found just send user not found with status code in response
    if (!user) {
      res.status(404).send("user not found");
    }

    // inside the home componnet i am usin razor option object that carring lots information realted to the razorpay payment and it need api key_id which i stord in the backed for the safe purpose that also sending alonf with user details, so sending all this down data as resonse when user click on buy premium button
    res.status(200).json({
      username: user.username,
      email: user.email,
      key_ID: process.env.RAZORPAYKEYID,
      id: user.id,
      order_id: order ? order.order_id : "",
      payment_status: order ? order.payment_status : "",
    });
  } catch (err) {
    res.status(500).json({ err: err, message: "something goes wrong" });
  }
};

exports.getTotalExpense = async (req, res) => {
  try {
    const aggregrateExpense = await User.findAll({
      attributes: ["username", "total_expense"],
      order: [["total_expense", "DESC"]],
    });

    res.status(200).json(aggregrateExpense);
  } catch (err) {
    res.status(400).json({ err: err, message: "something goes wrong" });
  }
};

//if expense found then  using desotry method on foudn expense. adn updating the user total_expense and decreasing the amound  by deleted expnense.amount.
exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  try {
    //finde the expense and Getting the user table laso so that i can update the total_expense column in user table
    const expense = await Expense.findByPk(id);
    const user = await User.findByPk(expense.userId);

    // If no expense found so sending this returning return  res.status(404).send("expense not found"); .Why am I using return ? becouase if no expense foudn then do not  need to executing ferther.
    if (!expense) {
      return res.status(404).send("expense not found");
    }

    // Deleting the expense accoring the id , first i find the expense using user sequelize findbyPk method from expense table.
    const deletedExpense = await expense.destroy();
    // updating user total expense when deleting ecpense so the amount should also be decrease

    await user.update({
      total_expense: user.total_expense - expense.spent,
    });
    await user.save();

    res.status(200).json(deletedExpense);
  } catch (err) {
    res.status(500).json({ err: err, message: "someting went wrong" });
  }
};

//download expense
const uploadToS3Bucket = (data, filename) => {
  let s3Bucket = new aws.S3({
    accessKeyId: process.env.AWSIAMUSERACCESSKEY,
    secretAccessKey: process.env.AWSIAMUSERSECRETKEY,
  });
  const params = {
    Bucket: process.env.AWSS3BUCKETNAME,
    Key: filename,
    ACL: "public-read",
    Body: data,
  };
  return new Promise((resolve, reject) => {
    s3Bucket.upload(params, (err, s3Response) => {
      if (err) {
        reject();
      } else {
        resolve(s3Response.Location);
      }
    });
  });
};

exports.downloadExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const expense = await Expense.findAll({
      attributes: ["spent", "catagory", "describe"],
      where: { userId: id },
    });
    const stringiFiedExpense = JSON.stringify(expense);
    const filename = `expense_${id} / ${new Date()}`;
    const fileUrl = await uploadToS3Bucket(stringiFiedExpense, filename);

    res.status(200).json({ success: true, fileUrl });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "file url is emty", err: err });
  }
};
