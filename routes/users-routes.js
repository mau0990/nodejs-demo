const express = require("express");
const usersController = require('../controllers/users-controller');
const router = express.Router();
const {check} = require('express-validator');

router.get("/", usersController.getAllUsers);
router.post("/signup", usersController.signUpUser);
router.post("/login", [
    check('email').isEmail(),
    check('name').notEmpty()
], usersController.loginUser);

module.exports = router;