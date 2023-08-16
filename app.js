require("dotenv").config()
require("./config/database").connect()
const UserModel = require("./model/user")
const express = require("express")
const app = express()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt"); 
// importing middleware
const auth = require("./middleware/auth")
app.use(express.json())

app.post("/register", async (req, res)=> {
     try {
        // extracting values from body request
        const {first_name, last_name, email, password} = req.body
        // validation all attributes required are filled
        if(! (email && password && first_name && last_name)){
            res.status(400).json({error: "some params are missed"})
        }

        const userActive = await UserModel.findOne({email})
        if(userActive){
            return res.status(409).json({message: "User already exists."})
        }

        const passwordEncription = await bcrypt.hash(password, 10)

        const newUser = await UserModel.create({first_name, last_name, email: email.toLowerCase(), password: passwordEncription})

        // token creation 
        const token = jwt.sign({user_id: newUser._id,  email}, process.env.TOKEN_KEY, {
            expiresIn: "1h"
        })

        newUser.token = token

        res.status(201).json(newUser)

     } catch (error) {
        console.log(error);
     }
})

app.post("/login", (req, res)=>{

})

app.get("/welcome", auth ,(req, res)=>{
    res.status(200).send("Welcome 🙌")
})



module.exports = app