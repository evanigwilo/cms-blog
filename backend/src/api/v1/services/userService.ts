// Models
import User from '../models/User';

export const findUser = async (username: string, email: string) => {
  try {
    // Construct a query based on the provided user information
    const query = {
      $or: [
        { username: { $regex: new RegExp(`^${username}$`, 'i') } }, // Case-insensitive search for username
        { email: { $regex: new RegExp(`^${email}$`, 'i') } }, // Case-insensitive search for email
      ],
    };

    const UserModel = User();
    // Find a user that matches the query
    const find = await UserModel?.findOne(query);

    return find;
  } catch (error) {
    return null;
  }
};
