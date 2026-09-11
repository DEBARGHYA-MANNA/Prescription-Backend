const express = require('express');
const { z } = require('zod');
const { templateIds } = require('../data/prescriptionTemplates');
const { getProfile, updateProfile } = require('../controllers/doctorController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

const router = express.Router();

const text = (maxLength) => z.string().trim().max(maxLength).optional();
const url = z.string().trim().url('Enter a valid URL.').max(2048).or(z.literal('')).optional();

const profileUpdateSchema = z.object({
  title: text(30),
  clinicName: text(120),
  specialization: text(120),
  qualifications: text(200),
  registrationNumber: text(80),
  phone: text(30),
  clinicPhone: text(30),
  addressLine1: text(150),
  addressLine2: text(150),
  city: text(80),
  state: text(80),
  postalCode: text(30),
  country: text(80),
  logoUrl: url,
  signatureUrl: url,
  footerNote: text(300),
  selectedTemplate: z.enum(templateIds).optional(),
}).strict().refine((profile) => Object.keys(profile).length > 0, {
  message: 'Send at least one profile field to update.',
});

router.use(authenticate);
router.get('/profile', getProfile);
router.put('/profile', validate(profileUpdateSchema), updateProfile);

module.exports = router;
