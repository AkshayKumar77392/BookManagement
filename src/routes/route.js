const express = require('express');
const router = express.Router();
const { createUser, loginUser } = require("../controller/userController")
const { createBook, updateBook, getBook, getBooks, deleteBook } = require("../controller/bookController")
const { authenticate } = require("../middleware/auth")
const {createReview}= require("../controller/reviewController")

//user Api
router.post("/register", createUser)
router.post("/login", loginUser)
// book Api
router.post("/books", authenticate, createBook)
router.put("/books/:bookId", updateBook)
router.get("/books",authenticate,getBook)
router.get("/books/:bookId", getBooks)
router.delete("/books/:bookId", deleteBook)
//review Api
router.post("/books/:bookId",createReview)


module.exports = router;