const mongoose = require("mongoose");

// Khai báo Schema của model Mongo cho Brand
const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Bắt buộc phải có
    unique: true, // Phải là duy nhất
  },
});

// Xuất model
module.exports = mongoose.model("Brand", brandSchema);
