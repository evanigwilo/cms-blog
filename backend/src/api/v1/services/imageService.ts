// Express
import express, { NextFunction, Request, Response } from 'express';
// Multer
import multer, { MulterError } from 'multer';
// Mongoose
import { Types } from 'mongoose';
// Models
import Post from '../models/Post';
import Image from '../models/Image';
// Constants, Helpers & Types
import { ResponseCode } from '../types/enum';
import { MAX_IMAGE_UPLOAD, formatBytes, mimeTypes } from '../constants';

// Middleware to check parameters in the request
export const checkParams = async (req: Request, res: Response, next: NextFunction) => {
  const {
    params: { id },
    user,
  } = req;

  if (id) {
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        code: ResponseCode.INPUT_ERROR,
        message: 'Invalid identifier',
      });
    }

    const PostModel = Post();
    // Find the post created by this user
    const find = await PostModel?.findOne({ _id: id, createdBy: user?._id });

    if (!find) {
      return res.status(400).send({
        code: ResponseCode.FORBIDDEN,
        message: 'Post identifier invalid or User not authorized',
      });
    }
  }

  return next();
};

// Middleware to track upload progress
export const uploadProgress = (req: Request, res: Response, next: NextFunction) => {
  let totalSize = 0;

  // Set event listener to track data chunks
  req.on('data', (chunk: Buffer) => {
    totalSize += chunk.length;
  });

  next();
};

// Controller to handle image upload
export const uploadImage = (req: Request, res: Response) => {
  const {
    params: { id },
    user,
  } = req;

  // Configure multer for memory storage and file filtering
  const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, { mimetype }, callback) => {
      let error;

      // Verify if the image type is supported
      if (!mimeTypes.image.includes(mimetype)) {
        error = {
          code: ResponseCode.INVALID_MIMETYPE,
          message: 'File is not a supported image type.',
        };
      } else if ((Number(req.headers['content-length']) || 0) > MAX_IMAGE_UPLOAD) {
        // Verify if the image size is <= 1 MB
        error = {
          code: ResponseCode.MAX_FILE_SIZE,
          message: `File exceeds maximum upload size (${MAX_IMAGE_UPLOAD / 1024 / 1024}MB).`,
        };
      }

      if (error) {
        callback(error as unknown as Error);
      } else {
        callback(null, true);
      }
    },
  });

  // Use multer to handle the file upload
  upload.single('image')(req, res, async (error) => {
    const { file } = req;

    if (error) {
      const { code, message } = error as MulterError & Error;

      // Destroy request to prevent subsequent file uploads
      return res
        .status(500)
        .json({
          code: code || ResponseCode.SERVER_ERROR,
          message,
        })
        .destroy();
    }

    if (!file) {
      return res.status(400).json({
        code: ResponseCode.FILE_MISSING,
        message: 'File is not supplied.',
      });
    }

    const ImageModel = Image();
    const filename = id || user?.username;
    const category = id ? 'post' : 'profile';

    // Save the image to the database
    try {
      const { buffer, mimetype, size } = file;
      await ImageModel?.findOneAndUpdate(
        { filename },
        {
          filename,
          category,
          image: {
            data: buffer,
            contentType: mimetype,
            size: formatBytes(size),
          },
        },
        { upsert: true, new: true },
      );

      // update post image
      const PostModel = Post();
      await PostModel?.findOneAndUpdate(
        { _id: id },
        {
          image: true,
        },
      );
    } catch (error) {
      return res.status(500).json({
        code: ResponseCode.UPLOAD_FAILED,
        message: 'Image failed to upload.',
      });
    }

    return res.status(200).json({
      code: ResponseCode.SUCCESS,
      message: 'Image uploaded successfully.',
    });
  });
};
