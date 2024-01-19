// Mongoose
import { Types } from 'mongoose';

export type Databases = 'user' | 'post' | 'image';

export type UserType = {
  _id?: string;
  email: string;
  username: string;
  password: string;
  bio?: string;
};

export type PostType = {
  _id?: string;
  body: string;
  image: boolean;
  createdBy: Types.ObjectId;
};

export type ImageType = {
  _id?: string;
  filename: string;
  category: 'post' | 'profile';
  image: {
    data: Buffer;
    contentType: string;
    size: string;
  };
};

export type Body = {
  code: string;
  body: string;
};
