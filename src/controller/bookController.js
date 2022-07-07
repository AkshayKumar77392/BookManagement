const booksModel = require("../model/booksModel");
const userModel = require("../model/userModel");
const userController = require("../model/userModel");
const bookController = require("../model/booksModel");
const {isValid}= require("../controller/userController");
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
        let findTitle = await booksModel.find({ title:title })
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
        let findISBN = await booksModel.find({ ISBN:ISBN })
        if (findISBN.length !== 0) return res.status(400).send({ status: false, msg: "ISBN  is already used, Please use a new title" })

        //category validation
        if (!isValid(category)) { return res.status(400).send({ status: false, msg: "category is required and it must be string" }) }

        let bookCategory = /^[a-zA-Z ]{2,30}/.test(category.trim())
        if (!bookCategory) return res.status(400).send({ status: false, msg: "enter valid category " })


        //subcategory validation 
        if (!isValid(subcategory)) { return res.status(400).send({ status: false, msg: "subcategory is required and it must be string" }) }

        let bookSubcategory = /^[a-zA-Z ]{2,30}/.test(subcategory.trim())
        if (!bookSubcategory) return res.status(400).send({ status: false, msg: "enter valid subcategory " })


    //    //releasedAt validation
    //     details.releasedAt=releasedAt.toString()
    //     if (!releasedAt || releasedAt===undefined) { return res.status(400).send({ status: false, msg: "releasedAt is required" }) }
    //      if (typeof releasedAt !== "string" || value.trim().length === 0) { return res.status(400).send({ status: false, msg: "releasedAt should be of type date" }) }
        
       
        const data = await booksModel.create(details)

        res.status(200).send({ status: true, data: data })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}
const getBook = async function(req, res){
    try{
        let q = req.query;
        let filter = {
            isDeleted: false,
            ...q
        };
        // if(q.userId){
        //     const validate = await userController.findById(q.userId);
        //     if(!validate) return res.status(404).send({status:false, msg: "userId is not valid"});
        // }

        const data = await booksModel.find(filter).select({_id:1,title:1,excerpt:1,userId:1,category:1,releasedAt:1,reviews:1});
        if(data.length == 0) return res.status(404).send({status:false, msg: "No book is found"});

        data.sort(function(a, b) {
            var textA = a.title.toUpperCase();
            var textB = b.title.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;

        });
        
        

        res.status(201).send({status: true, data: data})
    }catch(err){
        res.status(500).send({status: false, msg: err.message});
    }
}


const updateBook = async function (req, res) {
    try {
        let id = req.params.bookId;
        // console.log(id)
        let data = req.body;
        if (Object.keys(data).length < 1) { return res.status(400).send({ msg: "Insert data you want to update" }) }
        // console.log(data)
        let book = await booksModel.findOne({ _id: id, isDeleted: false });
        if (book === null) {
            return res.status(404).send({ status: false, msg: 'No such blog found' });
        }
        let findTitle = await booksModel.find({ title: data.title })
        if (findTitle.length !== 0) return res.status(400).send({ status: false, msg: "Title  is already used, Please use a new title" })

        let findExcerpt = await booksModel.find({ excerpt: data.excerpt })
        if (findExcerpt.length !== 0) return res.status(400).send({ status: false, msg: "excerpt  is already used, please use a new excerpt" })

        let givenISBN = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(data.ISBN.trim())
        if (!givenISBN) return res.status(400).send({ status: false, msg: "enter valid ISBN" })

        let findISBN = await userModel.find({ ISBN: data.ISBN })
        if (findISBN.length !== 0) return res.status(400).send({ status: false, msg: "ISBN is already used" })
        if (data.title) {
            book.title = data.title
        };
        if (data.releasedAt) {
            book.releasedAt = data.releasedAt
            console.log(data.releasedAt)
            console.log(book.releasedAt)
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

module.exports = { createBook, updateBook, getBook }