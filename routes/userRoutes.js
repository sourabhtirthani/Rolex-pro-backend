import express from 'express';
import errorHandler from '../middlewares/errorHandler.js';
import {    buyProIncome, createProfile, freeRegistration, getProfile, updateProfile, updateProIncome} from '../controllers/userController.js';

const router = express.Router();

router.post('/create' , [errorHandler] , createProfile);
router.patch('/updateData',errorHandler,updateProfile)
router.get('/checkUser',errorHandler,getProfile)
router.post('/buyProIncome',errorHandler,buyProIncome);
router.patch('/updateProIncome',errorHandler,updateProIncome);
router.post('/freeResistration',errorHandler,freeRegistration)
// package Router 

export default router;  