const express = require('express');
const router = express.Router();
const { createUser, loginUser } = require("../controller/userController")
const { createBook, updateBook,getBookByQuery, getBookById, deleteBook } = require("../controller/bookController")
const { authenticate,authorise } = require("../middleware/auth")
const { createReview, deleteReview ,updateReview} = require("../controller/reviewController")

//user Api
router.post("/register", createUser)
router.post("/login", loginUser)
// book Api
router.post("/books", authenticate, createBook)
router.put("/books/:bookId", authenticate, authorise, updateBook)
router.get("/books", authenticate, getBookByQuery)
router.get("/books/:bookId", authenticate, getBookById)
router.delete("/books/:bookId", authenticate,authorise, deleteBook)
//review Api
router.post("/books/:bookId/review", createReview)
router.delete("/books/:bookId/review/:reviewId", deleteReview)
router.put("/books/:bookId/review/:reviewId",updateReview)


module.exports = router;