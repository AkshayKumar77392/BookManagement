const booksModel = require("../model/booksModel");
const userModel = require("../model/userModel");
const { isValid } = require("../controller/userController");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const reviewModel = require("../model/reviewModel");


const createBook = async function (req, res) {
    try {
        const details = req.body;
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = details;
        //validation for empty body
        if (Object.keys(details).length < 1) { return res.status(400).send({ msg: "Insert data :Bad request" }) }

        //title validation 
        if (!isValid(title)) { return res.status(400).send({ status: false, msg: "title is required and it must be string" }) }

        let bookTitle = /\w*\s*|\w|\D/.test(title.trim())
        if (!bookTitle) return res.status(400).send({ status: false, msg: "enter valid title" })
        let findTitle = await booksModel.find({ title: title })
        if (findTitle.length !== 0) return res.status(400).send({ status: false, msg: "Title  is already used, Please use a new title" })


        //excerpt validation
        if (!isValid(excerpt)) { return res.status(400).send({ status: false, msg: "excerpt is required and it must be string" }) }

        let bookExcerpt = /\w*\s*|\w|\D/.test(excerpt.trim())
        if (!bookExcerpt) return res.status(400).send({ status: false, msg: "enter valid excerpt" })


        //userId validation
        if (!userId || userId === undefined) return res.status(400).send({ status: false, msg: "userId is required" })
        var isValidId = mongoose.Types.ObjectId.isValid(userId)
        if (!isValidId) return res.status(400).send({ status: false, msg: "Enter valid user id" })
        let userDetails = await userModel.findOne({ _id: userId });
        if (!userDetails) { res.status(400).send({ status: false, msg: "The user with the given user id doesn't exist" }) };

        let token = req.headers["x-api-key"];
        if (!token) token = req.headers["x-api-key"];

        let decodedToken = jwt.verify(token, "book-management")
        let userLoggedIn = decodedToken.userId
        if (userId != userLoggedIn) { res.status(403).send({ status: false, msg: "enter your own id" }) };


        //ISBN validation
        if (!isValid(ISBN)) { return res.status(400).send({ status: false, msg: "ISBN is required and it must be string" }) }

        let bookISBN = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN.trim())
        if (!bookISBN) return res.status(400).send({ status: false, msg: "enter valid ISBN" })
        let findISBN = await booksModel.find({ ISBN: ISBN })
        if (findISBN.length !== 0) return res.status(400).send({ status: false, msg: "ISBN  is already used, Please use a new ISBN" })

        //category validation
        if (!isValid(category)) { return res.status(400).send({ status: false, msg: "category is required and it must be string" }) }

        let bookCategory = /^[a-zA-Z\s]*$/.test(category.trim())
        if (!bookCategory) return res.status(400).send({ status: false, msg: "enter valid category " })


        //subcategory validation 
        if (subcategory !== undefined && typeof subcategory === "string") {
            let bookSubcategory = /^[a-zA-Z\s]*$/.test(subcategory.trim())
            if (!bookSubcategory) return res.status(400).send({ status: false, msg: "enter valid subcategory1 " })
        }
        else if (typeof subcategory !== "string" || subcategory.trim().length === 0) {
            if (Array.isArray(subcategory)) {
                for (let i = 0; i < subcategory.length; i++) {
                    if (typeof subcategory[i] !== 'string') return res.status(400).send({ status: false, msg: " subcategory should be string" })
                    let bookSubcategory = /^[a-zA-Z\s]*$/.test(subcategory[i].trim())
                    if (!bookSubcategory) return res.status(400).send({ status: false, msg: "enter valid subcategory2" })

                }

            } else { return res.status(400).send({ status: false, msg: "subcategory should contain string values" }) }
        }


        //releasedAt validation
        if (releasedAt === undefined || releasedAt.trim().length === 0) return res.status(400).send({ status: false, msg: "date is required" })
        bookReleasedAt = /^\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9]))$/.test(releasedAt.trim())
        if (!bookReleasedAt) return res.status(400).send({ status: false, msg: "enter valid date " })


        const data = await booksModel.create(details)

        res.status(201).send({ status: true, message:"Success", data: data })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}
