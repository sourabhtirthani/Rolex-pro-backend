import express from 'express';
import errorHandler from '../middlewares/errorHandler.js';
import {   buyGlobalIncome, createProfile, freeRegistration, getProfile, updateProfile} from '../controllers/userController.js';

const router = express.Router();

 router.post('/create' , [errorHandler] , createProfile);
// router.patch('/update' ,[upload.fields([{ name: 'profilePicture', maxCount: 1 }]),errorHandler], errorHandler, updateProfile )
// router.get('/userdetails/:address' , errorHandler , getProfile)
router.patch('/updateData',errorHandler,updateProfile)
router.get('/checkUser',errorHandler,getProfile)
router.post('/buyglobalPackage',errorHandler,buyGlobalIncome);
router.patch('/buyglobalPackage',errorHandler,buyGlobalIncome);
// router.post('/userdata' , fetchUserData);
router.post('/freeResistration',errorHandler,freeRegistration)
// package Router 

export default router;  