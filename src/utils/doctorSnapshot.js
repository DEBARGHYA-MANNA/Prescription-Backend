function createDoctorSnapshot(doctor) {
  const profile = doctor.profile?.toObject ? doctor.profile.toObject() : (doctor.profile || {});

  return {
    name: doctor.name,
    email: doctor.email,
    title: profile.title || 'Dr.',
    clinicName: profile.clinicName || '',
    specialization: profile.specialization || '',
    qualifications: profile.qualifications || '',
    registrationNumber: profile.registrationNumber || '',
    phone: profile.phone || '',
    clinicPhone: profile.clinicPhone || '',
    addressLine1: profile.addressLine1 || '',
    addressLine2: profile.addressLine2 || '',
    city: profile.city || '',
    state: profile.state || '',
    postalCode: profile.postalCode || '',
    country: profile.country || '',
    logoUrl: profile.logoUrl || '',
    signatureUrl: profile.signatureUrl || '',
    footerNote: profile.footerNote || '',
    selectedTemplate: profile.selectedTemplate || 'classic',
  };
}

module.exports = { createDoctorSnapshot };
