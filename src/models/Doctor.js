const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { templateIds } = require('../data/prescriptionTemplates');

const doctorProfileSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 30, default: 'Dr.' },
    clinicName: { type: String, trim: true, maxlength: 120, default: '' },
    specialization: { type: String, trim: true, maxlength: 120, default: '' },
    qualifications: { type: String, trim: true, maxlength: 200, default: '' },
    registrationNumber: { type: String, trim: true, maxlength: 80, default: '' },
    phone: { type: String, trim: true, maxlength: 30, default: '' },
    clinicPhone: { type: String, trim: true, maxlength: 30, default: '' },
    addressLine1: { type: String, trim: true, maxlength: 150, default: '' },
    addressLine2: { type: String, trim: true, maxlength: 150, default: '' },
    city: { type: String, trim: true, maxlength: 80, default: '' },
    state: { type: String, trim: true, maxlength: 80, default: '' },
    postalCode: { type: String, trim: true, maxlength: 30, default: '' },
    country: { type: String, trim: true, maxlength: 80, default: '' },
    logoUrl: { type: String, trim: true, maxlength: 2048, default: '' },
    signatureUrl: { type: String, trim: true, maxlength: 2048, default: '' },
    footerNote: { type: String, trim: true, maxlength: 300, default: '' },
    selectedTemplate: {
      type: String,
      enum: templateIds,
      default: 'classic',
    },
  },
  { _id: false },
);

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    profile: {
      type: doctorProfileSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

doctorSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

doctorSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Doctor', doctorSchema);
