const { z } = require('zod');
const { normalizePhone } = require('../utils/phone');

const maritalStatuses = ['single', 'married', 'widowed', 'separated', 'divorced', 'other'];

const requiredText = (field, maxLength) => z.string()
  .trim()
  .min(1, `${field} is required.`)
  .max(maxLength, `${field} must be at most ${maxLength} characters.`);

const optionalText = (maxLength) => z.string().trim().max(maxLength).optional();

const phone = z.string()
  .trim()
  .min(1, 'Phone number is required.')
  .max(30)
  .refine((value) => Boolean(normalizePhone(value)), {
    message: 'Enter a valid phone number with 7 to 15 digits.',
  });

const dateOfBirth = z.coerce.date().refine((value) => value <= new Date(), {
  message: 'Date of birth cannot be in the future.',
});

const ageCreateSchema = z.object({
  years: z.number().int().min(0).max(130).optional(),
  months: z.number().int().min(0).max(11).optional(),
  dateOfBirth: dateOfBirth.optional(),
}).strict().superRefine((age, context) => {
  if (age.years === undefined && age.dateOfBirth === undefined) {
    context.addIssue({
      code: 'custom',
      path: ['years'],
      message: 'Provide age in years or a date of birth.',
    });
  }

  if (age.months !== undefined && age.years === undefined && age.dateOfBirth === undefined) {
    context.addIssue({
      code: 'custom',
      path: ['months'],
      message: 'Age in months must be accompanied by age in years or date of birth.',
    });
  }
});

const ageUpdateSchema = z.object({
  years: z.number().int().min(0).max(130).optional(),
  months: z.number().int().min(0).max(11).optional(),
  dateOfBirth: dateOfBirth.optional(),
}).strict().refine((age) => Object.keys(age).length > 0, {
  message: 'Send at least one age field to update.',
});

const numberOfChildren = z.union([
  z.number().int().min(0).max(30),
  z.string().trim().regex(/^(?:[0-9]|[12][0-9]|30)$/, 'Number of children must be between 0 and 30.'),
  z.literal(''),
]).optional();

const optionalEmail = z.string()
  .trim()
  .email('Enter a valid email address.')
  .max(254)
  .or(z.literal(''))
  .optional();

const sharedPatientFields = {
  phone,
  fullName: requiredText('Full name', 120),
  age: ageCreateSchema,
  sex: requiredText('Sex', 40),
  maritalStatus: z.enum(maritalStatuses),
  occupation: requiredText('Occupation', 120),
  email: optionalEmail,
  address: requiredText('Address', 500),
  knownAllergies: optionalText(2000),
  priorHealthProblems: optionalText(4000),
  priorSurgeries: optionalText(4000),
  numberOfChildren,
};

const patientCreateSchema = z.object(sharedPatientFields).strict();

const patientUpdateSchema = z.object({
  phone: sharedPatientFields.phone.optional(),
  fullName: sharedPatientFields.fullName.optional(),
  age: ageUpdateSchema.optional(),
  sex: sharedPatientFields.sex.optional(),
  maritalStatus: sharedPatientFields.maritalStatus.optional(),
  occupation: sharedPatientFields.occupation.optional(),
  email: optionalEmail,
  address: sharedPatientFields.address.optional(),
  knownAllergies: optionalText(2000),
  priorHealthProblems: optionalText(4000),
  priorSurgeries: optionalText(4000),
  numberOfChildren,
}).strict().refine((patient) => Object.keys(patient).length > 0, {
  message: 'Send at least one patient field to update.',
});

module.exports = {
  maritalStatuses,
  patientCreateSchema,
  patientUpdateSchema,
};
