// Mongoose
import { Schema } from 'mongoose';
// Constants, Helpers & Types
import { ModelType } from '../types/enum';
import { ImageType } from '../types';
import { mongoGetDb } from '../utils';

const imageSchema = new Schema<ImageType>(
  {
    filename: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    image: {
      data: Buffer,
      contentType: String,
      size: String,
    },
  },
  {
    collection: ModelType.IMAGE, // Specify the collection name
    timestamps: {
      createdAt: 'createdDate',
      updatedAt: 'updatedDate',
      currentTime: () => Date.now(),
    },
  },
);

/**
 * Returns the Image model based on the image schema.
 */
export default () => {
  const imageDb = mongoGetDb('image');

  // Create a new model with the provided arguments
  const ImageModel = imageDb?.model<ImageType>(ModelType.IMAGE, imageSchema);

  return ImageModel;
};
