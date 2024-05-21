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
      const user = await User.findById(id);
      if (!user) {
        resolve({
          status: 'ERROR',
          message: 'User này không tồn tại.',
        });
      }
      if (payload.password) payload.password = bcrypt.hashSync(payload.password, 10);
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
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        resolve({
          status: 'ERROR',
          message: 'User này không tồn tại.',
        });
      }
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
      if (!user.isVerify) {
        resolve({
          status: 'ERROR',
          message:
            'Tài khoản của bạn chưa được xác thực. Vui lòng kiểm tra email hoặc nhấn vào nút gửi lại để tiến hành xác thực lại email.',
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

const getAllUser = (page, limit, search) => {
  return new Promise(async (resolve, reject) => {
    try {
      const skip = (page - 1) * limit;
      let query;
      if (search) query = { name: { $regex: search, $options: 'i' } };
      const totalUsers = await User.countDocuments(query);
      const users = await User.find(query).skip(skip).limit(limit);
      const totalPage = Math.ceil(totalUsers / limit);
      resolve({
        status: 'OK',
        message: 'Lấy danh sách user.',
        data: users,
        currentPage: page,
        totalUsers,
        totalPage,
        limit,
      });
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

const changePassword = (id, payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { oldPassword, newPassword } = payload;
      const user = await User.findById(id);
      if (!user) {
        resolve({
          status: 'ERROR',
          message: 'User này không tồn tại.',
        });
      }
      const comparePassword = bcrypt.compareSync(oldPassword, user.password);
      if (!comparePassword) {
        resolve({
          status: 'ERROR',
          message: 'Mật khẩu cũ không chính xác.',
        });
      }
      const hash = bcrypt.hashSync(newPassword, 10);
      const result = await User.findByIdAndUpdate(id, { password: hash });
      if (result) {
        resolve({
          status: 'OK',
          message: 'Cập nhật mật khẩu thành công',
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const getPassword = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const resUser = await User.findOne({ email });
      if (!resUser) {
        resolve({
          status: 'ERROR',
          message: 'Email này không tồn tại.',
        });
      }
      resolve({
        status: 'OK',
        message: 'Vui lòng kiểm tra email để thay đổi mật khẩu mới.',
      });
    } catch (error) {
      reject(error);
    }
  });
};

const resetPassword = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { email, newPassword } = payload;
      const hashPassword = bcrypt.hashSync(newPassword, 10);
      const newUserPassword = await User.findOneAndUpdate(
        { email },
        { password: hashPassword },
        { new: true }
      );
      if (newUserPassword) {
        resolve({
          status: 'OK',
          message: 'Đổi mật khẩu thành công.',
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const verifyEmail = (email) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({ email });
      if (user) {
        const isEmailVerify = await User.findOneAndUpdate(
          { email },
          { isVerify: true },
          { new: true }
        );
        if (isEmailVerify) {
          resolve({
            status: 'OK',
            message: 'Xác thực email thành công.',
          });
        }
      } else {
        resolve({
          status: 'ERROR',
          message: 'Email này không tồn tại.',
        });
      }
    } catch (error) {
      reject(error);
    }
  });
};

const UserService = {
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  getAllUser,
  getDetailsUser,
  changePassword,
  getPassword,
  resetPassword,
  verifyEmail,
};
export default UserService;
