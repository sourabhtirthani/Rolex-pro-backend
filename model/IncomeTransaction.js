import { Schema , model} from 'mongoose'

const incomeSchema = new Schema({
    fromUserId : {
        type : Number
    },
    toUserId : {
        type : Number
    },
    fromAddress : {
        type : String
    },
    toAddress : {
        type : String
    },
    incomeType : {
        type : String
    },
    amount : {
        type : Number
    },
    transactionHash:{
        type:String
    }
}, {timestamps : true})

const incomeTransactions = model("incomeTransactions" , incomeSchema);
export default incomeTransactions;