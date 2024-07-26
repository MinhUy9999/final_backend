const asyncHandler = require("express-async-handler");
const Brand = require("../model/Brand");

/**
 * @swagger
 * tags:
 *   name: Brands
 *   description: API quản lý thương hiệu
 */

/**
 * @swagger
 * /api/brands:
 *   post:
 *     summary: Tạo thương hiệu mới
 *     tags: [Brands]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo thương hiệu thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
const createBrand = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const brand = await Brand.create({ name });
  res.status(201).json(brand);
});

/**
 * @swagger
 * /api/brands:
 *   get:
 *     summary: Lấy tất cả thương hiệu
 *     tags: [Brands]
 *     responses:
 *       200:
 *         description: Lấy thương hiệu thành công
 *       500:
 *         description: Lỗi server
 */
const getAllBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find();
  res.status(200).json(brands);
});

module.exports = {
  createBrand,
  getAllBrands,
};
