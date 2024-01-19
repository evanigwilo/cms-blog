// Mongoose
import { Schema } from 'mongoose';
// Generators & Validators
import { isNotEmpty } from 'class-validator';
// Constants, Helpers & Types
import { ModelType } from '../types/enum';
import { PostType } from '../types';
import { mongoGetDb } from '../utils';

const postSchema = new Schema<PostType>(
  {
    body: {
      type: String,
      required: true,
      validate: {
        validator: (value: string) => isNotEmpty(value?.trim()),
        message: 'Post body cannot be empty',
      },
    },
    image: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: ModelType.USER, // Reference to the User model
      required: true,
    },
  },
  {
    collection: ModelType.POST, // Specify the collection name
    timestamps: {
      createdAt: 'createdDate',
      updatedAt: 'updatedDate',
      currentTime: () => Date.now(),
    },
  },
);

/**
 * Returns the Post model based on the post schema.
 */
export default () => {
  const postDb = mongoGetDb('post');

  // Create a new model with the provided arguments
  const PostModel = postDb?.model<PostType>(ModelType.POST, postSchema);

  return PostModel;
};
