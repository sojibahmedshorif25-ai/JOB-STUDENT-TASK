import { Router } from 'express';
import {
  register,
  login,
  logout,
  me,
  googleAuth,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { protect } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import {
  loginSchema,
  registerSchema,
  googleSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validators';
import { authLimiter } from '../middlewares/rateLimit';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/google', validate(googleSchema), googleAuth);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), resetPassword);
router.post('/logout', logout);
router.get('/me', protect, me);

export default router;
