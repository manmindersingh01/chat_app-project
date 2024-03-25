const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const ws = require('ws');



const app = express();
app.use(cors({
  credentials: true,
  origin: 'http://localhost:5175'
}));
app.use(express.json());
app.use(cookieParser());
const key = process.env.SEACRET;

mongoose.connect(process.env.MONGO_URL);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/profile', (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, key, {}, (err, userdata) => {
      if (err) throw err;

      res.json({
        userdata
      });
    });
  } else {
    res.status(401).json('no token provided');
  }
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  const hashedPass = bcrypt.hashSync(password, bcrypt.genSaltSync(8));

  const createdUser = await User.create({ username, password: hashedPass });
  jwt.sign({ userId: createdUser._id, username }, key, {}, (err, token) => {
    if (err) {
      throw err;
    }
    res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true }).status(201).json({
      id: createdUser._id
    });
  });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });
  if (foundUser) {
    const isMatch = bcrypt.compareSync(password, foundUser.password);
    if (isMatch) {
      jwt.sign({ userId: foundUser._id, username }, key, {}, (err, token) => {
        if (err) {
          throw err;
        }
        res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true }).status(201).json({
          id: foundUser._id
        });
      });
    }
  }
});

const server = app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

const wss = new ws.WebSocketServer({ server })

wss.on('connection', (connection, req) => {
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookiestring = cookies.split(";").find(str => str.startsWith('token='));
    // console.log(tokenCookiestring);
    if (tokenCookiestring) {
      const token = tokenCookiestring.split("=")[1];
      jwt.verify(token, key, {}, (err, userdata) => {
        if (err) throw err;
        console.log(userdata);
        const { userId, username } = userdata;
        connection.userId = userId;
        connection.username = username;

      });
    }
  }

  console.log('connected')
  connection.send('hello there')
})