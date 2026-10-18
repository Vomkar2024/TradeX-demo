const express = require("express");
const { buyStock, sellStock, fetchStocks } = require("../controllers/stockController.js");
const auth = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.post('/buyStock', auth, buyStock);
router.post('/sellStock', auth, sellStock);
router.get('/fetch-stocks', auth, fetchStocks);

module.exports = router;
