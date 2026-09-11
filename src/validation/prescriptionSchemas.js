const { z } = require('zod');
const { prescriptionSectionIds } = require('../data/prescriptionSections');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Enter a valid identifier.');
const optionalText = (maxLength) => z.string().trim().max(maxLength).optional();
const prescriptionDate = z.coerce.date();

const sectionSettingsSchema = z.array(z.object({
  id: z.enum(prescriptionSectionIds),
  enabled: z.boolean(),
  order: z.number().int().min(1).max(prescriptionSectionIds.length),
}).strict()).length(prescriptionSectionIds.length).superRefine((settings, context) => {
  const ids = settings.map((setting) => setting.id);
  const orders = settings.map((setting) => setting.order);

  if (new Set(ids).size !== prescriptionSectionIds.length) {
    context.addIssue({
      code: 'custom',
      message: 'Section settings must contain every section exactly once.',
    });
  }
  if (new Set(orders).size !== prescriptionSectionIds.length) {
    context.addIssue({
      code: 'custom',
      message: 'Each section must have a unique display order.',
    });
  }
});

const contentSchema = z.object({
  caseHistory: z.object({
    chiefComplaint: optionalText(3000),
    historyOfPresentIllness: optionalText(6000),
  }).strict().optional(),
  clinicalAssessment: z.object({
    symptoms: optionalText(4000),
    modalitiesAggravatedBy: optionalText(4000),
    amelioratedBy: optionalText(4000),
    mentalEmotionalGenerals: optionalText(4000),
  }).strict().optional(),
  repertory: z.array(z.object({
    rubric: z.string().trim().min(1, 'Rubric is required.').max(500),
    grade: z.number().int().min(1).max(4),
    notes: optionalText(1000),
  }).strict()).max(100).optional(),
  dietaryRestrictions: optionalText(4000),
  investigationAdvice: z.array(z.string().trim().min(1).max(500)).max(50).optional(),
  prescribedMedicines: z.array(z.object({
    name: z.string().trim().min(1, 'Medicine name is required.').max(200),
    potency: optionalText(100),
    dosage: optionalText(200),
    frequency: optionalText(200),
    duration: optionalText(200),
    instructions: optionalText(1000),
  }).strict()).max(100).optional(),
  generalAdvice: optionalText(4000),
  followUpAndReporting: z.object({
    instructions: optionalText(4000),
    followUpDate: prescriptionDate.optional(),
  }).strict().optional(),
}).strict();

const prescriptionCreateSchema = z.object({
  patientId: objectId,
  prescriptionDate: prescriptionDate.optional(),
  status: z.enum(['draft', 'finalized']).optional(),
  sectionSettings: sectionSettingsSchema.optional(),
  content: contentSchema.optional(),
}).strict();

const prescriptionUpdateSchema = z.object({
  prescriptionDate: prescriptionDate.optional(),
  status: z.enum(['draft', 'finalized']).optional(),
  sectionSettings: sectionSettingsSchema.optional(),
  content: contentSchema.optional(),
}).strict().refine((prescription) => Object.keys(prescription).length > 0, {
  message: 'Send at least one prescription field to update.',
});

module.exports = {
  objectId,
  prescriptionCreateSchema,
  prescriptionUpdateSchema,
};
