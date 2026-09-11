const prescriptionTemplates = [
  {
    id: 'classic',
    name: 'Classic Clinical',
    description: 'A traditional, information-dense prescription with a formal header.',
    features: ['Prominent doctor credentials', 'Full clinic address', 'Dedicated signature area'],
  },
  {
    id: 'modern',
    name: 'Modern Care',
    description: 'A clean contemporary layout with balanced typography and generous spacing.',
    features: ['Minimal visual hierarchy', 'Contact-focused footer', 'Optional clinic logo'],
  },
  {
    id: 'minimal',
    name: 'Minimal Letterhead',
    description: 'A distraction-free format for concise prescriptions and compact printing.',
    features: ['Compact header', 'Clear medicine area', 'Small-print friendly'],
  },
];

const templateIds = prescriptionTemplates.map((template) => template.id);

module.exports = { prescriptionTemplates, templateIds };
