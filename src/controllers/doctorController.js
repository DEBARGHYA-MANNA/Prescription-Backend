const asyncHandler = require('../utils/asyncHandler');
const { serializeDoctor } = require('../utils/doctorSerializer');

const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      doctor: serializeDoctor(req.doctor),
    },
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  Object.assign(req.doctor.profile, req.body);
  await req.doctor.save();

  res.status(200).json({
    success: true,
    message: 'Prescription details saved.',
    data: {
      doctor: serializeDoctor(req.doctor),
    },
  });
});

module.exports = { getProfile, updateProfile };
