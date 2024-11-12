import express from 'express';
import errorHandler from '../middlewares/errorHandler.js';
import {   freeRegistration, getProfile} from '../controllers/userController.js';

const router = express.Router();

// router.post('/create' , [upload.fields([{ name: 'profilePicture', maxCount: 1 }]),errorHandler] , createProfile);
// router.patch('/update' ,[upload.fields([{ name: 'profilePicture', maxCount: 1 }]),errorHandler], errorHandler, updateProfile )
// router.get('/userdetails/:address' , errorHandler , getProfile)
// router.patch('/updateData',errorHandler,updateData)
 router.get('/checkUser',errorHandler,getProfile)
// router.post('/userdata' , fetchUserData);
router.post('/freeResistration',errorHandler,freeRegistration)
// package Router 

export default router;  