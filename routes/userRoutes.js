import express from 'express';
import errorHandler from '../middlewares/errorHandler.js';
import {    buyProIncome, createProfile, freeRegistration, getProfile, getSelfIncome, postselfIncome, updateProfile, updateProIncome, updateselfIncome} from '../controllers/userController.js';

const router = express.Router();

router.post('/create' , [errorHandler] , createProfile);
router.patch('/updateData',errorHandler,updateProfile)
router.get('/checkUser',errorHandler,getProfile)
router.post('/buyProIncome',errorHandler,buyProIncome);
router.patch('/updateProIncome',errorHandler,updateProIncome);
router.post('/freeResistration',errorHandler,freeRegistration)
router.get('/selfIncome',errorHandler,getSelfIncome)
router.post('/selfIncome',errorHandler,postselfIncome);
router.patch('/selfIncome',errorHandler,updateselfIncome);
// package Router 

export default router;  