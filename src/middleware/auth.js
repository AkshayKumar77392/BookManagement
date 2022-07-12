const jwt = require("jsonwebtoken")
const booksModel = require("../model/booksModel")
const mongoose = require("mongoose")

    const authenticate = function (req, res, next) {
        try {
            let token = req.headers["x-api-key"];
            if (!token) return res.status(401).send({ status: false, msg: "token must be present" });
             decodedToken = jwt.verify(token, "book-management", 
            
            function(err){
                if(err)
                return res.status(401).send({status:false,message:"Token is NOT Valid"})
    
                next()
            } );
            //if (!decodedToken) return res.status(400).send({ status: false, msg: "token is invalid" });
        } catch (error) {
            res.status(500).send({ msg: error.message })
        }
    }
    





const authorise = async function (req, res, next) {
    try{
    let token = req.headers["x-api-key"];
    if (!token) token = req.headers["x-api-key"];

    let decodedToken = jwt.verify(token, "book-management")

    if (!decodedToken) return res.send({ status: false, msg: "token is not valid" })
    bookToBeModified = req.params.bookId
    var isValid = mongoose.Types.ObjectId.isValid(bookToBeModified)
    if (!isValid) return res.status(400).send({ status: false, msg: "enter valid id" })
    let bookData = await booksModel.findById(bookToBeModified)
    if(!bookData){return res.status(404).send({status:false,msg:"book not found"})}
    let userId = bookData.userId
    let userLoggedIn = decodedToken.userId
    if (userId == userLoggedIn) {
        next()
    } else { return res.status(403).send({ status: false, msg: 'User logged is not allowed to modify the requested book data' }) }
}
catch (error) {
    res.status(500).send({ msg: error.message })
}
}

module.exports = { authenticate, authorise}
