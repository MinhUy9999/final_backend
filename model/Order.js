const mongoose = require("mongoose"); // Xóa dòng này nếu đã được yêu cầu trước đó

// Khai báo Schema của model Mongo
var OrderSchema = new mongoose.Schema(
  {
    products: [
      {
        product: { type: mongoose.Types.ObjectId, ref: "Product" }, // Tham chiếu đến model "Product"
        quantity: Number, // Số lượng sản phẩm
        price: Number, // Giá sản phẩm
        name: String, // Tên sản phẩm
        image: String, // Hình ảnh sản phẩm
      },
    ],
    status: {
      type: String,
      default: "Successed", // Giá trị mặc định là "Successed"
      enum: ["Cancelled", "Successed"], // Chỉ chấp nhận giá trị "Cancelled" hoặc "Successed"
      // Sử dụng npm stripe nếu bạn sử dụng thanh toán trực tuyến
    },
    total: Number, // Tổng số tiền của đơn hàng
    orderBy: {
      type: mongoose.Types.ObjectId,
      ref: "User", // Tham chiếu đến model "User"
    },
    address: {
      type: String,
      ref: "User", // Địa chỉ người dùng, tham chiếu đến model "User"
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Xuất model
module.exports = mongoose.model("Order", OrderSchema);
