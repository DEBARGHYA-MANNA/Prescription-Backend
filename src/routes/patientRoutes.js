const express = require('express');
const {
  findPatientsByPhone,
  createPatient,
  getPatient,
  updatePatient,
} = require('../controllers/patientController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { patientCreateSchema, patientUpdateSchema } = require('../validation/patientSchemas');

const router = express.Router();

router.use(authenticate);
router.get('/', findPatientsByPhone);
router.post('/', validate(patientCreateSchema), createPatient);
router.get('/:patientId', getPatient);
router.patch('/:patientId', validate(patientUpdateSchema), updatePatient);

module.exports = router;
