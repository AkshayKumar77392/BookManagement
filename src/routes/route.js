const express = require('express');
const router = express.Router();
const { createUser, loginUser } = require("../controller/userController")
const {createBook,updateBook} = require("../controller/bookController")
const {authenticate,authorise} = require("../middleware/auth")



router.post("/register", createUser)
router.post("/login", loginUser)
router.post("/books",authenticate,createBook)
router.put("/books/:bookId",updateBook)



module.exports = router;