const getBookByQuery = async function (req, res) {
    try {

        let id = req.query.userId
        let Category = req.query.category
        let subcategory = req.query.subcategory
        if (id === undefined && Category === undefined && subcategory === undefined) {
            let allBooks = await booksModel.find({ isDeleted: false })

            if (allBooks.length == 0) { return res.status(404).send({ status: false, msg: " no books found" }) }
            else { res.status(200).send({ status: true, data: allBooks }) }
        }
        else {
            let booksWithFilter = await booksModel.find({ isDeleted: false, $or: [{ userId: id }, { category: Category }, { subcategory: subcategory }] }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 });
            if (booksWithFilter.length == 0) {
                res.status(404).send({ status: false, msg: "no book found" })
            }
            else {

                booksWithFilter.sort(function (a, b) {
                    var textA = a.title.toUpperCase();
                    var textB = b.title.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;

                });

                res.status(200).send({ status: true, data: bookDetails })
            }
        }
    }


    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}


const updateBook = async function (req, res) {
    try {
        let id = req.params.bookId;
        let data = req.body;

        let { title, excerpt, ISBN, releasedAt } = data
        let reviewKeys = ["title", "excerpt", "ISBN", "releasedAt"]
        for (let i = 0; i < Object.keys(req.body).length; i++) {
            let keyPresent = reviewKeys.includes(Object.keys(req.body)[i])
            if (!keyPresent)
                return res.status(400).send({ status: false, msg: "Wrong Key present" })
        }

        if (Object.keys(data).length < 1) { return res.status(400).send({ msg: "Insert data you want to update" }) }

        let book = await booksModel.findOne({ _id: id, isDeleted: false });

        if (title) {

            if (!isValid(title)) { return res.status(400).send({ status: false, msg: "title is required and it must be string" }) }

            let bookTitle = /\w*\s*|\w|\D/.test(title.trim())
            if (!bookTitle) return res.status(400).send({ status: false, msg: "enter valid title" })
            let findTitle = await booksModel.find({ title: title })
            if (findTitle.length !== 0) return res.status(400).send({ status: false, msg: "Title  is already used, Please use a new title" })

            book.title = title
        };

        if (releasedAt) {

            if (releasedAt === undefined || releasedAt.trim().length === 0) return res.status(400).send({ status: false, msg: "date is required" })
            bookReleasedAt = /^\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9]))$/.test(releasedAt.trim())
            if (!bookReleasedAt) return res.status(400).send({ status: false, msg: "enter valid date " })

            book.releasedAt = releasedAt
        };

        if (ISBN) {

            if (!isValid(ISBN)) { return res.status(400).send({ status: false, msg: "ISBN is required and it must be string" }) }

            let bookISBN = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN.trim())
            if (!bookISBN) return res.status(400).send({ status: false, msg: "enter valid ISBN" })
            let findISBN = await booksModel.find({ ISBN: ISBN })
            if (findISBN.length !== 0) return res.status(400).send({ status: false, msg: "ISBN  is already used, Please use a new ISBN" })

            book.ISBN = ISBN
        };

        if (excerpt) {
            if (!isValid(excerpt)) { return res.status(400).send({ status: false, msg: "excerpt is required and it must be string" }) }

            let bookExcerpt = /\w*\s*|\w|\D/.test(excerpt.trim())
            if (!bookExcerpt) return res.status(400).send({ status: false, msg: "enter valid excerpt" })

            book.excerpt=excerpt
        }

        let updateData = await booksModel.findByIdAndUpdate({ _id: id }, book, {
            new: true,
        });
        res.status(200).send({ status: true, msg: updateData });
    } catch (err) {
        res.status(500).send({ msg: 'Error', error: err.message });
    }
};






//get by id
const getBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId;

        var isValidId = mongoose.Types.ObjectId.isValid(bookId)
        if (!isValidId) return res.status(400).send({ status: false, msg: "Enter valid book id" })

        let saveData = await booksModel.findById({ _id: bookId, isDeleted: false }).select({ __v: 0, deletedAt: 0 })
        if (!saveData) { return res.status(404).send({ status: false, msg: "book not found" }) }


        let data = await reviewModel.find({ bookId: bookId }).select({ isDeleted: 0, __v: 0 })


        let book = saveData._doc
        bookDetails = { ...book, reviewsData: data };


        res.status(200).send({ ststus: true, data: bookDetails })
    } catch (err) {
        res.status(500).send({ msg: 'Error', error: err.message });
    }
};




//delete book
const deleteBook = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let id = await booksModel.findById({ _id: bookId, isDeleted: false })
        if (id) {
            let updateBook = await booksModel.findOneAndUpdate({ _id: bookId }, { isDeleted: true }, { new: true })
            updateBook.deletedAt = Date.now()
            res.status(200).send({ status: true, msg: "book deleted now", deletedAt: updateBook.deletedAt })
        }
        else { res.status(404).send({ msg: "book not found" }) }
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }

}

module.exports = { createBook, updateBook, getBookByQuery, getBookById, deleteBook }

