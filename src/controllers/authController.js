const Doctor = require('../models/Doctor');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { serializeDoctor } = require('../utils/doctorSerializer');
const { createAccessToken } = require('../utils/token');

const signUp = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const existingDoctor = await Doctor.exists({ email });

  if (existingDoctor) {
    throw new AppError('An account with this email address already exists.', 409);
  }

  const doctor = await Doctor.create({
    name: req.body.name,
    email,
    password: req.body.password,
  });

  const token = createAccessToken(doctor);

  res.status(201).json({
    success: true,
    message: 'Doctor account created.',
    data: {
      token,
      doctor: serializeDoctor(doctor),
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const doctor = await Doctor.findOne({ email }).select('+password');

  if (!doctor || !(await doctor.comparePassword(req.body.password))) {
    throw new AppError('Email or password is incorrect.', 401);
  }

  const token = createAccessToken(doctor);

  res.status(200).json({
    success: true,
    message: 'Signed in successfully.',
    data: {
      token,
      doctor: serializeDoctor(doctor),
    },
  });
});

const getCurrentDoctor = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: { doctor: serializeDoctor(req.doctor) },
  });
});

module.exports = { signUp, login, getCurrentDoctor };
