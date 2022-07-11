const express = require('express');
const router = express.Router();
const { createUser, loginUser } = require("../controller/userController")
const { createBook, updateBook, getBook, getBooks, deleteBook } = require("../controller/bookController")
const { authenticate } = require("../middleware/auth")
const { createReview, deleteReview ,updateReview} = require("../controller/reviewController")

//user Api
router.post("/register", createUser)
router.post("/login", loginUser)
// book Api
router.post("/books", authenticate, createBook)
router.put("/books/:bookId", authenticate, updateBook)
router.get("/books", authenticate, getBook)
router.get("/books/:bookId", authenticate, getBooks)
router.delete("/books/:bookId", authenticate, deleteBook)
//review Api
router.post("/books/:bookId", createReview)
router.delete("/books/:bookId/review/:reviewId", deleteReview)
router.put("/books/:bookId/review/:reviewId",updateReview)


module.exports = router;