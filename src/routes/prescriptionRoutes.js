const express = require('express');
const {
  createPrescription,
  listPrescriptionsForPatient,
  getPrescription,
  updatePrescription,
} = require('../controllers/prescriptionController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const {
  prescriptionCreateSchema,
  prescriptionUpdateSchema,
} = require('../validation/prescriptionSchemas');

const router = express.Router();

router.use(authenticate);
router.get('/', listPrescriptionsForPatient);
router.post('/', validate(prescriptionCreateSchema), createPrescription);
router.get('/:prescriptionId', getPrescription);
router.patch('/:prescriptionId', validate(prescriptionUpdateSchema), updatePrescription);

module.exports = router;
