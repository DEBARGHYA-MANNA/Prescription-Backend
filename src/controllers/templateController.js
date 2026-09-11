const { prescriptionTemplates } = require('../data/prescriptionTemplates');

function listTemplates(req, res) {
  res.status(200).json({
    success: true,
    data: { templates: prescriptionTemplates },
  });
}

module.exports = { listTemplates };
