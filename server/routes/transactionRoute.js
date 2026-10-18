const express = require("express");
const { fetchTransactions, newTransaction } = require("../controllers/transactionController.js");
const auth = require("../middlewares/authMiddleware.js");

const router = express.Router();

router.get('/fetch-transactions', auth, fetchTransactions);
router.post('/newTransaction', auth, newTransaction);

module.exports = router;
