import { Schema , model } from "mongoose";

const activtySchema = new Schema({
    userId : {
        type : Number,
        required : true
    },
    activiy : {
        type  : String,
        required  : true
    },
    transactionHash : {
        type : String,
        required : true
    },
    time : {
        type : Date,
        default : Date.now
    }
}, {timestamps : true})

const activities = model("activities"  , activtySchema);
export default activities;