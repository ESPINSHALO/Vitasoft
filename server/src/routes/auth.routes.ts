import { Router, type Request, type Response, type NextFunction } from 'express';
import { register, login, changePassword, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const wrap = (fn: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res)).catch(next);

const router = Router();

router.post('/register', wrap(register));
router.post('/login', wrap(login));
router.get('/me', authenticate, wrap(getMe));
router.put('/change-password', authenticate, wrap(changePassword));

export default router;

