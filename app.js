import express from 'express'
// import activityRoutes from './routes/activityRoutes.js'
 import userRoutes from './routes/userRoutes.js'
// import adminRoutes from './routes/adminRoutes.js';
import { connectToDB } from './database/db.js';
import cors from 'cors'
const app = express();
const PORT = process.env.PORT;

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