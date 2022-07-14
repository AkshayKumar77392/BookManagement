const express = require('express');
const route = require('./routes/route.js');
const { default: mongoose } = require('mongoose');
const app = express();
const multer = require('multer');

app.use(express.json());
app.use(multer().any());
app.use(express.urlencoded({extended:true}))


mongoose.connect("mongodb+srv://SagarBansal:HmMiUeU0MyktjG49@cluster0.3yhyk.mongodb.net/Group57Database?retryWrites=true&w=majority", {
    useNewUrlParser: true
})
    .then(() => console.log("MongoDb is connected"))
    .catch(err => console.log(err))


app.use('/', route)

app.use('*',(req,res)=>{
    return res.status(404).send({status:false,message:"page not found"})
})

app.listen(process.env.PORT || 3000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 3000))
});