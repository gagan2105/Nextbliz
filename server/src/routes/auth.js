import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.js';
import * as auth from '../controllers/authController.js';

const router = Router();

router.post('/register', asyncHandler(auth.register));
router.post('/login', asyncHandler(auth.login));
router.post('/refresh', asyncHandler(auth.refresh));
router.post('/logout', authenticate, asyncHandler(auth.logout));
router.get('/me', authenticate, asyncHandler(auth.me));

export default router;
