// Express
import { Request, Response } from 'express';
// Models
import Post from '../models/Post';
// Services
import { findAllPosts, findPost } from '../services/postService';
// Constants, Helpers & Types
import { ResponseCode } from '../types/enum';
import { databaseError, validateError, validateLimitOffset } from '../utils';
import { cache } from '../utils/redis';

export const getUserPosts = async (req: Request, res: Response) => {
  const { body, params } = req;

  // Validate pagination parameters
  const { limit, offset } = validateLimitOffset(body);

  // find all posts
  const posts = await findAllPosts(limit, offset, params.username);

  return res.status(200).json({
    code: ResponseCode.SUCCESS,
    message: 'User Posts.',
    count: posts.length,
    posts,
    limit,
    offset,
  });
};

export const getAllPosts = async (req: Request, res: Response) => {
  // request body
  const { body } = req;

  // Validate pagination parameters
  const { limit, offset } = validateLimitOffset(body);

  // find all posts
  const posts = await findAllPosts(limit, offset);

  return res.status(200).json({
    code: ResponseCode.SUCCESS,
    message: 'All Posts.',
    count: posts.length,
    posts,
    limit,
    offset,
  });
};

export const createPost = async (req: Request, res: Response) => {
  // authenticated user and request body
  const { user, body } = req;

  // Create a new post model instance
  const PostModel = Post();

  // Check if PostModel is available
  if (!PostModel) {
    return databaseError(res);
  }

  // Create a new post document with hashed password
  const post = new PostModel({
    body: body.body,
    createdBy: user?._id,
  });

  // Validate post input for errors
  const validationErrors = await validateError(post, res);
  if (validationErrors) {
    // Validation errors have been handled in validateError function
    return;
  }

  await post.save();

  // Attempt to clear cache on post create
  await cache.flushdb();

  return res.status(201).json({
    code: ResponseCode.SUCCESS,
    message: 'Post created successfully.',
    post,
  });
};

export const deletePost = async (req: Request, res: Response) => {
  // authenticated user and request body
  const {
    user,
    params: { postId },
  } = req;

  // Create a new post model instance
  const PostModel = Post();

  // Check if PostModel is available
  if (!PostModel) {
    return databaseError(res);
  }

  // Find the post created by this user
  const post = await findPost(postId, user!._id!, res);

  if (!post) {
    return;
  }

  await PostModel.deleteOne({ _id: postId });

  // Attempt to clear cache on delete post
  await cache.flushdb();

  return res.status(201).json({
    code: ResponseCode.SUCCESS,
    message: 'Post deleted successfully.',
    post,
  });
};
