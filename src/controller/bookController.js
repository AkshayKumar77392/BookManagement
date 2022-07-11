const booksModel = require("../model/booksModel");
const userModel = require("../model/userModel");
const { isValid } = require("../controller/userController");
const moment = require("moment");
const mongoose = require("mongoose");


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

        //ISBN validation
        if (!isValid(ISBN)) { return res.status(400).send({ status: false, msg: "ISBN is required and it must be string" }) }

        let bookISBN = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN.trim())
        if (!bookISBN) return res.status(400).send({ status: false, msg: "enter valid ISBN" })
        let findISBN = await booksModel.find({ ISBN: ISBN })
        if (findISBN.length !== 0) return res.status(400).send({ status: false, msg: "ISBN  is already used, Please use a new title" })

        //category validation
        if (!isValid(category)) { return res.status(400).send({ status: false, msg: "category is required and it must be string" }) }

        let bookCategory = /^[a-zA-Z ]{2,30}/.test(category.trim())
        if (!bookCategory) return res.status(400).send({ status: false, msg: "enter valid category " })


        //subcategory validation 
        if (subcategory !== undefined && subcategory === "string") {
            let bookSubcategory = /^[a-zA-Z ]{2,50}/.test(subcategory.trim())
            if (!bookSubcategory) return res.status(400).send({ status: false, msg: "enter valid subcategory " })
        }
        else if (typeof subcategory !== "string" || subcategory.trim().length === 0) {
            if (Array.isArray(subcategory)) {
                for (let i = 0; i < subcategory.length; i++) {
                    if (typeof subcategory[i] !== 'string') return res.status(400).send({ status: false, msg: " subcategory should be string" })
                    let bookSubcategory = /^[a-zA-Z ]{2,50}/.test(subcategory[i].trim())
                    if (!bookSubcategory) return res.status(400).send({ status: false, msg: "enter valid subcategory " })

                }

            } else { return res.status(400).send({ status: false, msg: "subcategory should contain string values" }) }
        }


        //releasedAt validation
        if (releasedAt === undefined || releasedAt.trim().length === 0) return res.status(400).send({ status: false, msg: "date is required" })
        bookReleasedAt = /^\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9]))$/.test(releasedAt.trim())
        if (!bookReleasedAt) return res.status(400).send({ status: false, msg: "enter valid date " })


        const data = await booksModel.create(details)

        res.status(200).send({ status: true, data: data })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}
const getBook = async function (req, res) {
    try {
        let q = req.query;
        let filter = {
            isDeleted: false,
            ...q
        };
        // if(q.userId){
        //     const validate = await userController.findById(q.userId);
        //     if(!validate) return res.status(404).send({status:false, msg: "userId is not valid"});
        // }

        const data = await booksModel.find(filter).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, releasedAt: 1, reviews: 1 });
        if (data.length == 0) return res.status(404).send({ status: false, msg: "No book is found" });

        data.sort(function (a, b) {
            var textA = a.title.toUpperCase();
            var textB = b.title.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;

        });



        res.status(201).send({ status: true, data: data })
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}


const updateBook = async function (req, res) {
    try {
        let id = req.params.bookId;
        let data = req.body;
        if (Object.keys(data).length < 1) { return res.status(400).send({ msg: "Insert data you want to update" }) }

        let book = await booksModel.findOne({ _id: id, isDeleted: false });
        if (book === null) {
            return res.status(404).send({ status: false, msg: 'No such book found' });
        }
        let findTitle = await booksModel.find({ title: data.title })
        if (findTitle.length !== 0) return res.status(400).send({ status: false, msg: "Title  is already used, Please use a new title" })

        let givenISBN = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(data.ISBN.trim())
        if (!givenISBN) return res.status(400).send({ status: false, msg: "enter valid ISBN" })

        let findISBN = await booksModel.find({ ISBN: data.ISBN })
        if (findISBN.length != 0) return res.status(400).send({ status: false, msg: "ISBN is already used" })
        if (data.title) {
            book.title = data.title
        };
        if (data.releasedAt) {
            book.releasedAt = data.releasedAt
        };
        if (data.ISBN) {
            book.ISBN = data.ISBN
        };

        let updateData = await booksModel.findByIdAndUpdate({ _id: id }, book, {
            new: true,
        });
        res.status(200).send({ status: true, msg: updateData });
    } catch (err) {
        res.status(500).send({ msg: 'Error', error: err.message });
    }
};






//get by id
const getBooks = async function (req, res) {
    try {
        let bookId = req.params.bookId;

        let saveData = await booksModel.findById({ _id: bookId, isDeleted: false })
        if (!saveData) { return res.status(404).send({ status: false, msg: "book not found" }) }

        res.status(200).send({ ststus: true, data: saveData })
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

module.exports = { createBook, updateBook, getBook, getBooks, deleteBook }

