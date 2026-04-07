const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// register user
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    throw new Error('All fields required');

  const userExists = await User.findOne({ email });
  if (userExists)
    throw new Error('User already exists');

  const user = await User.create({ name, email, password });

  res.json({
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
});

// login user
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password)))
    throw new Error('Invalid credentials');

  res.json({
    name: user.name,
    email: user.email,
    token: generateToken(user._id),
  });
});

// get current user
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json(user);
});

module.exports = { register, login, getMe };