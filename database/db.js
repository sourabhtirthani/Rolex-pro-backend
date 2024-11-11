import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config();

const URI = process.env.DB_URL;

export const connectToDB = async()=>{
    try{
        await mongoose.connect(URI);
        console.log(`connected to database`);
    }catch(error){
        console.log(`error in connect to DB function : ${error.message}`);
        
    }
}