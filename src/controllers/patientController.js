const mongoose = require('mongoose');
const Patient = require('../models/Patient');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { normalizePhone } = require('../utils/phone');
const {
  preparePatientCreateInput,
  preparePatientUpdateInput,
  isFamilyMaritalStatus,
} = require('../utils/patientInput');
const { serializePatient } = require('../utils/patientSerializer');

function assertValidObjectId(id, label = 'Patient identifier') {
  if (!mongoose.isObjectIdOrHexString(id)) {
    throw new AppError(`${label} is invalid.`, 400);
  }
}

async function findOwnedPatient(doctorId, patientId) {
  assertValidObjectId(patientId);
  const patient = await Patient.findOne({ _id: patientId, doctor: doctorId });
  if (!patient) {
    throw new AppError('Patient not found.', 404);
  }
  return patient;
}

const findPatientsByPhone = asyncHandler(async (req, res) => {
  const phoneNormalized = normalizePhone(req.query.phone);
  if (!phoneNormalized) {
    throw new AppError('Send a valid phone number using the phone query parameter.', 400);
  }

  const patients = await Patient.find({
    doctor: req.doctor._id,
    phoneNormalized,
  }).sort({ updatedAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      phone: phoneNormalized,
      count: patients.length,
      patients: patients.map(serializePatient),
    },
  });
});

const createPatient = asyncHandler(async (req, res) => {
  const phoneNormalized = normalizePhone(req.body.phone);
  const patientInput = preparePatientCreateInput(req.body);

  if (Object.hasOwn(req.body, 'numberOfChildren') && !isFamilyMaritalStatus(req.body.maritalStatus)) {
    throw new AppError('Number of children is available only for married, widowed, or separated patients.', 400);
  }

  const patient = await Patient.create({
    ...patientInput,
    doctor: req.doctor._id,
    phone: req.body.phone.trim(),
    phoneNormalized,
  });

  res.status(201).json({
    success: true,
    message: 'Patient registered. Patients from the same family may share this phone number.',
    data: { patient: serializePatient(patient) },
  });
});

const getPatient = asyncHandler(async (req, res) => {
  const patient = await findOwnedPatient(req.doctor._id, req.params.patientId);

  res.status(200).json({
    success: true,
    data: { patient: serializePatient(patient) },
  });
});

const updatePatient = asyncHandler(async (req, res) => {
  const patient = await findOwnedPatient(req.doctor._id, req.params.patientId);
  const maritalStatus = req.body.maritalStatus || patient.maritalStatus;

  if (Object.hasOwn(req.body, 'numberOfChildren') && !isFamilyMaritalStatus(maritalStatus)) {
    throw new AppError('Number of children is available only for married, widowed, or separated patients.', 400);
  }

  const patientInput = preparePatientUpdateInput(
    req.body,
    patient.maritalStatus,
    patient.numberOfChildren,
  );

  if (patientInput.phone) {
    patient.phone = patientInput.phone.trim();
    patient.phoneNormalized = normalizePhone(patientInput.phone);
    delete patientInput.phone;
  }

  if (patientInput.age) {
    Object.assign(patient.age, patientInput.age);
    patient.markModified('age');
    delete patientInput.age;
  }

  Object.assign(patient, patientInput);
  await patient.save();

  res.status(200).json({
    success: true,
    message: 'Patient details saved.',
    data: { patient: serializePatient(patient) },
  });
});

module.exports = {
  findOwnedPatient,
  findPatientsByPhone,
  createPatient,
  getPatient,
  updatePatient,
};
