import { Schema , model } from "mongoose";

const userSchema = new Schema({
    name : {
        type : String,
        default : ""
    },
    email : {
        type : String,
        default : ""
    },
    address : {
        type : String,
        required : true
    },
    referBy : {
        type : String,
        require:true
    },
    leftAddress:{
        type:String,
        default:null
    },
    rightAddress:{
        type:String,
        default:null
    },
    parentAddress:{
        type:String,
        default:null
    },
   
    transactionHash : {
        type : String,
        default:null
    },
    referTo : [{
        type : String
    }],
    mobileNumber : {
        type : Number
    },
    userId : {
        type : Number
    },
    powerMatrixIncome:{
        type: Number,
        default:0
    },
    globalMatrixIncome:{
        type:Number,
        default:0
    },
    selfIncome:{
        type:Number,
        default:0
    },
    perDayRoyalty:{
        type:Number,
        default:0
    },
    perMonthRoyalty:{
        type:Number,
        default:0
    },
    join_time : {
        type : Date,
        default : Date.now
    },
    isActive:{
        type:Boolean,
        default:false
    }
}, {timestamps : true})

const users = model("users" , userSchema);
export default users;