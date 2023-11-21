import bcrypt from 'bcrypt';
import User from '../models/UserModel.js';
import { generalAccessToken, generalRefreshToken } from '../utils/index.js';

const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { firstName, lastName, phone, email, password } = newUser;
      const checkUser = await User.findOne({ email });
      if (checkUser) {
        return resolve({
          status: 'ERROR',
          message: 'Email này đã tồn tại.',
        });
      }
      const hash = bcrypt.hashSync(password, 10);
      const createdUser = await User.create({
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        password: hash,
      });
      if (createdUser) {
        resolve({
          status: 'OK',
          message: 'SUCCESS',
          data: createdUser,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const updateUser = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({ _id: id });
      if (!checkUser) {
        return resolve({
          status: 'ERROR',
          message: 'User này không tồn tại.',
        });
      }
      const { password } = data;
      const hash = bcrypt.hashSync(password, 10);
      data.password = hash;
      const updatedUser = await User.findByIdAndUpdate(id, data, { new: true });
      resolve({
        status: 'OK',
        message: 'SUCCESS',
        data: updatedUser,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const deleteUser = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const checkUser = await User.findOne({ _id: userId });
      if (!checkUser) {
        return resolve({
          status: 'ERROR',
          message: 'User này không tồn tại.',
        });
      }
      await User.findByIdAndDelete(userId);
      resolve({
        status: 'OK',
        message: 'Xóa tài khoản thành công.',
      });
    } catch (error) {
      reject(error);
    }
  });
};

const loginUser = (payload) => {
  return new Promise(async (resolve, reject) => {
    const { email, password } = payload;
    try {
      const checkUser = await User.findOne({ email: email });
      if (!checkUser) {
        resolve({
          status: 'ERROR',
          message: 'Tài Khoản này không tồn tại.',
        });
      }
      const comparePassword = bcrypt.compareSync(password, checkUser.password);

      if (!comparePassword) {
        resolve({
          status: 'ERROR',
          message: 'Mật khẩu không chính xác.',
        });
      }
      const access_token = generalAccessToken({
        id: checkUser._id,
        isAdmin: checkUser.isAdmin,
      });

      const refresh_token = generalRefreshToken({
        id: checkUser._id,
        isAdmin: checkUser.isAdmin,
      });

      resolve({
        status: 'OK',
        message: 'Đăng nhập thành công.',
        access_token,
        refresh_token,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const getAllUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const users = await User.find({});
      resolve(users);
    } catch (error) {
      reject(error);
    }
  });
};

const getUser = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const users = await User.find({});
      resolve(users);
    } catch (error) {
      reject(error);
    }
  });
};

const getDetailsUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({
        _id: id,
      });
      if (!user) {
        resolve({
          status: 'ERROR',
          message: 'User này không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'SUCCESS',
        data: user,
      });
    } catch (error) {
      reject(error);
    }
  });
};

const UserService = { createUser, updateUser, deleteUser, loginUser, getAllUser, getDetailsUser };
export default UserService;
