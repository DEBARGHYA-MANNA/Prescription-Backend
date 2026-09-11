function calculateAgeFromDateOfBirth(dateOfBirth, asOf = new Date()) {
  const birthDate = new Date(dateOfBirth);
  const referenceDate = new Date(asOf);

  let years = referenceDate.getUTCFullYear() - birthDate.getUTCFullYear();
  let months = referenceDate.getUTCMonth() - birthDate.getUTCMonth();

  if (referenceDate.getUTCDate() < birthDate.getUTCDate()) {
    months -= 1;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months };
}

function createPatientSnapshot(patient, asOf = new Date()) {
  const patientObject = patient.toObject ? patient.toObject() : patient;
  const hasDateOfBirth = Boolean(patientObject.age?.dateOfBirth);
  const age = hasDateOfBirth
    ? calculateAgeFromDateOfBirth(patientObject.age.dateOfBirth, asOf)
    : {
      years: patientObject.age?.years,
      months: patientObject.age?.months ?? 0,
    };

  return {
    fullName: patientObject.fullName,
    phone: patientObject.phone,
    age: {
      years: age.years,
      months: age.months,
      dateOfBirth: patientObject.age?.dateOfBirth || null,
    },
    sex: patientObject.sex,
    maritalStatus: patientObject.maritalStatus,
    occupation: patientObject.occupation,
    email: patientObject.email,
    address: patientObject.address,
    knownAllergies: patientObject.knownAllergies,
    priorHealthProblems: patientObject.priorHealthProblems,
    priorSurgeries: patientObject.priorSurgeries,
    numberOfChildren: patientObject.numberOfChildren,
  };
}

module.exports = { calculateAgeFromDateOfBirth, createPatientSnapshot };
