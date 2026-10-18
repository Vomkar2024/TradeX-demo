const express = require("express");
const auth = require("../middlewares/authMiddleware.js");
const { register, login, fetchUserById, fetchUsers, logout, resetPassword } = require("../controllers/userController.js");

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/reset-password', resetPassword);
router.post('/forgot-password', resetPassword);
router.get('/fetch-user/:id', auth, fetchUserById);
router.get('/fetch-users', auth, fetchUsers);

module.exports = router;
