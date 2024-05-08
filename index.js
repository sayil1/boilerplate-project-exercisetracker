const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
require("dotenv").config();

try {
  mongoose.connect(
    "mongodb+srv://sayil:sayil2194@cluster0.vfeqcic.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0"
  );
} catch (error) {
  console.log(error);
}

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
});

const ExerciseSchema = new mongoose.Schema({
  uid: {
    type: String,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now, // Set current date as default
  },
});

const User = mongoose.model("Dog", UserSchema);
const Exercise = mongoose.model("Exercise", ExerciseSchema);

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});
app.get("/api/users", async (req, res) => {
  const allDogs = await User.find();
  return res.json(allDogs);
});

app.get("/api/ex", async (req, res) => {
  const allDogs = await Exercise.find();
  return res.json(allDogs);
});

app.post("/api/users", async (req, res) => {
  const newUser = new User({ ...req.body });
  try {
    const insertedUser = await newUser.save();
    return res.json(insertedUser);
  } catch (error) {
    console.log(error);
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  console.log(req.params);
  let { description, duration, date } = req.body;
  if (date === null) {
    date = new Date().now();
  }
  let userId = req.params._id;
  let nuser = await User.findOne({ _id: req.params._id });

  let newEx = new Exercise();
  newEx.uid = userId;
  newEx.description = description;
  newEx.date = date;
  newEx.duration = duration;
  console.log(newEx);
  let newDate = new Date(newEx.date).toDateString();
  return res.status(200).send({
    username: nuser.username,
    description: description,
    duration: Number(duration),
    _id: userId,
    date: newDate,
  });
});
app.post("/api/users", async (req, res) => {
  const newUser = new User({ ...req.body });
  try {
    const insertedUser = await newUser.save();
    return res.json(insertedUser);
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  console.log(req.query);
  let nuser = await User.findOne({ _id: req.params._id });
  const filter = {}; // Create an empty filter object

  if (req.query.from && req.query.to) {
    filter.date = {
      $gte: new Date(req.query.from), // Ensure valid dates
      $lt: new Date(req.query.to),
    };
  }

  const limit = req.query.limit ? parseInt(req.query.limit) : undefined; // Handle invalid limits
  let ex = await await Exercise.find(
    {
      uid: req.params._id,
      ...filter,
    },
    "-uid"
  ).limit(req.query.limit);

  ex.forEach((data) => {
    let newData = { ...data };
    newData._doc.date = data.date.toDateString();
    return newData._doc;
  });

  let newData = {};
  newData.log = ex;
  newData.username = nuser.username;
  newData._id = nuser._id;
  newData.count = ex.length || 0;

  return res.json(newData);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
