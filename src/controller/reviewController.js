const booksModel = require("../model/booksModel");
const reviewModel = require("../model/reviewModel");
const mongoose = require("mongoose");
const { isValid } = require("../controller/userController");


const createReview = async function (req, res) {
    try {
        const details = req.body;
        const bookId = req.params.bookId;

        if (Object.keys(details).length < 1) { return res.status(400).send({ msg: "Insert data :Bad request" }) }

        if (!bookId) return res.status(400).send({ status: false, msg: "bookId is required" })

        var isValidId = mongoose.Types.ObjectId.isValid(bookId)
        if (!isValidId) return res.status(400).send({ status: false, msg: "Enter valid user id" })
        let bookDetails = await booksModel.findOne({ _id: bookId, isDeleted: false });
        if (!bookDetails) { res.status(400).send({ status: false, msg: "The book with the given user id doesn't exist" }) };

        let { reviewedBy, reviewedAt, rating, reviews } = details;

        //validation for empty body
        // if (Object.keys(details).length < 1) { return res.status(400).send({ msg: "Insert data :Bad request" }) }



        //reviewedBy validation
      if(reviewedBy)
        if (reviewedAt === undefined || reviewedAt.trim().length === 0){ return res.status(400).send({ status: false, msg: "Reviewers name is required and it must be string" }) }

        let name = /^[a-zA-Z]{2,20}$/.test(reviewedBy.trim())
        if (!name) return res.status(400).send({ status: false, msg: "enter valid name" })
        

        //reviewedAt validation
        if (reviewedAt === undefined || reviewedAt.trim().length === 0) return res.status(400).send({ status: false, msg: "date is required" })
        bookreviewedAt = /^\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9]))$/.test(reviewedAt.trim())
        if (!bookreviewedAt) return res.status(400).send({ status: false, msg: "enter valid date " })


        //rating validation
        if (rating === undefined) return res.status(400).send({ status: false, msg: "rating is required" })
        let bookrating = /^[1-5]\d*(\.\d+)?$/.test(rating)
        if (!bookrating) return res.status(400).send({ status: false, msg: "enter valid rating" })

        //reviews validation
        if(reviews){
        if (!isValid(reviews)) { return res.status(400).send({ status: false, msg: "reviews is required and it must be string" }) }

        let bookreviews = /\w*\s*|\w|\D/.test(reviews.trim())
        if (!bookreviews) return res.status(400).send({ status: false, msg: "enter valid review" })
        }

        details.bookId=bookId
        const data = await reviewModel.create(details)
        bookDetails.reviews = bookDetails.reviews + 1;
      
        await booksModel.findOneAndUpdate({ _id: bookId }, { reviews: bookDetails.reviews, }, { new: true })

        
        let book=bookDetails._doc
        bookDetails = { ...book, reviewsData: data};
        

        res.status(201).send({ status: true,msg :"books list", data: bookDetails })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}



const updateReview = async (req, res) => {

    try {
        const reviewID = req.params.reviewId
        const bookId = req.params.bookId
        let dataToUpdate = req.body
        let updateQuery = {}

        let isBook = await booksModel.findOne({ _id: bookId, isDeleted: false })
        if (!isBook) {
            return res.status(404).send({ status: false, message: "Book Not Found, PLease check book Id" })
        }
        
        let isReview = await reviewModel.findOne({ _id: reviewID, isDeleted: false })
        if (!isReview) {
            return res.status(404).send({ status: false, message: "Review Not Found, Please Check Review Id" })
        }

        if (isReview['bookId'] != bookId) {
            return res.status(400).send({ status: false, message: "This review dosent belong To given Book Id" })
        }
        let { reviewedBy, rating, review } = dataToUpdate
        let reviewKeys = ["reviewedBy", "rating", "review"]
        for (let i = 0; i < Object.keys(req.body).length; i++) {
            let keyPresent = reviewKeys.includes(Object.keys(req.body)[i])
            if (!keyPresent)
                return res.status(400).send({ status: false, msg: "Wrong Key present" })
        }
        if (Object.keys(dataToUpdate).includes("reviewedBy")) {
            if (typeof reviewedBy != 'string') {
                return res.status(400).send({ status: false, message: "Please Give a proper Name" })
            }
            if ((reviewedBy.trim() == "") || (reviewedBy == null)) {
                reviewedBy = 'Guest'
            }
            updateQuery.reviewedBy = reviewedBy
        }

        if (Object.keys(dataToUpdate).includes("rating")) {
            if (typeof rating != 'number') {
                return res.status(400).send({ status: false, message: "invalid Rating Input" })
            }
            if (!(rating >= 1 && rating <= 5)) {
                return res.status(400).send({ status: false, message: "Invalid Rating! , please rate in beetween 1 to 5" })
            }
            updateQuery.rating = rating
        }

        if (Object.keys(dataToUpdate).includes("review")) {
            if (!validate.isValid(review)) {
                return res.status(400).send({ status: false, message: "Please Enter A Valid Review" })
            }
            updateQuery.review = review
        }

        const updatedReview = await reviewModel.findOneAndUpdate({ _id: reviewID, isDeleted: false },
            { $set: updateQuery },
            { new: true })

         let finalReview = { ...updatedReview.toObject() }
         delete finalReview.isDeleted
        // delete finalReview.updatedAt
         delete finalReview.__v
        return res.status(200).send({ status: true, message: "Success", Data: { ...isBook.toObject(), reviewsData: [finalReview] } })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}




const deleteReview = async function (req, res) {
    try {
        const bookId = req.params.bookId;
        const reviewId = req.params.reviewId;
        if (!bookId) return res.status(400).send({ status: false, msg: "bookId is required" })

        var isValidId = mongoose.Types.ObjectId.isValid(bookId)
        if (!isValidId) return res.status(400).send({ status: false, msg: "Enter valid book id" })

        let book = await booksModel.findOne({ _id: bookId, isDeleted: false });
        if (book === null) {
            return res.status(404).send({ status: false, msg: 'No such book found with the given bookId' });
        }

        if (!reviewId) return res.status(400).send({ status: false, msg: "reviewId is required" })

        var isValidId = mongoose.Types.ObjectId.isValid(reviewId)
        if (!isValidId) return res.status(400).send({ status: false, msg: "Enter valid review id" })

        let review = await reviewModel.findOne({ _id: reviewId, bookId: bookId, isDeleted: false });
        if (review === null) {
            return res.status(404).send({ status: false, msg: 'No such review found  with the given input data' });
        }
        await reviewModel.findByIdAndUpdate({ _id: reviewId }, { isDeleted: true }
        );
        if (book.reviews >= 1) {
            book.reviews = book.reviews - 1;
            await booksModel.findByIdAndUpdate({ _id: bookId }, { reviews: book.reviews })
            res.status(200).send({ status: true, message: "review is deleted sucessfully" })
        }

        } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}

module.exports = { createReview, deleteReview, updateReview }