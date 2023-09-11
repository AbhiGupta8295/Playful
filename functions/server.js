require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const AllSongs = require('../models/allSongs');
const Users = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const serverless = require('serverless-http');

if (process.env.NODE_ENV !== 'production') { 
    require('dotenv').config(); 
  } 

const app = express();
const port = process.env.PORT || 5001; // You can choose any port number you prefer

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
const router = express.Router();

mongoose.connect(process.env.CONN_DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

const secretKey = process.env.SECRET_KEY;


router.post('/allsongs', async (req, res) => {
  const token = req.body.token;
  const decoded = jwt.verify(token, secretKey);
  try {
    if (decoded) {
      res.json(true);
    }
  } catch (error) {
    console.error("Error: Invalid token", error);
  }
});


router.get('/allsongs/:input', async (req, res) => {
  // Retrieve searched song from the "allsongs" collection
  const {input}  = req.params;
  const { type }  = req.query;
  // console.log(type);
  // console.log(input);
  const nameRegex = new RegExp('^' + input, 'i');
  // console.log(nameRegex);
  const songs = await AllSongs.find({ [type] : nameRegex });
  // console.log(songs);
  res.json(songs);
});


router.post('/users/signup', async (req, res) => {
  const { username, password, selectedOption, answer } = req.body;

  const validuser = await Users.findOne({ username: username });
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // Save the new user to the database
  if (!validuser) {
    const newUser = new Users({
      username,
      password: hash,
      question: selectedOption,
      answer
    });
    await newUser.save();
    res.json(true);
  }
  else {
    res.json(false);
  }
});


router.post('/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const validUser = await Users.findOne({ username: username });
    if (!validUser) {
      return res.status(401).json(false);
    }

    const isPasswordValid = await bcrypt.compare(password, validUser.password);

    if (!isPasswordValid) {
      return res.status(401).json(false);
    }
    const token = jwt.sign({ username: validUser.username }, secretKey);
      res.status(200).json(token);

  } catch (error) {
    res.status(500).json({ message: "Error logging in." });
  }
});


router.post('/users/reset', async (req, res) => {
  const { username, selectedOption, answer, password } = req.body
  const validUser = await Users.findOne({ username: username });

  if (!validUser) {
    return res.status(402).json(false);
  }
  if (validUser.question === selectedOption) {
    if (validUser.answer === answer) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      await Users.findOneAndUpdate({ username: username }, { password: hash });
      res.json(true);
    }
    else {
      res.status(401).json(false);
      res.json("Wrong Combinations...")
    }
  }
});


// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

app.use('/.netlify/functions/server',router);

module.exports.handler = serverless(app);