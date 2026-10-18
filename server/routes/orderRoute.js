const express = require("express");
const { fetchOrders } = require("../controllers/orderController.js");
const auth = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.get('/fetch-orders', auth, fetchOrders);

module.exports = router;
