function serializeDoctor(doctor) {
  return {
    id: doctor._id.toString(),
    name: doctor.name,
    email: doctor.email,
    profile: doctor.profile || {},
    createdAt: doctor.createdAt,
    updatedAt: doctor.updatedAt,
  };
}

module.exports = { serializeDoctor };
