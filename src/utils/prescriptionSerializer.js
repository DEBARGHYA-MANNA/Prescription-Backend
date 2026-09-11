function serializePrescription(prescription) {
  return {
    id: prescription._id.toString(),
    patientId: prescription.patient.toString(),
    prescriptionDate: prescription.prescriptionDate,
    status: prescription.status,
    sectionSettings: prescription.sectionSettings,
    content: prescription.content,
    patientSnapshot: prescription.patientSnapshot,
    doctorSnapshot: prescription.doctorSnapshot,
    signature: prescription.signature,
    finalizedAt: prescription.finalizedAt,
    createdAt: prescription.createdAt,
    updatedAt: prescription.updatedAt,
  };
}

module.exports = { serializePrescription };
