import UserService from '../services/UserService.js';
import { getToken, isEmail, isVietNamPhoneNumber, refreshTokenService } from '../utils/index.js';
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
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({
      message: error,
    });
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
    if (response.status === 'OK') return res.status(200).json(response);
    return res.status(400).json(response);
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

const UserController = {
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  getAllUser,
  getDetailsUser,
  refreshToken,
  logoutUser,
};
export default UserController;
