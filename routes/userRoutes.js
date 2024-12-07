import express from 'express';
import errorHandler from '../middlewares/errorHandler.js';
import { upload } from '../middlewares/multer.js';

import {    buyProIncome, createProfile, freeRegistration, getProfile, getSelfIncome, postselfIncome, previewProfile, updateProfile, updateProIncome, updateselfIncome, updateUserProfile} from '../controllers/userController.js';

const router = express.Router();

router.post('/create' , [errorHandler] , createProfile);
router.patch('/updateData',errorHandler,updateProfile)
router.patch('/update' ,[upload.fields([{ name: 'profilePicture', maxCount: 1 }]),errorHandler], errorHandler, updateUserProfile )
router.get('/checkUser',errorHandler,getProfile)
router.post('/buyProIncome',errorHandler,buyProIncome);
router.patch('/updateProIncome',errorHandler,updateProIncome);
router.post('/freeResistration',errorHandler,freeRegistration)
router.get('/selfIncome',errorHandler,getSelfIncome)
router.post('/selfIncome',errorHandler,postselfIncome);
router.patch('/selfIncome',errorHandler,updateselfIncome);
router.get('/preview',errorHandler,previewProfile)
// package Router 

export default router;  