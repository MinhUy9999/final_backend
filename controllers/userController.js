const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const User = require("../model/User");
const Product = require("../model/Product");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../middlewares/jwt");
const validator = require("validator");

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management API
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Đăng ký người dùng mới
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               address:
 *                 type: string
 *               mobile:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: ["admin", "user"]
 *                 example: "user"
 *             required:
 *               - firstname
 *               - lastname
 *               - email
 *               - password
 *               - address
 *               - mobile
 *               - role
 *     responses:
 *       200:
 *         description: Đăng ký thành công
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, firstname, lastname, address, mobile, role } = req.body;
  if (!email || !password || !lastname || !firstname || !address || !mobile || !role) {
    return res.status(400).json({
      success: false,
      mes: "Thiếu thông tin",
    });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      mes: "Email không hợp lệ",
    });
  }
  if (!validator.isMobilePhone(mobile)) {
    return res.status(400).json({
      success: false,
      mes: "Số điện thoại không hợp lệ",
    });
  }
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      mes: "Mật khẩu phải có ít nhất 8 ký tự",
    });
  }
  const user = await User.findOne({ email: email });
  if (user) {
    return res.status(400).json({ success: false, mes: "Người dùng đã tồn tại" });
  } else {
    const newUser = await User.create(req.body);
    return res.status(200).json({
      success: true,
      mes: "Đăng ký thành công. Vui lòng đăng nhập",
      user: newUser,
    });
  }
});

/**
 * @swagger
 * components:
 *   schemas:
 *     UserLogin:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *
 * /api/login:
 *   post:
 *     summary: Đăng nhập tài khoản người dùng
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 accessToken:
 *                   type: string
 *                 userData:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       500:
 *         description: Lỗi server
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({
      success: false,
      mes: "Thiếu thông tin",
    });
  if (!validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      mes: "Email không hợp lệ",
    });
  }
  const user = await User.findOne({ email: email });
  if (user && (await user.isCorrectPassword(password))) {
    const { password, role, refreshToken, ...userData } = user.toObject();
    const accessToken = generateAccessToken(user._id, role);
    const newRefreshToken = generateRefreshToken(user._id);
    await User.findByIdAndUpdate(
      user._id,
      { refreshToken: newRefreshToken },
      { new: true }
    );
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      success: true,
      accessToken,
      userData,
    });
  } else {
    return res.status(400).json({ success: false, mes: "Thông tin đăng nhập không chính xác" });
  }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng với phân trang và tìm kiếm
 *     tags: [Users]
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
 *         description: Số lượng người dùng mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm người dùng theo tên
 *     responses:
 *       200:
 *         description: Lấy danh sách người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalUsers:
 *                   type: integer
 *                   example: 50
 *                 totalPages:
 *                   type: integer
 *                   example: 5
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Lỗi server
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const skip = (page - 1) * limit;
  const query = search
    ? { $or: [{ firstname: { $regex: search, $options: 'i' } }, { lastname: { $regex: search, $options: 'i' } }] }
    : {};

  const users = await User.find(query).skip(skip).limit(Number(limit));
  const totalUsers = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    totalUsers,
    totalPages: Math.ceil(totalUsers / limit),
    currentPage: Number(page),
    users,
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lấy thông tin người dùng theo ID
 *     tags: [Users]
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
 *         description: Lấy thông tin người dùng thành công
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({ message: "Không tìm thấy người dùng" });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Cập nhật thông tin người dùng theo ID
 *     tags: [Users]
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
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật thông tin người dùng thành công
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */
const updateUser = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    
  });
 if (updatedUser) {
    res.status(200).json(updatedUser);
  } else {
    res.status(404).json({ message: "Không tìm thấy người dùng" });
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Xóa người dùng theo ID
 *     tags: [Users]
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
 *         description: Xóa người dùng thành công
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */
const deleteUser = asyncHandler(async (req, res) => {
  const deletedUser = await User.findByIdAndDelete(req.params.id);
  if (deletedUser) {
    res.status(200).json({ message: "Người dùng đã được xóa" });
  } else {
    res.status(404).json({ message: "Không tìm thấy người dùng" });
  }
});

/**
 * @swagger
 * /api/cart:
 *   put:
 *     summary: Cập nhật giỏ hàng của người dùng
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID sản phẩm
 *               quantity:
 *                 type: number
 *                 description: Số lượng sản phẩm
 *                 default: 1
 *     responses:
 *       200:
 *         description: Cập nhật giỏ hàng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Yêu cầu không hợp lệ
 *       401:
 *         description: Không được phép
 *       404:
 *         description: Không tìm thấy sản phẩm
 *       500:
 *         description: Lỗi server
 */
const updateCart = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { id, quantity = 1 } = req.body;

  if (!userId) {
    return res.status(400).json({ success: false, mes: "Thiếu thông tin sản phẩm" });
  }
  const user = await User.findById(userId).select("cart");
  if (!user) {
    return res.status(404).json({ success: false, mes: "Không tìm thấy người dùng" });
  }

  const product = await Product.findById(id);
  if (!product) {
    return res.status(400).json({ success: false, mes: "Không tìm thấy sản phẩm" });
  }

  const alreadyProduct = user.cart.find((el) => el.product && el.product.toString() === id);

  if (alreadyProduct) {
    const response = await User.updateOne(
      { _id: userId, "cart.product": id },
      {
        $set: {
          "cart.$.quantity": quantity,
          "cart.$.price": product.price,
          "cart.$.title": product.name,
          "cart.$.image": product.image,
        },
      },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      mes: response ? "Cập nhật giỏ hàng thành công" : "Có lỗi xảy ra",
    });
  } else {
    const response = await User.findByIdAndUpdate(
      userId,
      {
        $push: {
          cart: {
            product: id,
            quantity,
            price: product.price,
            title: product.name,
            image: product.image,
          },
        },
      },
      { new: true }
    );
    return res.status(200).json({
      success: response ? true : false,
      mes: response ? "Cập nhật giỏ hàng thành công" : "Có lỗi xảy ra",
    });
  }
});

