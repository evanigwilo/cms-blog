// Express
import express from 'express';
// Middleware
import { authenticateUser } from '../middleware/authenticate';
// Controllers
import { authenticate, getUser, login, logout, register, updateBio } from '../controllers/userController';

const router = express.Router();

router.get('/:username', getUser);

router.post('/authenticate', authenticateUser, authenticate);

router.post('/register', register);

router.post('/login', login);

router.post('/logout', logout);

router.post('/update-bio', authenticateUser, updateBio);

export default router;
