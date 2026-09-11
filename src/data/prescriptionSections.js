const prescriptionSections = [
  {
    id: 'caseHistory',
    name: 'Case History',
    fields: ['Chief Complaint', 'History of Present Illness'],
  },
  {
    id: 'clinicalAssessment',
    name: 'Clinical Assessment',
    fields: [
      'Symptoms',
      'Modalities (Aggravated By)',
      'Ameliorated By',
      'Mental / Emotional Generals',
    ],
  },
  {
    id: 'repertory',
    name: 'Repertory',
    fields: ['Graded Rubrics'],
  },
  {
    id: 'dietaryRestrictions',
    name: 'Dietary Restrictions',
    fields: ['Dietary Restrictions'],
  },
  {
    id: 'investigationAdvice',
    name: 'Investigation Advice',
    fields: ['Recommended Tests'],
  },
  {
    id: 'prescribedMedicines',
    name: 'Prescribed Medicines',
    fields: ['Medicine Details'],
  },
  {
    id: 'generalAdvice',
    name: 'General Advice',
    fields: ['General Advice'],
  },
  {
    id: 'followUpAndReporting',
    name: 'Follow-up and Reporting',
    fields: ['Follow-up Date', 'Reporting Instructions'],
  },
  {
    id: 'digitalSignature',
    name: 'Digital Signature',
    fields: ['Doctor Signature'],
  },
];

const prescriptionSectionIds = prescriptionSections.map((section) => section.id);

function defaultSectionSettings() {
  return prescriptionSectionIds.map((id, index) => ({
    id,
    enabled: true,
    order: index + 1,
  }));
}

module.exports = {
  prescriptionSections,
  prescriptionSectionIds,
  defaultSectionSettings,
};
