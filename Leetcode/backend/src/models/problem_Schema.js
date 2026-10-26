const mongoose = require("mongoose")
const {Schema} =mongoose

const problemSchema = new Schema({
    title:{
        type:String,
        required:true
    },

    discription:{
        type:String,
        required:true
    },

    difficulty:{
        type:String,
        enum:["easy","medium","hard"],
        required:true
    },

    tag:{
        type:String,
        required:true
    },

    visible_testcases:
        [
            {
                input:{
                    type:String,
                    required:true
                },

                output:{
                    type:String,
                    required:true
                },

                experience:{
                    type:String,
                }
            }
        ],

    hidden_testcases:
        [
            {
                input:{
                    type:String,
                    required:true
                },

                output:{
                    type:String,
                    required:true
                },

                experience:{
                    type:String,
                }
            }
        ],

    start_code: 
    [
        {
            language: {
                type: String,
                required: true
            },
            code: {
                type: String,
                required: true
            }
        }
    ],

    ref_solution:[
        {
            language:{
                type:String,
                required:true
            },

            complete_code:{
                type:String,
                required:true
            }
        }
    ],

    problem_creator:{
        type: Schema.Types.ObjectId,
        ref : "user",
    }

})

const Problem = mongoose.model("problem",problemSchema)

module.exports = Problem;