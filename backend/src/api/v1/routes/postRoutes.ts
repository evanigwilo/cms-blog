// Express
import express from 'express';
// Middleware
import { authenticateUser } from '../middleware/authenticate';
// Controllers
import { createPost, deletePost, getAllPosts, getUserPosts } from '../controllers/postController';

const router = express.Router();

router.post('/', getAllPosts);

router.post('/:username', getUserPosts);

router.put('/create', authenticateUser, createPost);

router.delete('/:postId', authenticateUser, deletePost);

export default router;
