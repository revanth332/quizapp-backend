require('./node_modules/dotenv/config')
const express = require('express');
const app = express()
const cors = require('cors');
const {connectDB,QuizModel,UserModel } = require('./database')
const jwt = require('jsonwebtoken');
const { hashSync, compareSync } = require('bcrypt');
const passport = require('passport')
const PORT = 5000

require('./passport')

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(passport.initialize());
app.use(cors({
    origin:["http://localhost:3000",process.env.FRONTEND_URL]
}))

app.post('/addquiz',(req,res) => {
    const quiz = new QuizModel({...req.body.quiz})
    //     title:req.body.quiz.title,
    //     description:req.body.quiz.description,
    //     questions:req.body.quiz.questions,
    //     answers:req.body.quiz.answers,
    //     optionslist:req.body.quiz.optionslist,
    //     explanations:req.body.quiz.explanations,
    //     selections:req.body.quiz.selections,
    //     qcount:req.body.quiz.qcount
    // })
    quiz.save().then((quiz) =>{
        res.send({
            success:"true",
            quizid:quiz._id
        })
    }).catch((err) => {
        res.send({
            success:"false",
            error:err
        })
    })
})

app.post('/signup',(req,res) => {
    UserModel.findOne({email:req.body.email}).then(exists => {
        if(exists){
            return res.status(400).json({error:"user already exists"})
        }
        const user = new UserModel({
            username : req.body.username,
            email : req.body.email,
            password:hashSync(req.body.password,10)
        })
        user.save().then((user => {
            res.send({
                success:true,
                message:"User created successfully",
                user : {
                    id:user._id,
                    username : user.username
                }
            })
        })).catch(err => {
            res.send({
                success:false,
                message:"Something went wrong",
                error : err
            })
        })
    }).catch(err => {
        console.log(err)
    })
    
})

app.post('/signin',(req,res) => {
    UserModel.findOne({email : req.body.email}).then(user => {
        if(!user){
            return res.status(401).send({
                success : false,
                message : "Could not found the user"
            })
        }
        if(!compareSync(req.body.password,user.password)){
            return res.status(401).send({
                success : false,
                message : "Could not verify the user"
            })
        }

        const payload = {
            username : user.username,
            id: user._id
        }
        const token = jwt.sign(payload,"secret random key",{expiresIn : "1d"});

        return res.status(200).send({
            success : true,
            message : "Logged successfully",
            user:payload,
            token : "Bearer "+token
        })
    })
})

app.get('/protected',passport.authenticate('jwt',{session:false}),(req,res) => {
    return res.status(200).send({
        success:true,
        user : {
            id : req.user._id,
            username : req.user.username
        }
    })
})

app.post('/getquiz',(req,res) => {
    QuizModel.findOne({_id:req.body.quizid}).then(quiz => {
        res.send({
            success:"true",
            quizitem:quiz
        })
    }).catch(err => {
        res.send({
            success:"false",
            error:err
        })
    })
})
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Listening at port ${PORT}`);
    })
})
