// Mongoose
import { Types } from 'mongoose';
// Express
import { Response } from 'express';
// Models
import Post from '../models/Post';
import User from '../models/User';
// Constants, Helpers & Types
import { ResponseCode } from '../types/enum';
import { cache } from '../utils/redis';

/**
 * Retrieve all posts based on the provided parameters.
 *
 * @param limit - The maximum number of posts to retrieve.
 * @param offset - The number of posts to skip before starting to collect them.
 * @param userId - (Optional) Filter posts by user ID.
 * @returns A list of posts.
 */
export const findAllPosts = async (limit: number, offset: number, username?: string) => {
  try {
    // Obtain the Post and User models
    const PostModel = Post();
    const UserModel = User();

    // Get user info from username
    const user = username ? await UserModel?.findOne({ username }) : undefined;

    // Construct the query based on the provided parameters
    const query = {
      createdBy: user?.id ? user._id : { $exists: true },
    };

    // Generate a cache key based on the function parameters
    const cacheKey = `${limit}-${offset}-${user?.id}`;

    // Attempt to retrieve posts from the cache
    const cachedPosts = await cache.get(cacheKey);

    // If cached posts are found, parse and return them
    if (cachedPosts) {
      return JSON.parse(cachedPosts);
    }

    // Use the Post model to find posts
    const posts =
      (await PostModel?.find(query)
        .sort({ createdDate: 'desc' }) // Sort by createdDate in descending order
        .skip(offset)
        .limit(limit)
        // Populate createdBy field with selected user properties
        .populate('createdBy', '_id username email', UserModel)) || [];

    // Cache the retrieved posts for future use (cache expiration: 5 minutes)
    await cache.setex(cacheKey, 60 * 5, JSON.stringify(posts));

    // Return the list of posts (or an empty array if no posts found)
    return posts;
  } catch (error) {
    // Return an empty array
    return [];
  }
};

export const findPost = async (id: string, userId: string, res: Response) => {
  if (!Types.ObjectId.isValid(id)) {
    res.status(400).send({
      code: ResponseCode.INPUT_ERROR,
      message: 'Invalid identifier',
    });
    return;
  }
  // Create a new post model instance
  const PostModel = Post();

  // Find the post created by this user
  const find = await PostModel?.findOne({ _id: id, createdBy: new Types.ObjectId(userId) });

  if (!find) {
    res.status(400).send({
      code: ResponseCode.FORBIDDEN,
      message: 'Post identifier invalid or User not authorized',
    });
    return;
  }

  return find;
};
