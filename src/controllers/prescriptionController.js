const mongoose = require('mongoose');
const Prescription = require('../models/Prescription');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { findOwnedPatient } = require('./patientController');
const { createPatientSnapshot } = require('../utils/patientSnapshot');
const { createDoctorSnapshot } = require('../utils/doctorSnapshot');
const { serializePrescription } = require('../utils/prescriptionSerializer');

function createSignatureSnapshot(doctor, signedAt = null) {
  const title = doctor.profile?.title || 'Dr.';
  return {
    doctorName: `${title} ${doctor.name}`.trim(),
    signatureUrl: doctor.profile?.signatureUrl || '',
    signedAt,
  };
}

function sortSectionSettings(settings) {
  return [...settings].sort((first, second) => first.order - second.order);
}

function applyContentUpdate(prescription, contentUpdate) {
  for (const [section, value] of Object.entries(contentUpdate)) {
    if (Array.isArray(value) || typeof value === 'string') {
      prescription.set(`content.${section}`, value);
    } else {
      Object.assign(prescription.content[section], value);
    }
  }
  prescription.markModified('content');
}

async function findOwnedPrescription(doctorId, prescriptionId) {
  if (!mongoose.isObjectIdOrHexString(prescriptionId)) {
    throw new AppError('Prescription identifier is invalid.', 400);
  }

  const prescription = await Prescription.findOne({ _id: prescriptionId, doctor: doctorId });
  if (!prescription) {
    throw new AppError('Prescription not found.', 404);
  }
  return prescription;
}

const createPrescription = asyncHandler(async (req, res) => {
  const patient = await findOwnedPatient(req.doctor._id, req.body.patientId);
  const isFinalized = req.body.status === 'finalized';
  const finalizedAt = isFinalized ? new Date() : null;

  const prescription = await Prescription.create({
    doctor: req.doctor._id,
    patient: patient._id,
    prescriptionDate: req.body.prescriptionDate || new Date(),
    status: req.body.status || 'draft',
    sectionSettings: req.body.sectionSettings ? sortSectionSettings(req.body.sectionSettings) : undefined,
    content: req.body.content,
    patientSnapshot: createPatientSnapshot(patient),
    doctorSnapshot: createDoctorSnapshot(req.doctor),
    signature: createSignatureSnapshot(req.doctor, finalizedAt),
    finalizedAt,
  });

  res.status(201).json({
    success: true,
    message: isFinalized ? 'Prescription finalized.' : 'Prescription draft saved.',
    data: { prescription: serializePrescription(prescription) },
  });
});

const listPrescriptionsForPatient = asyncHandler(async (req, res) => {
  const { patientId } = req.query;
  if (typeof patientId !== 'string') {
    throw new AppError('Send a patientId query parameter to list prescriptions.', 400);
  }

  await findOwnedPatient(req.doctor._id, patientId);
  const prescriptions = await Prescription.find({
    doctor: req.doctor._id,
    patient: patientId,
  }).sort({ prescriptionDate: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    data: { prescriptions: prescriptions.map(serializePrescription) },
  });
});

const getPrescription = asyncHandler(async (req, res) => {
  const prescription = await findOwnedPrescription(req.doctor._id, req.params.prescriptionId);

  res.status(200).json({
    success: true,
    data: { prescription: serializePrescription(prescription) },
  });
});

const updatePrescription = asyncHandler(async (req, res) => {
  const prescription = await findOwnedPrescription(req.doctor._id, req.params.prescriptionId);

  if (prescription.status === 'finalized') {
    throw new AppError('Finalized prescriptions are locked and cannot be changed.', 409);
  }

  if (req.body.prescriptionDate) {
    prescription.prescriptionDate = req.body.prescriptionDate;
  }
  if (req.body.sectionSettings) {
    prescription.sectionSettings = sortSectionSettings(req.body.sectionSettings);
  }
  if (req.body.content) {
    applyContentUpdate(prescription, req.body.content);
  }
  if (req.body.status === 'finalized') {
    const finalizedAt = new Date();
    prescription.status = 'finalized';
    prescription.finalizedAt = finalizedAt;
    prescription.signature = createSignatureSnapshot(req.doctor, finalizedAt);
  } else {
    prescription.signature = createSignatureSnapshot(req.doctor, null);
  }

  await prescription.save();

  res.status(200).json({
    success: true,
    message: prescription.status === 'finalized' ? 'Prescription finalized.' : 'Prescription draft saved.',
    data: { prescription: serializePrescription(prescription) },
  });
});

module.exports = {
  createPrescription,
  listPrescriptionsForPatient,
  getPrescription,
  updatePrescription,
};
