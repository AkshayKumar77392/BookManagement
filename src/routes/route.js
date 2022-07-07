const express = require('express');
const router = express.Router();
const { createUser, loginUser } = require("../controller/userController")
const {createBook,updateBook,getBook} = require("../controller/bookController")




router.post("/register", createUser)
router.post("/login", loginUser)
router.post("/books",createBook)
router.put("/books/:bookId",updateBook)
router.get("/books",getBook)



module.exports = router;