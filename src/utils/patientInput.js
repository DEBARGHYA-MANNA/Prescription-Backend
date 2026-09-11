const OPTIONAL_PATIENT_DEFAULTS = {
  email: 'NA',
  knownAllergies: 'Not Known',
  priorHealthProblems: 'Not Known',
  priorSurgeries: 'Not Known',
};

function isBlank(value) {
  return typeof value === 'string' && value.trim() === '';
}

function preparePatientCreateInput(input) {
  const prepared = { ...OPTIONAL_PATIENT_DEFAULTS, ...input };

  for (const [field, fallback] of Object.entries(OPTIONAL_PATIENT_DEFAULTS)) {
    if (prepared[field] === undefined || isBlank(prepared[field])) {
      prepared[field] = fallback;
    }
  }

  prepared.numberOfChildren = input.numberOfChildren === undefined || isBlank(input.numberOfChildren)
    ? (isFamilyMaritalStatus(input.maritalStatus) ? 'Not Known' : 'Not Applicable')
    : String(input.numberOfChildren);

  return prepared;
}

function preparePatientUpdateInput(input, currentMaritalStatus, currentChildrenCount) {
  const prepared = { ...input };

  for (const [field, fallback] of Object.entries(OPTIONAL_PATIENT_DEFAULTS)) {
    if (Object.hasOwn(prepared, field) && isBlank(prepared[field])) {
      prepared[field] = fallback;
    }
  }

  const maritalStatus = prepared.maritalStatus || currentMaritalStatus;
  if (!isFamilyMaritalStatus(maritalStatus)) {
    prepared.numberOfChildren = 'Not Applicable';
  } else if (Object.hasOwn(prepared, 'numberOfChildren')) {
    prepared.numberOfChildren = isBlank(prepared.numberOfChildren)
      ? 'Not Known'
      : String(prepared.numberOfChildren);
  } else if (currentChildrenCount === 'Not Applicable') {
    prepared.numberOfChildren = 'Not Known';
  }

  return prepared;
}

function isFamilyMaritalStatus(maritalStatus) {
  return ['married', 'widowed', 'separated'].includes(maritalStatus);
}

module.exports = {
  OPTIONAL_PATIENT_DEFAULTS,
  preparePatientCreateInput,
  preparePatientUpdateInput,
  isFamilyMaritalStatus,
};
