import catchAsync from '../../utils/catchAsync.js';

import {
  loginService,
  forgotPasswordService,
  resetPasswordService,
  updatePasswordService,
} from './auth.service.js';

const createCookieOptions = () => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  return cookieOptions;
};

const sendTokenResponse = (res, statusCode, token, user) => {
  res.cookie('jwt', token, createCookieOptions());

  return res.status(statusCode).json({
    status: 'success',
    data: {
      token,
      user,
    },
  });
};

// LOGIN
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { token, user } = await loginService(email, password);

  sendTokenResponse(res, 200, token, user);
});

// FORGOT PASSWORD
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  await forgotPasswordService(email, req);

  res.status(200).json({
    status: 'success',
    data: {
      message: 'Password reset link sent to email',
    },
  });
});

// RESET PASSWORD
export const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const { token: jwtToken, user } = await resetPasswordService(token, password);

  sendTokenResponse(res, 200, jwtToken, user);
});

// UPDATE PASSWORD
export const updatePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const { token, user } = await updatePasswordService(
    req.user.id,
    currentPassword,
    newPassword
  );

  sendTokenResponse(res, 200, token, user);
});
