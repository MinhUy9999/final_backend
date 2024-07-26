const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const validator = require("validator");

// Khai báo Schema của model Mongo
const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true, // Bắt buộc phải có
    },
    lastname: {
      type: String,
      required: true, // Bắt buộc phải có
    },
    email: {
      type: String,
      required: true, // Bắt buộc phải có
      unique: true, // Phải là duy nhất
      validate: [validator.isEmail, "Please provide a valid email address"], // Kiểm tra định dạng email hợp lệ
    },
    avatar: {
      type: String, // URL của ảnh đại diện
    },
    mobile: {
      type: String,
      required: true, // Bắt buộc phải có
      unique: true, // Phải là duy nhất
      validate: [
        validator.isMobilePhone,
        "Please provide a valid phone number", // Kiểm tra định dạng số điện thoại hợp lệ
      ],
    },
    password: {
      type: String,
      required: true, // Bắt buộc phải có
      validate: [
        (password) => {
          return password.length >= 8; // Mật khẩu phải có ít nhất 8 ký tự
        },
        "Password should be at least 8 characters", // Thông báo lỗi nếu mật khẩu ít hơn 8 ký tự
      ],
    },
    role: {
      type: String,
      enum: ["admin", "user"], // Giá trị chỉ có thể là "admin" hoặc "user"
      default: "user", // Giá trị mặc định là "user"
    },
    cart: [
      {
        product: { type: mongoose.Types.ObjectId, ref: "Product" }, // Tham chiếu đến ID của sản phẩm
        quantity: Number, // Số lượng sản phẩm
        price: Number, // Giá sản phẩm
        title: String, // Tiêu đề sản phẩm
        image: String, // URL hình ảnh sản phẩm
      },
    ],
    address: String, // Địa chỉ của người dùng
    wishlist: [{ type: mongoose.Types.ObjectId, ref: "Product" }], // Danh sách sản phẩm yêu thích
    isBlocked: {
      type: Boolean,
      default: false, // Giá trị mặc định là không bị chặn
    },
    refreshToken: {
      type: String, // Token dùng để làm mới AccessToken
    },
    passwordChangeAt: {
      type: String, // Thời gian thay đổi mật khẩu
    },
    passwordResetToken: {
      type: String, // Token dùng để đặt lại mật khẩu
    },
    passwordResetExpires: {
      type: String, // Thời gian hết hạn của token đặt lại mật khẩu
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Hàm băm mật khẩu trước khi lưu
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = bcrypt.genSaltSync(10); // Tạo muối với độ dài 10
  this.password = await bcrypt.hash(this.password, salt); // Băm mật khẩu với muối
});

// Các phương thức của schema người dùng
userSchema.methods = {
  isCorrectPassword: async function (password) {
    return await bcrypt.compare(password, this.password); // So sánh mật khẩu đã nhập với mật khẩu đã băm
  },
  createPasswordChangedToken: function () {
    const resetToken = crypto.randomBytes(32).toString("hex"); // Tạo token đặt lại mật khẩu ngẫu nhiên
    this.passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex"); // Băm token đặt lại mật khẩu
    this.passwordResetExpires = Date.now() + 15 * 60 * 1000; // Đặt thời gian hết hạn là 15 phút
    return resetToken;
  },
};

// Xuất model
module.exports = mongoose.model("User", userSchema);
