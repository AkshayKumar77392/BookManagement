const booksModel = require("../model/booksModel");
const userModel = require("../model/userModel");
const { isValid } = require("../controller/userController");
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken');
const reviewModel = require("../model/reviewModel");
const aws = require("aws-sdk")


aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "abc" + file.originalname, //HERE 
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            console.log(data)
            console.log("file uploaded succesfully")
            return resolve(data.Location)
        })

        // let data= await s3.upload( uploadParams)
        // if( data) return data.Location
        // else return "there is an error"

    })
}



const createBook = async function (req, res) {
    try {
        const details = req.body;
        let { title, excerpt, userId, ISBN, category, subcategory, releasedAt } = details;
        //validation for empty body
        if (Object.keys(details).length < 1) { return res.status(400).send({ message: "Insert data :Bad request" }) }

        //title validation 
        if (!isValid(title)) { return res.status(400).send({ status: false, message: "title is required and it must be string" }) }

        let bookTitle = /\w*\s*|\w|\D/.test(title.trim())
        if (!bookTitle) return res.status(400).send({ status: false, message: "enter valid title" })
        let findTitle = await booksModel.find({ title: title })
        if (findTitle.length !== 0) return res.status(400).send({ status: false, message: "Title  is already used, Please use a new title" })


        //excerpt validation
        if (!isValid(excerpt)) { return res.status(400).send({ status: false, message: "excerpt is required and it must be string" }) }

        let bookExcerpt = /\w*\s*|\w|\D/.test(excerpt.trim())
        if (!bookExcerpt) return res.status(400).send({ status: false, message: "enter valid excerpt" })


        //userId validation
        if (!userId || userId === undefined) return res.status(400).send({ status: false, message: "userId is required" })
        var isValidId = mongoose.Types.ObjectId.isValid(userId)
        if (!isValidId) return res.status(400).send({ status: false, message: "Enter valid user id" })
        let userDetails = await userModel.findOne({ _id: userId });
        if (!userDetails) { res.status(400).send({ status: false, message: "The user with the given user id doesn't exist" }) };
        //authorisation
        let token = req.headers["X-Api-Key"];
        if (!token) token = req.headers["x-api-key"];

        let decodedToken = jwt.verify(token, "book-management")
        let userLoggedIn = decodedToken.userId
        if (userId != userLoggedIn) { res.status(403).send({ status: false, message: "enter your own id" }) };


        //ISBN validation
        if (!isValid(ISBN)) { return res.status(400).send({ status: false, message: "ISBN is required and it must be string" }) }

        let bookISBN = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN.trim())
        if (!bookISBN) return res.status(400).send({ status: false, message: "enter valid ISBN" })
        let findISBN = await booksModel.find({ ISBN: ISBN })
        if (findISBN.length !== 0) return res.status(400).send({ status: false, message: "ISBN  is already used, Please use a new ISBN" })

        //category validation
        if (!isValid(category)) { return res.status(400).send({ status: false, message: "category is required and it must be string" }) }

        let bookCategory = /^[a-zA-Z\s]*$/.test(category.trim())
        if (!bookCategory) return res.status(400).send({ status: false, message: "enter valid category " })


        //subcategory validation 
        if (Array.isArray(subcategory)) {
            if (subcategory.length == 0) { return res.status(400).send({ status: false, message: "empty array is not accepted " }) }
            for (let i = 0; i < subcategory.length; i++) {
                if (!subcategory[i] || typeof subcategory[i] !== 'string' || subcategory[i].trim().length === 0) return res.status(400).send({ status: false, message: " subcategory should be string" })
                let bookSubcategory = /^[a-zA-Z\s]*$/.test(subcategory[i].trim())
                if (!bookSubcategory) return res.status(400).send({ status: false, message: "enter valid subcategory" })

            }
        }

        if (typeof (subcategory) == "string") {
            if (!isValid(subcategory)) { return res.status(400).send({ status: false, message: "subcategory is required!" }) }
            let bookSubcategory = /^[a-zA-Z\s]*$/.test(subcategory.trim())
            if (!bookSubcategory) return res.status(400).send({ status: false, message: "enter valid subcategory1 " })
        }



        //releasedAt validation
        if (releasedAt === undefined || releasedAt.trim().length === 0) return res.status(400).send({ status: false, message: "date is required" })
        bookReleasedAt = /^\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9]))$/.test(releasedAt.trim())
        if (!bookReleasedAt) return res.status(400).send({ status: false, message: "enter valid  release date " })


        // let files= req.files
        // if(files && files.length>0){
        //     //upload to s3 and get the uploaded link
        //     // res.send the link back to frontend/postman
        //     console.log("file")
        //     let uploadedFileURL= await uploadFile( files[0] )
        //     res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        //     console.log("file")
        // }
        // else{
        //     res.status(400).send({ msg: "No file found" })
        // }



        const data = await booksModel.create(details)

        res.status(201).send({ status: true, message: "Success", data: data })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message });
    }
}
const getBookByQuery = async function (req, res) {
    try {
        let data = req.query;
        let { userId, category, subcategory } = data
        let bookData = { isDeleted: false };

        if (Object.keys(data).length == 0) {
            getBooks = await booksModel.find({ data, isDeleted: false }).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, reviews: 1, releasedAt: 1, }).sort({ title: 1 })
            return res.status(200).send({ status: true, message: 'Books list', data: getBooks })
        }

        if (userId) {
            var isValidId = mongoose.Types.ObjectId.isValid(userId)
            if (!isValidId) return res.status(400).send({ status: false, message: "Enter valid user id" })
            bookData.userId = userId
        }
        if (category) {
            bookData.category = category
        }
        if (subcategory) {
            bookData.subcategory = subcategory
        }

        let books = await booksModel.find(bookData).select({ _id: 1, title: 1, excerpt: 1, userId: 1, category: 1, subcategory: 1, reviews: 1, releasedAt: 1, }).sort({ title: 1 })

        if (books.length == 0) return res.status(404).send({ status: false, message: "No data found" })
        else return res.status(200).send({ status: true, message: 'Books list', data: books })



    }
    catch (err) {
        res.status(500).send({ message: err.message })
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
                return res.status(400).send({ status: false, message: "Wrong Key present" })
        }

        if (Object.keys(data).length < 1) { return res.status(400).send({ message: "Insert data you want to update" }) }

        let book = await booksModel.findOne({ _id: id, isDeleted: false });

        if (data.hasOwnProperty("title")) {

            if (!isValid(title)) { return res.status(400).send({ status: false, message: "title is required and it must be string" }) }

            let bookTitle = /\w*\s*|\w|\D/.test(title.trim())
            if (!bookTitle) return res.status(400).send({ status: false, message: "enter valid title" })
            let findTitle = await booksModel.find({ title: title })
            if (findTitle.length !== 0) return res.status(400).send({ status: false, message: "Title  is already used, Please use a new title" })

            book.title = title
        };

        if (data.hasOwnProperty("releasedAt")) {

            if (releasedAt === undefined || releasedAt.trim().length === 0) return res.status(400).send({ status: false, message: "date is required" })
            bookReleasedAt = /^\d{4}[\-\/\s]?((((0[13578])|(1[02]))[\-\/\s]?(([0-2][0-9])|(3[01])))|(((0[469])|(11))[\-\/\s]?(([0-2][0-9])|(30)))|(02[\-\/\s]?[0-2][0-9]))$/.test(releasedAt.trim())
            if (!bookReleasedAt) return res.status(400).send({ status: false, message: "enter valid date " })

            book.releasedAt = releasedAt
        };

        if (data.hasOwnProperty("ISBN")) {

            if (!isValid(ISBN)) { return res.status(400).send({ status: false, message: "ISBN is required and it must be string" }) }

            let bookISBN = /^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN.trim())
            if (!bookISBN) return res.status(400).send({ status: false, message: "enter valid ISBN" })
            let findISBN = await booksModel.find({ ISBN: ISBN })
            if (findISBN.length !== 0) return res.status(400).send({ status: false, message: "ISBN  is already used, Please use a new ISBN" })

            book.ISBN = ISBN
        };

        if (data.hasOwnProperty("excerpt")) {
            if (!isValid(excerpt)) { return res.status(400).send({ status: false, message: "excerpt is required and it must be string" }) }

            let bookExcerpt = /\w*\s*|\w|\D/.test(excerpt.trim())
            if (!bookExcerpt) return res.status(400).send({ status: false, message: "enter valid excerpt" })

            book.excerpt = excerpt
        }

        let updateData = await booksModel.findByIdAndUpdate({ _id: id }, book, {
            new: true,
        });
        res.status(200).send({ status: true, message: "Success", data: updateData });
    } catch (err) {
        res.status(500).send({ message: 'Error', error: err.message });
    }
};






