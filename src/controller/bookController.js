const booksModel = require("../model/booksModel");
const userModel = require ("../model/userModel");
const userController = require("../model/userModel");
const bookController = require("../model/booksModel");
const validator = require("validator");

const createBook = async function(req, res){
    try{
        const details = req.body;
        let {title, excerpt, userId, ISBN, category,subcategory,releasedAt} = details;

        if(!title) return res.status(400).send({status: false, msg: "Title of the book is required"});
        if(!validator.isLength(title, {min: 5, max: 30})){return res.status(400).send({status: false, msg: 'The length of the title should contain minium 5 and maximum 30 charactors!'})};
        
        if(!excerpt) return res.status(400).send({status: false, msg: "excerpt of the book is required"});
        if(!validator.isLength(excerpt, {min: 5})){return res.status(400).send({status: false, msg: 'The length of excerpt should have atleast 5 letters.'})};
        
        if(!userId) return res.status(400).send({status: false, msg: "user_Id of the book is required"});
        let userDetails = await userModel.findOne({_id: userId});
        if(!userDetails){res.status(400).send({status: false, msg: "The user with the given user id doesn't exist"})};

        if(!ISBN) return res.status(400).send({status: false, msg: "ISBN of the book is required"});
        
        if(!category) return res.status(400).send({status: false, msg: "Category of the book is required"});

        if(!subcategory) return res.status(400).send({status: false, msg: "subCategory of the book is required"});

        if(!releasedAt) return res.status(400).send({status: false, msg: "released at the book is required"});

        const validate = await userController.findById(details.userId);
        if(!validate) return res.status(400).send({status: false, msg: "You have entered a invalid user_Id"});

        const data = await bookController.create(details)
        res.status(200).send({status: true, data: data})
    }
    catch(err){
        res.status(500).send({status: false, msg: err.message});
    }
}

module.exports = { createBook }

