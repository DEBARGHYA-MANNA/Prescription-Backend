const express = require('express');
const { listPrescriptionSections } = require('../controllers/sectionController');

const router = express.Router();

router.get('/', listPrescriptionSections);

module.exports = router;
