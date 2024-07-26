const Order = require("../model/Order");
const User = require("../model/User");
const asyncHandler = require("express-async-handler");

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/orders:
 *   post:
 *     summary: Tạo đơn hàng mới
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Tạo đơn hàng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 rs:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     products:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           product:
 *                             type: string
 *                           quantity:
 *                             type: number
 *                           price:
 *                             type: number
 *                           name:
 *                             type: string
 *                           image:
 *                             type: string
 *                     status:
 *                       type: string
 *                     total:
 *                       type: number
 *                     orderBy:
 *                       type: string
 *                     address:
 *                       type: string
 *       '400':
 *         description: Giỏ hàng trống
 *       '500':
 *         description: Lỗi server
 */

const createOrder = asyncHandler(async (req, res) => {
  const { userId } = req.user;
  const { address, status } = req.body;

  // Lấy thông tin người dùng từ cơ sở dữ liệu, bao gồm giỏ hàng
  const user = await User.findById(userId).populate("cart.product");
  if (!user || !user.cart.length) {
    return res.status(400).json({ success: false, mes: "Giỏ hàng trống" });
  }

  // Tạo dữ liệu đơn hàng từ giỏ hàng của người dùng
  const products = user.cart.map((item) => ({
    product: item.product.userId,
    quantity: item.quantity,
    price: item.product.price,
    name: item.product.name,
    image: item.product.image,
  }));

  const total = products.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  // Tạo đối tượng đơn hàng mới
  const data = { products, total, orderBy: userId, address };
  if (status) data.status = status;

  // Lưu đơn hàng vào cơ sở dữ liệu
  const rs = await Order.create(data);
  // Xóa giỏ hàng của người dùng sau khi tạo đơn hàng thành công
  user.cart = [];
  await user.save();

  // Trả về kết quả
  return res.status(200).json({
    success: true,
    rs: rs,
  });
});

module.exports = {
  createOrder,
};
