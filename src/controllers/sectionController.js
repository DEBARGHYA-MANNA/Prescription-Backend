const { prescriptionSections } = require('../data/prescriptionSections');

function listPrescriptionSections(req, res) {
  res.status(200).json({
    success: true,
    data: { sections: prescriptionSections },
  });
}

module.exports = { listPrescriptionSections };
