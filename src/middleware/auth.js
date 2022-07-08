const jwt = require("jsonwebtoken")
const bookModel = require("../model/booksModel")
let decodedToken;
    const authenticate = function (req, res, next) {
        try {
            let token = req.headers["x-api-key"];
            if (!token) return res.status(400).send({ status: false, msg: "token must be present" });
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
    try {
        let author_Id = decodedToken.authorId
        let blogId = req.params.blogId;
        let author = await bookModel.findOne({
            authorId: author_Id,
            _id: blogId
        });
        if (author == null) return res.status(403).send({
            status: false,
            msg: "You are not authorised to do the changes"
        });
        next()
    } catch (error) {
        res.status(500).send({ msg: error.message })

    }
}

module.exports = { authenticate, authorise }
