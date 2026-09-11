const assert = require('node:assert/strict');
const test = require('node:test');
const { defaultSectionSettings, prescriptionSectionIds } = require('../src/data/prescriptionSections');
const { normalizePhone } = require('../src/utils/phone');
const {
  preparePatientCreateInput,
  preparePatientUpdateInput,
} = require('../src/utils/patientInput');
const { calculateAgeFromDateOfBirth } = require('../src/utils/patientSnapshot');
const { patientCreateSchema } = require('../src/validation/patientSchemas');
const { prescriptionCreateSchema } = require('../src/validation/prescriptionSchemas');

test('phone lookup treats common display formatting as the same number', () => {
  assert.equal(normalizePhone('+91 98765-43210'), '+919876543210');
  assert.equal(normalizePhone('+91 (98765) 43210'), '+919876543210');
  assert.equal(normalizePhone('123'), null);
});

test('patient optional fields receive unambiguous defaults on registration', () => {
  const patient = preparePatientCreateInput({ maritalStatus: 'married' });

  assert.equal(patient.email, 'NA');
  assert.equal(patient.knownAllergies, 'Not Known');
  assert.equal(patient.priorHealthProblems, 'Not Known');
  assert.equal(patient.priorSurgeries, 'Not Known');
  assert.equal(patient.numberOfChildren, 'Not Known');
});

test('changing a patient to a non-family marital status makes children not applicable', () => {
  const patient = preparePatientUpdateInput(
    { maritalStatus: 'single' },
    'married',
    '2',
  );

  assert.equal(patient.numberOfChildren, 'Not Applicable');
});

test('age snapshot is calculated from date of birth at prescription time', () => {
  const age = calculateAgeFromDateOfBirth('2000-06-15T00:00:00.000Z', '2026-09-11T00:00:00.000Z');

  assert.deepEqual(age, { years: 26, months: 2 });
});

test('a patient requires either age years or date of birth', () => {
  const patient = {
    phone: '+919876543210',
    fullName: 'Riya Sharma',
    age: {},
    sex: 'female',
    maritalStatus: 'single',
    occupation: 'Teacher',
    address: 'Kolkata',
  };

  assert.equal(patientCreateSchema.safeParse(patient).success, false);
});

test('all prescription sections are enabled and ordered by default', () => {
  const settings = defaultSectionSettings();

  assert.deepEqual(settings.map((setting) => setting.id), prescriptionSectionIds);
  assert.ok(settings.every((setting, index) => setting.enabled && setting.order === index + 1));
});

test('prescription section settings reject duplicate sections', () => {
  const duplicateSettings = defaultSectionSettings();
  duplicateSettings[8] = { ...duplicateSettings[8], id: 'caseHistory' };

  const result = prescriptionCreateSchema.safeParse({
    patientId: '507f1f77bcf86cd799439011',
    sectionSettings: duplicateSettings,
  });

  assert.equal(result.success, false);
});

test('patient and prescription models create valid local records with their defaults', () => {
  const mongoose = require('mongoose');
  const Patient = require('../src/models/Patient');
  const Prescription = require('../src/models/Prescription');
  const doctorId = new mongoose.Types.ObjectId();
  const patientId = new mongoose.Types.ObjectId();

  const patient = new Patient({
    doctor: doctorId,
    phone: '+91 98765 43210',
    phoneNormalized: '+919876543210',
    fullName: 'Riya Sharma',
    age: { years: 32, months: 4 },
    sex: 'female',
    maritalStatus: 'single',
    occupation: 'Teacher',
    address: 'Kolkata',
  });
  assert.equal(patient.validateSync(), undefined);
  assert.equal(patient.email, 'NA');
  assert.equal(patient.knownAllergies, 'Not Known');

  const prescription = new Prescription({
    doctor: doctorId,
    patient: patientId,
    patientSnapshot: {
      fullName: 'Riya Sharma', phone: '+91 98765 43210', age: { years: 32, months: 4 },
      sex: 'female', maritalStatus: 'single', occupation: 'Teacher', email: 'NA', address: 'Kolkata',
      knownAllergies: 'Not Known', priorHealthProblems: 'Not Known', priorSurgeries: 'Not Known',
      numberOfChildren: 'Not Applicable',
    },
    doctorSnapshot: {
      name: 'Aisha Khan', email: 'aisha@example.com', title: 'Dr.', clinicName: '', specialization: '',
      qualifications: '', registrationNumber: '', phone: '', clinicPhone: '', addressLine1: '',
      addressLine2: '', city: '', state: '', postalCode: '', country: '', logoUrl: '', signatureUrl: '',
      footerNote: '', selectedTemplate: 'classic',
    },
    signature: { doctorName: 'Dr. Aisha Khan' },
  });
  assert.equal(prescription.validateSync(), undefined);
  assert.equal(prescription.status, 'draft');
  assert.equal(prescription.sectionSettings.length, 9);
});
