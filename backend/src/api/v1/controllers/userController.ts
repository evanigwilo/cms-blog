// Express
import { Request, Response } from 'express';
// Models
import User from '../models/User';
// Generators & Validators
import argon2 from 'argon2';
// Services
import { findUser } from '../services/userService';
// Constants, Helpers & Types
import { SESSION_ID } from '../constants';
import { ResponseCode } from '../types/enum';
import { databaseError, validateError } from '../utils';

export const authenticate = async (req: Request, res: Response) => {
  const { user } = req;
  return res.status(200).json({
    code: ResponseCode.SUCCESS,
    message: 'User authenticated.',
    user,
  });
};

export const register = async (req: Request, res: Response) => {
  try {
    // Destructure user input from request body
    const { email, password, username, bio } = req.body;

    // Create a new user model instance
    const UserModel = User();

    // Check if UserModel is available
    if (!UserModel) {
      return databaseError(res);
    }

    // Create a new user document with password
    const user = new UserModel({
      email,
      password,
      username,
      bio,
    });

    // Validate user input for errors
    const validationErrors = await validateError(user, res);
    if (validationErrors) {
      // Validation errors have been handled in validateError function
      return;
    }

    // Check if a user with the provided credentials already exists
    const existingUser = await findUser(username, email);
    if (existingUser) {
      return res.status(400).json({
        code: ResponseCode.FORBIDDEN,
        message: 'Username or Email already exist.',
      });
    }

    // Save the new user to the database
    await user.save();

    // Save user session
    req.session.user = user.toJSON();

    // Respond with a success message and user details
    return res.status(201).json({
      code: ResponseCode.SUCCESS,
      message: 'User created successfully.',
      user,
    });
  } catch (error) {
    // Handle database-related errors
    return databaseError(res);
  }
};

export const login = async (req: Request, res: Response) => {
  const { identity, password } = req.body;

  // Check if a user with the provided credentials already exists
  const user = await findUser(identity, identity);
  if (!user) {
    return res.status(400).json({
      code: ResponseCode.INPUT_ERROR,
      message: "Username or Email doesn't exist.",
    });
  }

  // verify hashed password
  const valid = await argon2.verify(user.password, password);
  if (!valid) {
    return res.status(400).json({
      code: ResponseCode.INPUT_ERROR,
      message: 'Incorrect password.',
    });
  }

  // save user session
  req.session.user = user.toJSON();

  return res.status(200).json({
    code: ResponseCode.SUCCESS,
    message: 'User login successfully.',
    user,
  });
};

export const logout = async (req: Request, res: Response) => {
  let status = true;

  // clear cookie and close session
  res.clearCookie(SESSION_ID);
  req.session.destroy((err) => {
    status = Boolean(err);
  });

  return res.status(204).send();
};

export const updateBio = async (req: Request, res: Response) => {
  // authenticated user and request body
  const { user, body } = req;

  const { bio } = body;

  // Create a new user model instance
  const UserModel = User();

  await UserModel?.updateOne({ username: user?.username }, { $set: { bio } });

  // update bio in session
  req.session.user!.bio = user!.bio = bio;

  return res.status(200).json({
    code: ResponseCode.SUCCESS,
    message: 'Bio updated successfully.',
    user,
  });
};

export const getUser = async (req: Request, res: Response) => {
  // Create a new user model instance
  const UserModel = User();

  const user = await UserModel?.findOne({ username: req.params.username });

  return res.status(200).json({
    code: ResponseCode.SUCCESS,
    message: user ? 'User found' : 'User not found',
    user,
  });
};
