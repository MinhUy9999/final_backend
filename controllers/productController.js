const asyncHandler = require("express-async-handler");
const Product = require("../model/Product");

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: API quản lý sản phẩm
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Tạo sản phẩm mới
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               brand:
 *                 type: string
 *               image:
 *                 type: string
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *               description:
 *                 type: string
 *             required:
 *               - name
 *               - price
 *               - quantity
 *               - category
 *               - brand
 *               - image
 *               - description
 *     responses:
 *       201:
 *         description: Sản phẩm được tạo thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
const createProduct = asyncHandler(async (req, res) => {
  const newProduct = new Product(req.body);
  const savedProduct = await newProduct.save();
  res.status(201).json(savedProduct);
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Lấy sản phẩm theo ID
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sản phẩm được lấy thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */
const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("brand", "name")
      .populate("category", "name");
    if (!product) {
      return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lấy tất cả các sản phẩm với phân trang và tìm kiếm
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng sản phẩm mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm sản phẩm theo tên
 *     responses:
 *       200:
 *         description: Các sản phẩm được lấy thành công
 *       500:
 *         description: Lỗi server
 */
const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};

    const products = await Product.find(query)
      .skip(skip)
      .limit(Number(limit))
      .populate("brand", "name")
      .populate("category", "name");

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: Number(page),
      products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Cập nhật sản phẩm theo ID
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Sản phẩm được cập nhật thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */
const updateProduct = asyncHandler(async (req, res) => {
  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  if (updatedProduct) {
    res.status(200).json(updatedProduct);
  } else {
    res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Xóa sản phẩm theo ID
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sản phẩm được xóa thành công
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const deletedProduct = await Product.findByIdAndDelete(req.params.id);
  if (deletedProduct) {
    res.status(200).json({ message: "Sản phẩm đã được xóa" });
  } else {
    res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  }
});

module.exports = {
  createProduct,
  getProductById,
  getAllProducts,
  updateProduct,
  deleteProduct,
};
