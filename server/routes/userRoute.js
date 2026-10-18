const express = require("express");
const auth = require("../middlewares/authMiddleware.js");
const { register, login, fetchUserById, fetchUsers, logout } = require("../controllers/userController.js");

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/fetch-user/:id', auth, fetchUserById);
router.get('/fetch-users', auth, fetchUsers);

module.exports = router;
