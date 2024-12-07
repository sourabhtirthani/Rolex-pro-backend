import express from 'express'
// import activityRoutes from './routes/activityRoutes.js'
 import userRoutes from './routes/userRoutes.js'
// import adminRoutes from './routes/adminRoutes.js';
import { connectToDB } from './database/db.js';
import cors from 'cors'
const app = express();
const PORT = process.env.PORT;
 import users from "./model/User.js";

connectToDB();
app.use(express.json());
app.use(express.urlencoded({extended : false}));
app.use(cors());

 app.use('/api/users' , userRoutes);
// app.use('/api/activities' , activityRoutes);
// app.use('/api/admin' , adminRoutes)

app.listen(PORT, ()=>{
    console.log(`server started on port : ${PORT}`)
});

// const addusers=async()=>{
//     const arraynew=[
//         "0xBA8e72423871585AF283a26199A26A3F57c2A700",
//         "0xCA5a5cDb381a41fA7Fc20Ca615F0863919cA9C44",
//         "0xb2654a4392a958b3eEea39289f191BE87a2B0f31",
//         "0x8886117659C8b724e1D9036BcA6A4f3fcF34C568",
//         "0x4aB472067c91e5A6eee2762297F90AADeE9AFA06",
//         "0x698fC10497C6737E12F2B483C4e8054359331dAe",
//         "0xFa3E44d208E0215F2188357fbcE7C89Aa172Ffa6",
//         "0x4aB472067c91e5A6eee2762297F90AADeE9AFA06",
//         "0x698fC10497C6737E12F2B483C4e8054359331dAe"
//     ]
//     let newAdr="0x49D3C7507A445d06E81B389F0C9eF8a3bCa4730c"
//     for(let i=0;i<6;i++){
//         let userId = Math.floor(Math.random()*1000000);
//     await users.create({
//         address:arraynew[i],
//         referBy :newAdr,
//         parentAddress:newAdr,
//         userId,
//         name:`Rolex_${userId}`
//     });

//     await users.findOneAndUpdate(
//         { address: newAdr },
//         { $push: { referTo: arraynew[i] } },        //updates the referto array and adds the new user that he referred to his array
//         { new: true }
//         );
// }
// }
//addusers();