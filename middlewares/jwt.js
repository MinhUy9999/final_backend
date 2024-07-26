const jwt = require("jsonwebtoken");

// Hàm tạo Access Token
const generateAccessToken = (userId, role) => {
  // Tạo một token mới với payload chứa userId và role, ký với secret key và thiết lập thời gian hết hạn là 3 ngày
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

// Hàm tạo Refresh Token
const generateRefreshToken = (userId) => {
  // Tạo một token mới với payload chỉ chứa userId, ký với refresh secret key và thiết lập thời gian hết hạn là 7 ngày
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
};
