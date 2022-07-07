const booksModel = require("../model/booksModel");
const userModel = require("../model/userModel");
const userController = require("../model/userModel");
const bookController = require("../model/booksModel");
const userModel = require ("../model/userModel");
const {isValid}= require("../controller/userController");
const moment = require("moment");
const mongoose = require("mongoose");


const createBook = async function (req, res) {
    try {
        const details = req.body;
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = details;

        if (!title) return res.status(400).send({ status: false, msg: "Title of the book is required" });

        if (!excerpt) return res.status(400).send({ status: false, msg: "excerpt of the book is required" });

        if (!userId) return res.status(400).send({ status: false, msg: "user_Id of the book is required" });
        let userDetails = await userModel.findOne({ _id: userId });
        if (!userDetails) { res.status(400).send({ status: false, msg: "The user with the given user id doesn't exist" }) };

        if (!ISBN) return res.status(400).send({ status: false, msg: "ISBN of the book is required" });

        if (!category) return res.status(400).send({ status: false, msg: "Category of the book is required" });

        if (!subcategory) return res.status(400).send({ status: false, msg: "subCategory of the book is required" });

        if (!releasedAt) return res.status(400).send({ status: false, msg: "released at the book is required" });

        const validate = await userController.findById(details.userId);
        if (!validate) return res.status(400).send({ status: false, msg: "You have entered a invalid user_Id" });

        const data = await bookController.create(details)
        res.status(200).send({ status: true, data: data })
        let {title, excerpt, userId, ISBN, category,subcategory, reviews,releasedAt} = details;

        //validation for empty body
        if (Object.keys(details).length < 1) { return res.status(400).send({ msg: "Insert data :Bad request" }) }

        //title validation 
        if (!isValid(title)) { return res.status(400).send({ status: false, msg: "title is required and it must be string" }) }
        
        let bookTitle = /\w*\s*|\w|\D/.test(title.trim())
        if (!bookTitle) return res.status(400).send({ status: false, msg: "enter valid title" })
       

        //excerpt validation
        if (!isValid(excerpt)) { return res.status(400).send({ status: false, msg: "excerpt is required and it must be string" }) }
        
        let bookExcerpt= /\w*\s*|\w|\D/.test(excerpt.trim())
        if (!bookExcerpt) return res.status(400).send({ status: false, msg: "enter valid excerpt" })
        
        
        //userId validation
        if (!userId || userId===undefined) return res.status(400).send({ status: false, msg: "userId is required" })
        var isValidId = mongoose.Types.ObjectId.isValid(userId)
        if (!isValidId) return res.status(400).send({ status: false, msg: "Enter valid user id" })

        //ISBN validation
        if (!isValid(ISBN)) { return res.status(400).send({ status: false, msg: "ISBN is required and it must be string" }) }
        
        let bookISBN= /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN.trim())
        if (!bookISBN) return res.status(400).send({ status: false, msg: "enter valid ISBN" })


        //category validation
        if (!isValid(category)) { return res.status(400).send({ status: false, msg: "category is required and it must be string" }) }
        
        let bookCategory= /^[a-zA-Z ]{2,30}/.test(category.trim())
        if (!bookCategory) return res.status(400).send({ status: false, msg: "enter valid category " })
        

        //subcategory validation 
        if (!isValid(subcategory)) { return res.status(400).send({ status: false, msg: "subcategory is required and it must be string" }) }
        
        let bookSubcategory= /^[a-zA-Z ]{2,30}/.test(subcategory.trim())
        if (!bookSubcategory) return res.status(400).send({ status: false, msg: "enter valid subcategory " })


    //    //releasedAt validation
    //     if (!releasedAt || releasedAt===undefined) { return res.status(400).send({ status: false, msg: "releasedAt is required" }) }
    //     if (typeof releasedAt !== "Date" || value.trim().length === 0) { return res.status(400).send({ status: false, msg: "releasedAt should be of type date" }) }
        
       
        const data = await booksModel.create(details)

        res.status(200).send({status: true, data: data})
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}



const updateBook = async function (req, res) {
    try {
        let id = req.params.bookId;
        console.log(id)
        let data = req.body;
        if (Object.keys(data).length < 1) { return res.status(400).send({ msg: "Insert data you want to update" }) }
        console.log(data)
        let book = await booksModel.findOne({ _id: id, isDeleted: false });
        if (book === null) {
            return res.status(404).send({ status: false, msg: 'No such blog found' });
        }
        let findTitle = await booksModel.find({ title: data.title })
        if (findTitle.length !== 0) return res.status(400).send({ status: false, msg: "Title  is already used, Please use a new title" })

        let findExcerpt = await booksModel.find({ excerpt: data.excerpt })
        if (findExcerpt.length !== 0) return res.status(400).send({ status: false, msg: "excerpt  is already used, please use a new excerpt" })

        //let givenISBN = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(data.ISBN.trim())
        //if (!givenISBN) return res.status(400).send({ status: false, msg: "enter valid ISBN" })

        /*let findISBN = await userModel.find({ ISBN: data.ISBN })
        if (findISBN.length !== 0) return res.status(400).send({ status: false, msg: "ISBN is already used" })*/
        if (data.title) {
            book.title = data.title
        };
        if (data.releasedAt) {
            book.releasedAt = data.releasedAt
            console.log(data.releasedAt)
            console.log(book.releasedAt )
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



module.exports = { createBook, updateBook }