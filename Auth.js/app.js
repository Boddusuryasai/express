require('dotenv').config()
require("./config/database").connect()
const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
var cookieParser = require('cookie-parser')
const {posts} = require("./constant")

const auth = require('./middleware/auth')

const User = require("./model/user")

const app = express()
app.use(express.json()) 
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.post("/register", async (req, res)=>{
    try {
        const {firstname, lastname, email, password } = req.body
        if (!(email && password && lastname && firstname)) {
            res.status(401).send("All fileds are required")
        }
        const existingUser = await User.findOne({ email})
        if (existingUser) {
            res.status(401).send("User already found in database")
        }
        const encryptedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            firstname,
            lastname,
            email,
            password: encryptedPassword,
        })
        
        const token = jwt.sign({
            id: user._id, email
        }, 'secret', {expiresIn: '2h'})
        

        user.token = token
        user.password = undefined

        res.status(201).json(user)


    } catch (error) {
        res.status(401).send(error)
    }
})

app.post("/login", async (req, res) => {
    try {
        const {email, password} = req.body
        if (!(email && password)) {
            res.status(401).send("email and password is required")
        }

        const user = await User.findOne({email})
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign({id: user._id, email}, 'secret', {expiresIn: '2h'})
            user.password = undefined
            user.token = token

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }
            res.status(200).cookie("token", token, options).json({
                success: true,
                token,
                user
            })

        }
        res.sendStatus(400).send("email or password is incorrect")
    } catch (error) {
        res.status(401).send(error)
    }

    
})

app.get("/posts", auth, (_,  res) => {
    res.status(200).json(posts)

})



module.exports = app