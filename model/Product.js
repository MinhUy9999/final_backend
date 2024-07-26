const mongoose = require("mongoose");

// Khai báo Schema của model Mongo
const productSchema = new mongoose.Schema(
  {
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand", // Tham chiếu đến model "Brand"
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Tham chiếu đến model "Category"
    },
    image: {
      type: String,
      required: true, // Bắt buộc phải có
    },
    name: {
      type: String,
      required: true, // Bắt buộc phải có
    },
    price: {
      type: Number,
      required: true, // Bắt buộc phải có
    },
    quantity: {
      type: Number,
      required: true, // Bắt buộc phải có
    },
    description: {
      type: String,
      required: true, // Bắt buộc phải có
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Xuất model
module.exports = mongoose.model("Product", productSchema);
