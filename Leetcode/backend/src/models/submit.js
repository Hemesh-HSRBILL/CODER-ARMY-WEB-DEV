const mongoose = require("mongoose");
const Problem = require("./problem_Schema");
const User = require("./user");
const { TIME_SERIES_REDUCERS } = require("redis");
const {Schema} = mongoose;

const submit_Schema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true,
        index:true
    },
    problemId:{
        type:Schema.Types.ObjectId,
        ref:"problem",
        required:true,
        index:true  // index true means create index for this field thats helps me for seaching fast
    },
    code:{
        type:String,
        required:true
    },
    language:{
        type:String,
        enum:["java","c","c++","javascript","php","python"],
        required:true
    },
    runtime:{
        type:Number, //millisec
        required:true,
        default:0
    },
    memory:{
        type:Number,//Kb
        require:true,
        default:0
    },
    status: {
    type: String,
    enum: ['pending', 'accepted', 'wrong', 'error'],
    default: 'pending'
  },
  errorMessage: {
    type: String,
    default: ''
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  testCasesTotal: {  // Recommended addition
    type: Number,
    default: 0
  }
},{timestamps:true})

//submit_Schema.index({ userId: 1, problemId: 1 }) creates a compound index in MongoDB.
//  Let’s break down what that means:
//index() → tells MongoDB to create an index on the submission collection.

// { userId: 1, problemId: 1 } → defines the fields included in the index(menas create spearte fied { userId: 1, problemId: 1 } in submit_schema ):

// userId: 1 → ascending order

// problemId: 1 → ascending order

// Together, this is a compound index on (userId, problemId)

submit_Schema.index({userId:1,problemId:1})


const Submit = mongoose.model("submit", submit_Schema)

module.exports = Submit;