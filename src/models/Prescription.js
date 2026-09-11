const mongoose = require('mongoose');
const { prescriptionSectionIds, defaultSectionSettings } = require('../data/prescriptionSections');

const sectionSettingSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, enum: prescriptionSectionIds },
    enabled: { type: Boolean, required: true, default: true },
    order: { type: Number, required: true, min: 1, max: prescriptionSectionIds.length },
  },
  { _id: false },
);

const repertoryRubricSchema = new mongoose.Schema(
  {
    rubric: { type: String, required: true, trim: true, maxlength: 500 },
    grade: { type: Number, required: true, min: 1, max: 4 },
    notes: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { _id: false },
);

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    potency: { type: String, trim: true, maxlength: 100, default: '' },
    dosage: { type: String, trim: true, maxlength: 200, default: '' },
    frequency: { type: String, trim: true, maxlength: 200, default: '' },
    duration: { type: String, trim: true, maxlength: 200, default: '' },
    instructions: { type: String, trim: true, maxlength: 1000, default: '' },
  },
  { _id: false },
);

const contentSchema = new mongoose.Schema(
  {
    caseHistory: {
      chiefComplaint: { type: String, trim: true, maxlength: 3000, default: '' },
      historyOfPresentIllness: { type: String, trim: true, maxlength: 6000, default: '' },
    },
    clinicalAssessment: {
      symptoms: { type: String, trim: true, maxlength: 4000, default: '' },
      modalitiesAggravatedBy: { type: String, trim: true, maxlength: 4000, default: '' },
      amelioratedBy: { type: String, trim: true, maxlength: 4000, default: '' },
      mentalEmotionalGenerals: { type: String, trim: true, maxlength: 4000, default: '' },
    },
    repertory: { type: [repertoryRubricSchema], default: [] },
    dietaryRestrictions: { type: String, trim: true, maxlength: 4000, default: '' },
    investigationAdvice: { type: [{ type: String, trim: true, maxlength: 500 }], default: [] },
    prescribedMedicines: { type: [medicineSchema], default: [] },
    generalAdvice: { type: String, trim: true, maxlength: 4000, default: '' },
    followUpAndReporting: {
      instructions: { type: String, trim: true, maxlength: 4000, default: '' },
      followUpDate: { type: Date, default: null },
    },
  },
  { _id: false },
);

const patientSnapshotSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, default: '' },
    age: {
      years: { type: Number, default: null },
      months: { type: Number, default: null },
      dateOfBirth: { type: Date, default: null },
    },
    sex: { type: String, required: true },
    maritalStatus: { type: String, required: true },
    occupation: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    knownAllergies: { type: String, required: true },
    priorHealthProblems: { type: String, required: true },
    priorSurgeries: { type: String, required: true },
    numberOfChildren: { type: String, required: true },
  },
  { _id: false },
);

const doctorSnapshotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    title: { type: String, required: true },
    clinicName: { type: String, default: '' },
    specialization: { type: String, default: '' },
    qualifications: { type: String, default: '' },
    registrationNumber: { type: String, default: '' },
    phone: { type: String, default: '' },
    clinicPhone: { type: String, default: '' },
    addressLine1: { type: String, default: '' },
    addressLine2: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    signatureUrl: { type: String, default: '' },
    footerNote: { type: String, default: '' },
    selectedTemplate: { type: String, required: true },
  },
  { _id: false },
);

const signatureSchema = new mongoose.Schema(
  {
    doctorName: { type: String, required: true, trim: true },
    signatureUrl: { type: String, trim: true, default: '' },
    signedAt: { type: Date, default: null },
  },
  { _id: false },
);

const prescriptionSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      immutable: true,
      index: true,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      immutable: true,
      index: true,
    },
    prescriptionDate: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ['draft', 'finalized'], default: 'draft', index: true },
    sectionSettings: {
      type: [sectionSettingSchema],
      default: defaultSectionSettings,
    },
    content: {
      type: contentSchema,
      default: () => ({}),
    },
    patientSnapshot: { type: patientSnapshotSchema, required: true },
    doctorSnapshot: { type: doctorSnapshotSchema, required: true },
    signature: { type: signatureSchema, required: true },
    finalizedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

prescriptionSchema.index({ doctor: 1, patient: 1, prescriptionDate: -1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
