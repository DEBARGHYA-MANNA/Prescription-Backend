const mongoose = require('mongoose');

const ageSchema = new mongoose.Schema(
  {
    years: { type: Number, min: 0, max: 130, default: null },
    months: { type: Number, min: 0, max: 11, default: null },
    dateOfBirth: { type: Date, default: null },
  },
  { _id: false },
);

const patientSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      immutable: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    phoneNormalized: {
      type: String,
      required: true,
      trim: true,
      maxlength: 16,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    age: {
      type: ageSchema,
      required: true,
      default: () => ({}),
    },
    sex: {
      type: String,
      required: true,
      trim: true,
      maxlength: 40,
    },
    maritalStatus: {
      type: String,
      required: true,
      enum: ['single', 'married', 'widowed', 'separated', 'divorced', 'other'],
    },
    occupation: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      maxlength: 254,
      default: 'NA',
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    knownAllergies: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
      default: 'Not Known',
    },
    priorHealthProblems: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
      default: 'Not Known',
    },
    priorSurgeries: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
      default: 'Not Known',
    },
    numberOfChildren: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
      default: 'Not Applicable',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

patientSchema.index({ doctor: 1, phoneNormalized: 1, updatedAt: -1 });

module.exports = mongoose.model('Patient', patientSchema);
