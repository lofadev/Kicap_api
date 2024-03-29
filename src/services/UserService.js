import bcrypt from 'bcrypt';
import User from '../models/UserModel.js';
import { generateAccessToken, generateRefreshToken } from '../utils/index.js';

const createUser = (newUser) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, phone, email, password } = newUser;
      const checkUser = await User.findOne({ email });
      if (checkUser) {
        resolve({
          status: 'ERROR',
          message: 'Email này đã tồn tại.',
        });
      }
      const hash = bcrypt.hashSync(password, 10);
      const createdUser = await User.create({
        name,
        email,
        phone,
        password: hash,
      });
      if (createdUser) {
        resolve({
          status: 'OK',
          message: 'Đăng ký thành công.',
          data: createdUser,
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const updateUser = (id, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({ _id: id });
      if (!user) {
        resolve({
          status: 'ERROR',
          message: 'User này không tồn tại.',
        });
      }
      if (payload.password) payload.password = bcrypt.hashSync(password, 10);
      const updatedUser = await User.findByIdAndUpdate(id, payload, { new: true });
      resolve({
        status: 'OK',
        message: 'Cập nhật thông tin thành công.',
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
      const user = await User.findOne({ _id: userId });
      if (!user) {
        resolve({
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
      const user = await User.findOne({ email });
      if (!user) {
        resolve({
          status: 'ERROR',
          message: 'Tài Khoản này không tồn tại.',
        });
      }

      const comparePassword = bcrypt.compareSync(password, user.password);
      if (!comparePassword) {
        resolve({
          status: 'ERROR',
          message: 'Mật khẩu không chính xác.',
        });
      }
      const accessToken = generateAccessToken({
        id: user._id,
        isAdmin: user.isAdmin,
      });

      const refreshToken = generateRefreshToken({
        id: user._id,
        isAdmin: user.isAdmin,
      });

      resolve({
        status: 'OK',
        message: 'Đăng nhập thành công.',
        data: {
          accessToken,
          refreshToken,
        },
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

const getDetailsUser = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findById(id);
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
