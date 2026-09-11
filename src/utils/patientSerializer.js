function serializePatient(patient) {
  return {
    id: patient._id.toString(),
    phone: patient.phone,
    fullName: patient.fullName,
    age: patient.age,
    sex: patient.sex,
    maritalStatus: patient.maritalStatus,
    occupation: patient.occupation,
    email: patient.email,
    address: patient.address,
    knownAllergies: patient.knownAllergies,
    priorHealthProblems: patient.priorHealthProblems,
    priorSurgeries: patient.priorSurgeries,
    numberOfChildren: patient.numberOfChildren,
    createdAt: patient.createdAt,
    updatedAt: patient.updatedAt,
  };
}

module.exports = { serializePatient };
