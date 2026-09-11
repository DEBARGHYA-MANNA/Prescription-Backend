const express = require('express');
const { z } = require('zod');
const { signUp, login, getCurrentDoctor } = require('../controllers/authController');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');

const router = express.Router();

const password = z.string()
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be at most 72 characters.')
  .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, {
    message: 'Password must be at most 72 bytes.',
  });

const signUpSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(80),
  email: z.string().trim().email('Enter a valid email address.').max(254),
  password,
}).strict();

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.').max(254),
  password: z.string().min(1, 'Password is required.').max(72),
}).strict();

router.post('/signup', validate(signUpSchema), signUp);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, getCurrentDoctor);

module.exports = router;
