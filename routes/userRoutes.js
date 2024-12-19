import express from 'express';
import errorHandler from '../middlewares/errorHandler.js';
import { upload } from '../middlewares/multer.js';

import  {    buyProIncome, createProfile, freeRegistration, getProfile, getSelfIncome, postselfIncome, previewProfile, updateProfile, updateProIncome, updateselfIncome, updateUserProfile,getReferDetails, buyGlobalIncome, updateGloablIncome, fetchAllTeamInfoWithPagination} from '../controllers/userController.js';

const router = express.Router();

router.post('/create' , [errorHandler] , createProfile);
router.post('/updateData',errorHandler,updateProfile)
router.post('/update' ,[upload.fields([{ name: 'profilePicture', maxCount: 1 }]),errorHandler], errorHandler, updateUserProfile )
router.get('/checkUser',errorHandler,getProfile)
router.post('/buyProIncome',errorHandler,buyProIncome);
router.post('/updateProIncome',errorHandler,updateProIncome);
router.post('/buyGlobalIncome',errorHandler,buyGlobalIncome);
router.post('/updateGlobalIncome',errorHandler,updateGloablIncome);
router.post('/freeResistration',errorHandler,freeRegistration)
router.get('/selfIncome',errorHandler,getSelfIncome)
router.post('/selfIncome',errorHandler,postselfIncome);
router.post('/selfIncome',errorHandler,updateselfIncome);
router.get('/preview',errorHandler,previewProfile)
router.get('/getReferDetails',errorHandler,getReferDetails);
router.get('/fetchTeamInfo',errorHandler,fetchAllTeamInfoWithPagination)
// package Router 

export default router;  