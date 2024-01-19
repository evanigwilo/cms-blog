// Express
import { Request, Response } from 'express';
// Node
import path from 'path';
// Models
import Image from '../models/Image';

/**
 * Retrieve and send an image based on the request parameters.
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const getImage = async (req: Request, res: Response) => {
  // Extract request parameters and authenticated user from the request
  const { id, username } = req.params;

  // Obtain the Image model
  const ImageModel = Image();

  // Determine the filename and category based on the request parameters
  const filename = id || username;
  const category = id ? 'post' : 'profile';

  // Find the image document in the database
  const image = await ImageModel?.findOne({
    category,
    filename,
  });

  // If no image is found, respond with default profile
  if (!image) {
    const avatar = path.join(__dirname, '../images', 'avatar.png');
    return res.sendFile(avatar);
  }

  // Extract content type and image data from the image document
  const { contentType, data } = image.image;

  // Set the content type in the response header
  res.contentType(contentType);

  // Send the image data in the response
  res.send(data);
};
