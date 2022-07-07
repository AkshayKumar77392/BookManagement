const booksModel = require("../model/booksModel");
const userModel = require ("../model/userModel");
const {isValid}= require("../controller/userController");
const moment = require("moment");
const mongoose = require("mongoose");

const createBook = async function(req, res){
    try{
        const details = req.body;
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
    //     details.releasedAt=releasedAt.toString()
    //     if (!releasedAt || releasedAt===undefined) { return res.status(400).send({ status: false, msg: "releasedAt is required" }) }
    //      if (typeof releasedAt !== "string" || value.trim().length === 0) { return res.status(400).send({ status: false, msg: "releasedAt should be of type date" }) }
        
       
        const data = await booksModel.create(details)

        res.status(200).send({status: true, data: data})
    }
    catch(err){
        res.status(500).send({status: false, msg: err.message});
    }
}

module.exports = { createBook }

