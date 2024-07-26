const jwt = require("jsonwebtoken");

// Middleware kiểm tra token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization; // Lấy header Authorization từ request
  console.log("Authorization Header:", authHeader); // Ghi log header

  if (authHeader) {
    const token = authHeader.split(" ")[1]; // Tách token từ header
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => { // Xác thực token với secret key
      if (err) {
        console.log("Token verification error:", err); // Ghi log lỗi
        return res.status(403).json({ message: "Token is not valid" }); // Trả về lỗi Forbidden nếu token không hợp lệ
      }
      req.user = user; // Gán thông tin người dùng vào request
      console.log("Verified User:", user); // Ghi log thông tin người dùng đã xác thực
      next(); // Chuyển sang middleware hoặc route handler tiếp theo
    });
  } else {
    console.log("No authorization header"); // Ghi log nếu không có header Authorization
    res.status(401).json({ message: "No token provided" }); // Trả về lỗi Unauthorized nếu không có token
  }
};

// Middleware kiểm tra quyền admin
const isAdmin = (req, res, next) => {
  console.log("Checking admin role for user:", req.user); // Ghi log thông tin người dùng
  if (req.user && req.user.role === "admin") { // Kiểm tra nếu người dùng có role là admin
    next(); // Chuyển sang middleware hoặc route handler tiếp theo
  } else {
    res.status(403).json({ message: "Require Admin Role" }); // Trả về lỗi Forbidden nếu không phải admin
  }
};

module.exports = {
  verifyToken,
  isAdmin,
};
