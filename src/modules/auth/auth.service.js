import crypto from 'crypto';
import User from '../users/user.model.js';
import { signToken } from '../../utils/jwt.js';
import AppError from '../../utils/AppError.js';
import sendEmail from '../../utils/email.js';

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject();
  delete user.password;

  return user;
};

// LOGIN SERVICE
export const loginService = async (email, password) => {
  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const correct = await user.correctPassword(password, user.password);

  if (!correct) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 403);
  }

  const token = signToken(user._id);

  user.lastLogin = Date.now();

  await user.save({ validateBeforeSave: false });

  return { token, user: sanitizeUser(user) };
};

// FORGOT PASSWORD SERVICE
export const forgotPasswordService = async (email, req) => {
  if (!email) {
    throw new AppError('Email is required', 400);
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('User not found with this email', 404);
  }

  // Generate reset token
  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `
    Forgot your password?

    Submit a PATCH request with your new password to:

    ${resetURL}

    If you didn't request this, please ignore this email.
    `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset (valid for 10 minutes)',
      message,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save({ validateBeforeSave: false });

    throw new AppError('There was an error sending the email. Try again later.', 500);
  }
};

// RESET PASSWORD SERVICE
export const resetPasswordService = async (token, password) => {
  if (!password) {
    throw new AppError('Password is required', 400);
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Token is invalid or expired', 400);
  }

  user.password = password;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  const jwtToken = signToken(user._id);

  return { token: jwtToken, user: sanitizeUser(user) };
};

// UPDATE PASSWORD SERVICE
export const updatePasswordService = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new AppError('Please provide current and new password', 400);
  }

  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const correct = await user.correctPassword(currentPassword, user.password);

  if (!correct) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;

  await user.save();

  const token = signToken(user._id);

  return { token, user: sanitizeUser(user) };
};