//get by id
const getBookById = async function (req, res) {
    try {
        let bookId = req.params.bookId;

        var isValidId = mongoose.Types.ObjectId.isValid(bookId)
        if (!isValidId) return res.status(400).send({ status: false, message: "Enter valid book id" })

        let saveData = await booksModel.findById({ _id: bookId, isDeleted: false }).select({ __v: 0, deletedAt: 0 })
        if (!saveData) { return res.status(404).send({ status: false, message: "book not found" }) }


        let data = await reviewModel.find({ bookId: bookId }).select({ isDeleted: 0, __v: 0 })

        let book = saveData._doc
        bookDetails = { ...book, reviewsData: data };


        res.status(200).send({ ststus: true, message: "Success", data: bookDetails })
    } catch (err) {
        res.status(500).send({ message: 'Error', error: err.message });
    }
};




//delete book
const deleteBook = async function (req, res) {
    try {
        let bookId = req.params.bookId
        let id = await booksModel.findById({ _id: bookId })
        if (id) {
            if (id.isDeleted) { return res.status(404).send({ message: "book not found" }) }
            let updateBook = await booksModel.findOneAndUpdate({ _id: bookId }, { isDeleted: true, deletedAt: Date.now() }, { new: true })
            //updateBook.deletedAt = Date.now()

            res.status(200).send({ status: true, message: "book deleted now", deletedAt: updateBook.deletedAt })
        }
        else { return res.status(404).send({ message: "book not found" }) }
    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ message: "Error", error: err.message })
    }

}

module.exports = { createBook, updateBook, getBookByQuery, getBookById, deleteBook }

