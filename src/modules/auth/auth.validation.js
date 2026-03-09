import validator from 'validator';

export const validateLogin = (data) => {
  const errors = [];

  if (!data.email) {
    errors.push('Email is required');
  } else if (!validator.isEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.password) {
    errors.push('Password is required');
  } else if (data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  return errors;
};

export const validateUpdatePassword = (data) => {
  const errors = [];

  if (!data.currentPassword) {
    errors.push('Current password is required');
  }

  if (!data.newPassword) {
    errors.push('New password is required');
  } else if (data.newPassword.length < 8) {
    errors.push('New password must be at least 8 characters');
  }

  return errors;
};

export const validateResetPassword = (data) => {
  const errors = [];

  if (!data.password) {
    errors.push('Password is required');
  }

  if (data.password && data.password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  return errors;
};
