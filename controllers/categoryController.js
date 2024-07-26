const asyncHandler = require("express-async-handler");
const Category = require("../model/Category");

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: API quản lý danh mục
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Tạo danh mục mới
 *     tags: [Categories]
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
 *         description: Tạo danh mục thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const category = await Category.create({ name });
  res.status(201).json(category);
});

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lấy tất cả danh mục
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Lấy danh mục thành công
 *       500:
 *         description: Lỗi server
 */
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).json(categories);
});

module.exports = {
  createCategory,
  getAllCategories,
};
