const UserService = require('../services/UserService');

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const isCheckEmail = reg.test(email);
    if (!email || !password) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The input is required',
      });
    } else if (!isCheckEmail) {
      return res.status(200).json({
        status: 'ERR',
        message: 'The input is email',
      });
    }
    const response = await UserService.loginUser(req.body);
    const { refresh_token, ...newReponse } = response;
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      path: '/',
    });
    return res.status(200).json({ ...newReponse, refresh_token });
  } catch (e) {
    return res.status(404).json({
      message: e,
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const response = await UserService.getAllUser();
    return res.status(200).json({ response });
  } catch (error) {
    return res.status(404).json({
      message: error,
    });
  }
};

module.exports = {
  loginUser,
  getAllUser,
};
