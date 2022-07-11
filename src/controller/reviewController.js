const booksModel = require("../model/booksModel");
const reviewModel = require("../model/reviewModel");
const mongoose = require("mongoose");


const createReview = async function (req, res) {
    try {
        const details = req.body;
        const bookId = req.params.bookId;

        if (!bookId || bookId === undefined) return res.status(400).send({ status: false, msg: "bookId is required" })

        var isValidId = mongoose.Types.ObjectId.isValid(bookId)
        if (!isValidId) return res.status(400).send({ status: false, msg: "Enter valid user id" })
        let bookDetails = await booksModel.findOne({ _id: bookId, isDeleted: false });
        if (!bookDetails) { res.status(400).send({ status: false, msg: "The book with the given user id doesn't exist" }) };

        let { reviewedBy, reviewedAt, rating, reviews } = details;
        //validation for empty body
        if (Object.keys(details).length < 1) { return res.status(400).send({ msg: "Insert data :Bad request" }) }

        const data = await reviewModel.create(details)
        bookDetails.reviews = bookDetails.reviews + 1;
        await booksModel.findOneAndUpdate({ _id: bookId }, { reviews: bookDetails.reviews }, { new: true })
        res.status(200).send({ status: true, data: data })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}

const deleteReview = async function (req, res) {
    try {
    const bookId = req.params.bookId;
    const reviewId = req.params.reviewId;
    if (!bookId || bookId === undefined) return res.status(400).send({ status: false, msg: "bookId is required" })

    var isValidId = mongoose.Types.ObjectId.isValid(bookId)
    if (!isValidId) return res.status(400).send({ status: false, msg: "Enter valid book id" })

    let book = await booksModel.findOne({ _id: bookId, isDeleted: false });
    if (book === null) {
        return res.status(404).send({ status: false, msg: 'No such book found with the given bookId' });
    }

    if (!reviewId || reviewId === undefined) return res.status(400).send({ status: false, msg: "reviewId is required" })

    var isValidId = mongoose.Types.ObjectId.isValid(reviewId)
    if (!isValidId) return res.status(400).send({ status: false, msg: "Enter valid review id" })

    let review = await reviewModel.findOne({ _id: reviewId, isDeleted: false });
    if (review === null) {
        return res.status(404).send({ status: false, msg: 'No such reiew found  with the given reviewId' });
    }
     await reviewModel.findByIdAndUpdate({ _id:  reviewId }, { isDeleted: true }
    );
    if(book.reviews>=1){
    book.reviews = book.reviews - 1;
    }
    else{
        book.reviews = book.reviews
    }
    res.status(200).send({ status: true, message: "review is deleted sucessfully" })
}
catch (err) {
    res.status(500).send({ status: false, msg: err.message });
}
}

module.exports = { createReview, deleteReview }