import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import UserService from '../services/UserService.js';
import {
  generateToken,
  getToken,
  isEmail,
  isVietNamPhoneNumber,
  refreshTokenService,
  sendEmail,
} from '../utils/index.js';
import variable from '../variable.js';

const createUser = async (req, res) => {
  try {
    const { name, phone, email, password, confirmPassword } = req.body;
    if (!name || !phone || !email || !password || !confirmPassword) {
      return res.status(200).json({
        status: 'ERROR',
        message: 'Không được bỏ trống.',
      });
    }
    if (!isEmail(email)) {
      return res.status(200).json({
        status: 'ERROR',
        message: 'Email sai định dạng.',
      });
    }
    if (password !== confirmPassword) {
      return res.status(200).json({
        status: 'ERROR',
        message: 'Mật khẩu không trùng khớp.',
      });
    }
    if (!isVietNamPhoneNumber(phone)) {
      return res.status(200).json({
        status: 'ERROR',
        message: 'Số điện thoại này phải thuộc vùng Việt Nam.',
      });
    }
    const response = await UserService.createUser(req.body);
    if (response.status === 'OK') {
      const { email } = response.data;
      const token = generateToken({ email }, '30m');
      const url = `${process.env.APP_URL}/account/verify_email?email=${email}&token=${token}`;
      const html = `
        <p style="font-size: 18px;">Vui lòng xác thực tài khoản bằng cách click vào nút bên dưới.</p>
        <a href="${url}" style="display: inline-block; padding: 10px 20px; color: white; border-radius: 5px; background-color: black; text-decoration: none;">Xác thực tài khoản</a>
      `;
      const resSendEmail = await sendEmail(email, 'Xác thực tài khoản | Kicap', html);
      if (resSendEmail.accepted.length > 0) {
        return res.status(200).json({
          status: 'OK',
          message: 'Đăng ký tài khoản thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
        });
      }
    }
    return res.status(400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { isAdmin } = req.body;
    let response;
    if (res.isAdmin) {
      response = await UserService.updateUser(userId, req.body);
    } else {
      if (isAdmin) return res.status(403).json(variable.NOT_PERMISSION);
      response = await UserService.updateUser(userId, data);
    }
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const response = await UserService.deleteUser(userId);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Không được bỏ trống.',
      });
    } else if (!isEmail(email)) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Email sai định dạng',
      });
    }
    const response = await UserService.loginUser(req.body);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getAllUser = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const response = await UserService.getAllUser(Number(page || 1), Number(limit || 10), search);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getDetailsUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId) {
      return res.status(200).json({
        status: 'ERROR',
        message: 'UserId là bắt buộc.',
      });
    }
    const response = await UserService.getDetailsUser(userId);
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const refreshToken = async (req, res) => {
  try {
    const token = getToken(req);
    if (!token) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Token là bắt buộc.',
      });
    }
    const response = await refreshTokenService(token);
    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie('refreshToken');
    return res.status(200).json({
      status: 'OK',
      message: 'Đăng xuất thành công.',
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const id = req.params.id;
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json(variable.NOT_EMPTY);
    }
    if (newPassword !== confirmPassword)
      return res.status(400).json({
        status: 'ERROR',
        message: 'Xác nhận mật khẩu không trùng khớp.',
      });
    const payload = { oldPassword, newPassword };
    const response = await UserService.changePassword(id, payload);

    return res.status(response.status === 'OK' ? 200 : 400).json(response);
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      return res.status(400).json(variable.NOT_EMPTY);
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, async function (err, data) {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json(variable.TOKEN_EXPIRED);
        }
        return res.status(400).json(variable.HAS_ERROR);
      }
      if (data?.email === email) {
        const response = await UserService.verifyEmail(email);
        return res.status(response.status === 'OK' ? 200 : 400).json(response);
      } else {
        return res.status(400).json(variable.HAS_ERROR);
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const getPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const token = generateToken({ email }, '10m');
    const url = `${process.env.APP_URL}/account/new_password?email=${email}&token=${token}`;
    const html = `<a href="${url}">Thay đổi mật khẩu</a>`;
    const resService = await UserService.getPassword(email);
    if (resService.status === 'OK') {
      const resSendEmail = await sendEmail(email, 'test', html);
      if (resSendEmail.accepted.length > 0) {
        return res.status(200).json(resService);
      }
    } else {
      return res.status(400).json(resService);
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { newPassword, email, token } = req.body;
    if (!newPassword || !email || !token) {
      return res.status(400).json(variable.NOT_EMPTY);
    }
    jwt.verify(token, process.env.ACCESS_TOKEN, async function (err, data) {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json(variable.TOKEN_EXPIRED);
        }
        return res.status(400).json(variable.HAS_ERROR);
      }
      if (data?.email === email) {
        const payload = { email, newPassword };
        const response = await UserService.resetPassword(payload);
        if (response.status === 'OK') {
          return res.status(200).json(response);
        }
      } else {
        return res.status(400).json({
          status: 'ERROR',
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const newPasswordCheck = async (req, res) => {
  try {
    const { email, token } = req.body;
    if (!email || !token) {
      return res.redirect(process.env.APP_URL + '/account/reset_password');
    }
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, data) {
      if (err) {
        return res.status(400).json({
          status: 'ERROR',
        });
      }
      if (data?.email === email) {
        return res.status(200).json({
          status: 'OK',
        });
      } else {
        return res.status(400).json({
          status: 'ERROR',
        });
      }
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const sendVerifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const token = generateToken({ email }, '30m');
    const url = `${process.env.APP_URL}/account/verify_email?email=${email}&token=${token}`;
    const html = `
        <p style="font-size: 18px;">Vui lòng xác thực tài khoản bằng cách click vào nút bên dưới.</p>
        <a href="${url}" style="display: inline-block; padding: 10px 20px; color: white; border-radius: 5px; background-color: black; text-decoration: none;">Xác thực tài khoản</a>
      `;
    const resSendEmail = await sendEmail(email, 'Xác thực tài khoản | Kicap', html);
    if (resSendEmail.accepted.length > 0) {
      return res.status(200).json({
        status: 'OK',
        message: 'Đã gửi đến email. Vui lòng kiểm tra email để xác thực.',
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json(variable.HAS_ERROR);
  }
};

const UserController = {
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  getAllUser,
  getDetailsUser,
  refreshToken,
  logoutUser,
  changePassword,
  verifyEmail,
  getPassword,
  resetPassword,
  newPasswordCheck,
  sendVerifyEmail,
};
export default UserController;
