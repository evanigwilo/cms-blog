// Constants, Helpers & Types
import { ActionType } from "./enum";

export type AuthRoute = "Sign Up" | "Login";

export type AuthCredentials = Partial<{
  email: string;
  username: string;
  password: string;
  bio: string;
  identity: string;
}>;

export type Body = {
  code: string;
  body: string;
};

export type UserType = {
  _id: string;
  username: string;
  password: string;
  createdDate: string;
  bio: string | null;
  email: string;
};

export type PostType = {
  _id: string;
  body: string;
  image: boolean;
  createdDate: string;
  createdBy: {
    _id: string;
    email: string;
    username: string;
  };
};

export type Spacing = {
  margin?: string;
  padding?: string;
};

export type Store = {
  user?: UserType;
  authenticating: boolean;
  posts: PostType[];
};

export type Action = {
  type: ActionType;
  payload: any;
};

export type DispatchCreator = (type: ActionType, payload?: any) => void;

export type Ellipsis = 1 | 2 | 3;

export type InputElement = HTMLInputElement | HTMLTextAreaElement;
