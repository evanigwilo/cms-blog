// Mongoose
import { Schema } from 'mongoose';
// Generators & Validators
import { isEmail } from 'class-validator';
import argon2 from 'argon2';
// Constants, Helpers & Types
import { ModelType } from '../types/enum';
import { UserType } from '../types';
import { mongoGetDb } from '../utils';

const userSchema = new Schema<UserType>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: (value: string) => isEmail(value),
        message: 'Email is invalid.',
      },
    },
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 25,
      match: /^[a-zA-Z0-9]+$/,
      message: 'Username should contain only letters and numbers.',
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 256,
      message: 'Password must be at least 6 characters long.',
    },
    bio: {
      type: String,
      maxlength: 256,
    },
  },
  {
    collection: ModelType.USER, // Specify the collection name
    timestamps: {
      createdAt: 'createdDate',
      updatedAt: 'updatedDate',
      currentTime: () => Date.now(),
    },
  },
);

userSchema.pre('save', async function (next) {
  // Hash the password before saving
  const user = this;
  user.password = await argon2.hash(user.password);
  next();
});

/**
 * Returns the User model based on the user schema.
 */
export default () => {
  const imageDb = mongoGetDb('user');

  // Create a new model with the provided arguments
  const UserModel = imageDb?.model<UserType>(ModelType.USER, userSchema);

  return UserModel;
};
