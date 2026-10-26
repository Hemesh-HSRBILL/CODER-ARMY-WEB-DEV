const mongoose = require("mongoose");
const {Schema} =mongoose

const userSchema = new Schema({
    firstName:{
        type : String,
        required : true,
        minLenght:3,
        maxLenght:20

    },

    lastName:{
        type : String,
        minLenght:3,
        maxLenght:20

    },

    age:{
        type : Number,
        min:5,
        max:80
    },

    emailid:{
        type:String,
        trim:true,
        required:true,
        unique:true,
        lowercase:true,
        immutable:true
    },

    password:{
        type:String,
        required:true,
        unique:true,
        trim:true,
    },

    role:{
        type:String,
        enum:['user','admin'],
        default:"user"
    },

   problemSolved: 
  [{
    type: Schema.Types.ObjectId,
    ref: "problem"
  }]


},{timestamps:true})

// there we handle if user deleted then its all submissions also delted 
//steps
//userSchema.post('findOneAndDelete', ...) It means: whenever you call User.findOneAndDelete(...), after the user document is deleted, this function will run.
//The userInfo parameter contains the document that was deleted.
//It deletes all documents in the submission collection where userId matches the deleted user’s _id.

userSchema.post("findOneAndDelete",async(userinfo)=>{
    if(userid){
        await mongoose.model('submission').deleteMany({ userId: userInfo._id });
    }
})

const User = mongoose.model("user",userSchema);

module.exports = User