// /**
//  * @swagger
//  * /api/users/search:
//  *   get:
//  *     summary: Tìm kiếm người dùng theo tên với phân trang
//  *     tags: [Users]
//  *     security:
//  *       - BearerAuth: []
//  *     parameters:
//  *       - in: query
//  *         name: page
//  *         schema:
//  *           type: integer
//  *           default: 1
//  *         description: Số trang
//  *       - in: query
//  *         name: limit
//  *         schema:
//  *           type: integer
//  *           default: 10
//  *         description: Số lượng người dùng mỗi trang
//  *       - in: query
//  *         name: search
//  *         schema:
//  *           type: string
//  *         description: Tìm kiếm người dùng theo tên hoặc ID
//  *     responses:
//  *       200:
//  *         description: Tìm kiếm người dùng thành công
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 totalUsers:
//  *                   type: integer
//  *                   example: 50
//  *                 totalPages:
//  *                   type: integer
//  *                   example: 5
//  *                 currentPage:
//  *                   type: integer
//  *                   example: 1
//  *                 users:
//  *                   type: array
//  *                   items:
//  *                     $ref: '#/components/schemas/User'
//  *       500:
//  *         description: Lỗi server
//  */
// const searchUsers = asyncHandler(async (req, res) => {
//   const { page = 1, limit = 10, search = '' } = req.query;
//   const skip = (page - 1) * limit;
//   let query = {};

//   if (search) {
//     const isValidObjectId = mongoose.Types.ObjectId.isValid(search);
//     query = isValidObjectId
//       ? { _id: search }
//       : { $or: [{ firstname: { $regex: search, $options: 'i' } }, { lastname: { $regex: search, $options: 'i' } }] };
//   }

//   const users = await User.find(query).skip(skip).limit(Number(limit));
//   const totalUsers = await User.countDocuments(query);

//   res.status(200).json({
//     success: true,
//     totalUsers,
//     totalPages: Math.ceil(totalUsers / limit),
//     currentPage: Number(page),
//     users,
//   });
// });

module.exports = {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateCart,
 
};
