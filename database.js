require('./node_modules/dotenv/config')
const mongoose = require('mongoose');
const connectDB = async () => {
    try {
      const conn = await mongoose.connect(process.env.DATABASE_URL);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  }
  const userSchema = mongoose.Schema({
    username : String,
    email : String,
    password : String,
    date : {
        type:Date,
        default : Date.now
    }
});
  const quizSchema = mongoose.Schema({
    title:{
      type:String,
      default:"Title"
    },
    description:{
      type:String,
      default:"Description"
    },
    questions:Array,
    answers:Array,
    optionslist:Array,
    explanations:Array,
    selections:Array,
    qcount:Number
  })

  const UserModel = mongoose.model("User",userSchema);
  const QuizModel = mongoose.model('Quiz',quizSchema);

  module.exports = {UserModel,QuizModel,connectDB};