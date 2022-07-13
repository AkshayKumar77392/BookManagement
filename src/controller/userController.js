const userModel = require('../model/userModel')
const JWT = require("jsonwebtoken");

const isValid = function (value) {
    if (typeof value === "undefined" || !value ) return false
    if (typeof value !== "string" || value.trim().length === 0) return false
    return true
}

const createUser = async function (req, res) {
    try {
        let data = req.body
        const { title, name, phone, email, password, address } = data

        if (Object.keys(data).length < 1) { return res.status(400).send({ status:false, message: "Insert data :Bad request" }) }

       // title validation
        if (!isValid(title)) { return res.status(400).send({ status: false, message: "title is required and it must be string" }) }

         let title1 = /^(Mr|Mrs|Miss){0,3}$/.test(title.trim())
        if (!title1) return res.status(400).send({ status: false, message: "enter valid title" })

        //name validation
        if (!isValid(name)) { return res.status(400).send({ status: false, message: "name is required and it must be string" }) }

        let fname = /^[a-zA-Z]{2,20}$/.test(name.trim())
        if (!fname) return res.status(400).send({ status: false, message: "enter valid first name" })

        //phone validation
        if (!isValid(phone)) { return res.status(400).send({ status: false, message: "phone number is required and it must be string" }) }

        let mobile = /^((\+91)?|91)?[6789][0-9]{9}$/.test(phone.trim())
        if (!mobile) return res.status(400).send({ status: false, message: "enter valid phone number" })
        let findPhone = await userModel.find({ phone: phone })
        if (findPhone.length !== 0) return res.status(400).send({ status: false, message: "Phone number is aleardy Exist" })

        //email validation
        if (!isValid(email)) { return res.status(400).send({ status: false, message: "email is required and it must be string" }) }

        let mail1 = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())
        if (!mail1) return res.status(400).send({ status: false, message: "enter valid mail" })
        let findUser = await userModel.find({ email: email })
        if (findUser.length !== 0) return res.status(400).send({ status: false, message: "Email is aleardy Exist" })

        //password validation
        if (!isValid(password)) { return res.status(400).send({ status: false, message: "password is required and it must be string" }) }

        let pass = /^[a-zA-Z0-9]{8,15}$/.test(password.trim())
        if (!pass) return res.status(400).send({ status: false, message: "enter valid password" })

        //address validation
       
       
        if (data.hasOwnProperty("address")) {
            // street validation
            let street = address.street
            if (!isValid(street)) { return res.status(400).send({ status: false, message: "street is required and it must be string" }) }

            let street1 = /\w*\s*|\w|\D/.test(street.trim())
            if (!street1) return res.status(400).send({ status: false, message: "enter valid street" })

            //city validation
            let city = address.city
            if (!isValid(city)) { return res.status(400).send({ status: false, message: "city is required and it must be string" }) }

            let city1 = /^[a-zA-Z]{2,20}$/.test(name.trim())
            if (!city1) return res.status(400).send({ status: false, message: "enter valid city name" })

            //pincode validation
            let pincode = address.pincode
            if (!isValid(pincode)) { return res.status(400).send({ status: false, message: "pincode is required and it must be string" }) }

            let pin = /^[1-9][0-9]{5}$/.test(pincode.trim())
            if (!pin) return res.status(400).send({ status: false, message: "enter valid pincode" })


        }

        let saveUserData = await userModel.create(data)
        res.status(201).send({ status: true,message:"Success", data: saveUserData })
    }
    catch (err) {
        res.status(500).send({ status: false, message: err.message })
    }
}






const loginUser = async function (req, res) {
    try {
        let userName = req.body.email
        let password = req.body.password
        if(Object.keys(req.body)<1) return res.status(400).send({ status: false, message: "please enter email and password"});
        if (!userName) return res.status(400).send({ status: false, message: "user Name is required" });
        if (!password) return res.status(400).send({ status: false, message: "password is required" });
        const check = await userModel.findOne({ email: userName, password: password });
        if (!check) return res.status(400).send({ status: false, message: "userName or password is wrong" });
        let token = JWT.sign(
            {
                userId: check._id.toString(),
                iat: Math.floor(new Date() / 1000),
                exp: Math.floor(new Date() / 1000) +10*60*60 
            },
            "book-management"
        );
        res.setHeader("x-api-key", token);
        res.status(200).send({ status: true,message:"Success", data: token });
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}

module.exports = { loginUser, createUser, isValid }

