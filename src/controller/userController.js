const userModel = require('../model/userModel')
const JWT = require("jsonwebtoken");

const isValid = function (value) {
    if (!value || value === undefined) return false
    if (typeof value !== "string" || value.trim().length === 0) return false
    return true
}


const createUser = async function (req, res) {
    try {
        let data = req.body

        const { title, name, phone, email, password } = data
        if (Object.keys(data).length < 1) { return res.status(400).send({ msg: "Insert data :Bad request" }) }

        // title validation
        if (!isValid(title)) { return res.status(400).send({ status: false, msg: "title required" }) }

        let title1 = /^(Mr|Mrs|Miss){0,3}$/.test(title.trim())
        if (!title1) return res.status(400).send({ stats: true, msg: "enter valid title" })

        //name validation
        if (!isValid(name)) { return res.status(400).send({ status: false, msg: "first name required" }) }

        let fname = /^[a-zA-Z]{2,20}$/.test(name.trim())
        if (!fname) return res.status(400).send({ stats: true, msg: "enter valid first name" })

        //phone validation
        if (!isValid(phone)) { return res.status(400).send({ status: false, msg: "phone number is required" }) }

        let mobile =  /^((\+91)?|91)?[6789][0-9]{9}$/.test(phone.trim())
        if (!mobile) return res.status(400).send({ stats: true, msg: "enter valid phone number" })
        let findPhone = await userModel.find({ phone: phone })
        if (findPhone.length !== 0) return res.status(400).send({ status: false, msg: "Phone number is aleardy Exist" })

        //email validation
        if (!isValid(email)) { return res.status(400).send({ status: false, msg: "email is required" }) }

        let mail1 = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())
        if (!mail1) return res.status(400).send({ stats: true, msg: "enter valid mail" })
        let findUser = await userModel.find({ email: email })
        if (findUser.length !== 0) return res.status(400).send({ status: false, msg: "Email is aleardy Exist" })

        //password validation
        if (!isValid(password)) { return res.status(400).send({ status: false, msg: "password isrequired" }) }

        let pass = /^[a-zA-Z0-9]{8,15}$/.test(password.trim())
        if (!pass) return res.status(400).send({ stats: true, msg: "enter valid password" })

        let saveUserData = await userModel.create(data)
        res.status(201).send(saveUserData)
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}






const logInUser = async function (req, res) {
    try {
        let userName = req.body.email
        let password = req.body.password
        if (!userName) return res.status(400).send({ status: false, msg: "user Name is required" });
        if (!password) return res.status(400).send({ status: false, msg: "password is required" });
        const check = await authorModel.findOne({email: userName,password: password});
        if (!check) return res.status(400).send({ status: false, msg: "userName or password is wrong" });
        let token = JWT.sign(
            {
                userId: check._id.toString()
            },
            "book-management"
        );
        res.setHeader("x-api-key", token);
        res.status(200).send({ status: true, data: token});
    }
    catch (err) {
        res.status(500).send({ status: false, error: err.message });
    }
}

module.exports={logInUser}

module.exports.createUser = createUser
