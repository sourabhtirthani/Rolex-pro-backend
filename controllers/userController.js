// // import activities from "../models/activity.js";
 import incomeTransactions from "../model/IncomeTransaction.js";
import users from "../model/User.js";
import  TreeNode  from "../model/TreeNode.js"; 

import dotenv from 'dotenv'
dotenv.config();
// Admin addresses as fallback
const ADMIN_ADDRESSES = [process.env.ADMIN_ADDRESS, process.env.ADMIN_ADDRESS, process.env.ADMIN_ADDRESS];

export const createProfile = async (req, res)=>{
    try{
        const {address , referBy} = req.body;
        let referPaymentAddress;
        if(!address  || !referBy){
            return res.status(400).json({message : "Please provide all the details"});
        }
        const exists = await users.findOne({address});
        const isReferExits =await users.findOne({address:referBy});
        if(!isReferExits){
            return res.status(400).json({message : "Reffer Address Not found"})
        }
        if(exists){
            return res.status(200).json({message : "User already exists"})
        }
        console.log("isReferExits.referTo.length",isReferExits.referTo.length);
        if(Number(isReferExits.referTo.length)==0 || Number(isReferExits.referTo.length)==2){
            console .log("helllo inside if ",isReferExits.referBy)
            referPaymentAddress=isReferExits.referBy;
        }
        else if(Number(isReferExits.referTo.length)==1||Number(isReferExits.referTo.length)==3) referPaymentAddress=referBy;
        console.log("referPaymentAddress",referPaymentAddress);
        if(!referPaymentAddress) referPaymentAddress=process.env.ADMIN_ADDRESS;
        const uplineAddresses=await fetchUplineAddresses(3);
        const data={
            referPaymentAddress,
            referPaymentAmount:2.7,
            uplineAddresses,
            uplineAmount:[0.81,0.54,1.35],
            royalyAddress:process.env.DAILY_ROYALTIES,
            royalyAmount:.60
        }
        return res.json({ success:true,status:200,data:data,message:"All good"})
    }catch(error){
        console.log(`error in create profile : ${error}`);
        return res.json({success:false,status:500,message :error})
    }
}

export const updateProfile=async(req,res)=>{
    try{
        const {address ,referBy ,referPaymentAddress,referPaymentAmount, transactionHash ,uplineAddresses,uplineAddressesAmount} = req.body;
        const existsRefer = await users.findOne({address:referBy});
        const existsReferPaymentAddress = await users.findOne({address:referBy});

        if(!existsRefer){
            return res.status(200).json({message : "Refer Address Not Exits"})
        }
        const totalUsers = await users.find({}).limit(1).sort({createdAt:-1});    
        if(!totalUsers) return res.status(500).json({error:"Internel Server Error"});
        const userId = Math.floor(Math.random()*10000);
        let parentAddress=await addUserToTree(address,3)
        // let parentAddress="0x9d0893114A813f8418Cf9EfEf5D8E9DdAB78AA9e"
        console.log("parentAddress",parentAddress); 
        await users.findOneAndUpdate(
            { address: referBy },
            { $push: { referTo: address } },        //updates the referto array and adds the new user that he referred to his array
            { new: true }
            );
        
        await users.updateOne({address:referPaymentAddress},{$set:{ powerMatrixIncome:((existsReferPaymentAddress.powerMatrixIncome)+(referPaymentAmount))}})

        await users.create({
            address,
            referBy : referBy,
            parentAddress,
            userId,
            name:`Rolex_${userId}`
        });

        await incomeTransactions.create({
            fromUserId:userId,
            toUserId:existsReferPaymentAddress.userId,
            fromAddress:address,
            toAddress:referPaymentAddress,
            incomeType:"Referral income",
            amount:referPaymentAmount,
            transactionHash:transactionHash
        })
        await incomeTransactions.create({
            fromUserId:userId,
            toUserId:1,
            fromAddress:address,
            toAddress:process.env.DAILY_ROYALTIES,
            incomeType:"Royalty income",
            amount:0.6,
            transactionHash:transactionHash
        })
        const updateDataForUser={
            transactionHash,
            isActive:true
        }
        await users.updateOne({address},{$set:updateDataForUser});

        // let uplineAddressesData;
        // console.log("uplineAddresses new",uplineAddresses)
        // for(let i in uplineAddresses){
            
        //     uplineAddressesData=await users.findOne({address:uplineAddresses[i]})
        //     console.log("uplineAddresses",i,uplineAddresses[i]);
        //     await incomeTransactions.create({
        //         fromUserId:userId,
        //         toUserId:existsReferPaymentAddress.userId,
        //         fromAddress:address,
        //         toAddress:uplineAddresses[i],
        //         incomeType:"Referral income",
        //         amount:uplineAddressesAmount[i],
        //         transactionHash:transactionHash
        //     })
        //     await users.updateOne({"address":uplineAddresses[i]},{$set:{"levelIncome":(uplineAddressesData.levelIncome+uplineAddressesAmount[i])}});
        // }
        return res.json({ success:true,status:201,message:"user joined"})

    }catch(error){
        console.error(`error in update profile : ${error}`);
        return res.json({success:false,status:500,message : error})
    }
}

export const buyGlobalIncome = async (req, res)=>{
    try{
        const {address , type} = req.body;
        if(!address){
            return res.status(400).json({message : "Please provide all the details"});
        }
        const exists = await users.findOne({address});
        if(exists){
            return res.status(200).json({message : "User already exists"})
        }
        
        const uplineAddress=await fetchParentForTree(address,type);
        
        return res.json({ success:true,status:200,address:uplineAddress,message:"All good"})
    }catch(error){
        console.log(`error in create profile : ${error}`);
        return res.json({success:false,status:500,error : "Internal Server error"})
    }
}
export const updateProGlobal=async(req,res)=>{
    try{
        const {address ,paymentAddress,amount} = req.body;
        
        const totalUsers = await users.find({}).limit(1).sort({createdAt:-1});    
        if(!totalUsers) return res.status(500).json({error:"Internel Server Error"});

        await users.updateOne({address:paymentAddress},{$set:{ globalMatrixIncome:((existsReferPaymentAddress.refferalIncome)+(referPaymentAmount))}})

        await users.create({
            address,
            referBy : referBy,
            parentAddress,
            userId,
            name:`Rolex_${userId}`
        });

        await incomeTransactions.create({
            fromUserId:userId,
            toUserId:existsReferPaymentAddress.userId,
            fromAddress:address,
            toAddress:referPaymentAddress,
            incomeType:"Referral income",
            amount:referPaymentAmount,
            transactionHash:transactionHash
        })
        const updateDataForUser={
            transactionHash,
            isActive:true
        
        }
        await users.updateOne({address},{$set:updateDataForUser});

        let uplineAddressesData;
        for(let i in uplineAddresses){
            uplineAddressesData=await users.findOne({address:uplineAddresses[i]})
            await incomeTransactions.create({
                fromUserId:userId,
                toUserId:existsReferPaymentAddress.userId,
                fromAddress:address,
                toAddress:uplineAddresses[i],
                incomeType:"Referral income",
                amount:uplineAddressesAmount[i],
                transactionHash:transactionHash
            })
            await users.updateOne({"address":uplineAddresses[i]},{$set:{"levelIncome":(uplineAddressesData.levelIncome+levelDistribution[i])}});
        }
    }catch(error){

    }
}
export const freeRegistration = async (req, res)=>{
    try{
        const {address,referBy} = req.body;
        if(!address){
            return res.status(400).json({message : "Please provide all the details",status:400});
        }
        const exists = await users.findOne({address});
        
        if(exists){
            return res.status(400).json({message : "User already exists",status:400})
        }
        //const isReferExits =await users.findOne({address:referBy});
        // if(!isReferExits){
        //     return res.status(400).json({message : "Reffer Address Not found",status:400})
        // }

        // let sendHalfAmountForReffal=referBy;
        // let treeResult =await traverseTree(referBy);
        // //console.log("treeResult",treeResult);
        // if(!treeResult){
        //     return res.status(400).json({message : "No tree result"})
        // } 
        const userId = Math.floor(Math.random()*10000); 
        console.log("userId",userId);
        const userName=`Rolex_${userId}`
        const newUser = await users.create({
            address,
            referBy : referBy,
            parentAddress:"0x0000000000000000000000000000000000000000",
            userId,
            name:userName
        });

        const result = await users.updateOne(
            { address: referBy }, 
            { $push: { referTo: address } }
        );

        return res.status(201).json({message : "All Good! Welcome to Rolex club ",status:201})
    
    }catch(error){
        console.log(`error in create profile : ${error}`);
        return res.status(500).json({error : `Internal Server errorS:${error}`,status:500})
    }
}
export const checkUser=async(req,res)=>{
    try{const {address} = req.params;
    // console.log(`addres is : ${address} , ,, referby : ${referBy} , transaction has his : ${transactionHash}`)
    if(!address){
        return res.status(400).json({message : "Please provide all the details"});
    }
    const exists = await users.findOne({address});
    if(exists){
        return res.status(200).json({message:"User Found",data:exists});
    }else{
        return res.status(200).json({message:"User not Found",data:null});

    }
}catch(error){
    return res.status(400).json({error:error.message})
}
}


export const getProfile = async(req, res)=>{
    try{
        const {address} = req.query;
        if(!address){
            return res.status(400).json({error : "Please specify the address of the user."})
        }
        console.log("getProfile",address);
        const exists = await users.findOne({ address: address });
        console.log("exists",exists);
        if (!exists) {
            return res.status(400).json({ message: "No such user found" ,status:400});
        } else {
            const userRefferData=users.findOne({ address });
            return res.status(200).json({ userData: exists,data:userRefferData.userId,status:200})
        }

    }catch(error){
        console.log(`error in get profille : ${error.message}`)
        return res.status(500).json({error : "Internal Server error"})
    }
}



async function addUserToTree(userAddress,treeType) {
    // Find the next available parent node with less than 4 children
    const parentNode = await TreeNode.findOne({
        children: { $exists: true, $not: { $size: 4 } }, // Match nodes with fewer than 4 children
        treeType // Ensure matching the correct tree
    }).sort({ level: 1, createdAt: 1 }); // Closest to root, oldest nodes first
    if (!parentNode) {
        const adminAdd=`${process.env.ADMIN_ADDRESS}`;
        console.log("adminAdd",adminAdd);
        const rootNode =await TreeNode.create({
            address:adminAdd,
            children: [userAddress],
            level: 0,
            treeType: 3, // Specify the correct tree type (e.g., 3 USDT tree)
        });
        console.log("rootNode",rootNode);
        return adminAdd;
    }
    console.log("Hello");
    // Add new user as a child to the parent node
    parentNode.children.push(userAddress);
    await parentNode.save();

    // Create a new tree node for the user
    await TreeNode.create({
        address:userAddress,
        parentAddress: parentNode.address,
        level: parentNode.level + 1,
    });

    return parentNode.address;
}



async function fetchUplineAddresses(treeType) {
      // Find the next available parent node with less than 4 children
      const parentNode = await TreeNode.findOne({
        children: { $exists: true, $not: { $size: 4 } }, // Match nodes with fewer than 4 children
        treeType // Ensure matching the correct tree
    }).sort({ level: 1, createdAt: 1 }); // Closest to root, oldest nodes first
    if (!parentNode) {
        // If no parent is available, return admin uplines (root node case)
        return ADMIN_ADDRESSES;
    }

    // Start finding uplines from the determined parent node
    const uplineAddresses = [];
    let currentNode = parentNode;
    console.log("currentNode",currentNode,uplineAddresses.length)
    while (currentNode && uplineAddresses.length < 3) {
        uplineAddresses.push(currentNode.address);
        console.log("uplineAddresses inside loop",uplineAddresses);
        currentNode = await TreeNode.findOne({ address: currentNode.parentAddress });
    }

    // Pad with admin address if fewer than 3 uplines are found
    console.log("uplineAddresses",uplineAddresses);
    while (uplineAddresses.length < 3) {
        uplineAddresses.push(process.env.ADMIN_ADDRESS);
    }

    return uplineAddresses;
}

async function fetchParentForTree(userAddress, fundAmount) {
    const treeType = fundAmount; // Use fundAmount as treeType

    // Find the next available parent node in the specified tree
    const parentNode = await TreeNode.findOne({
        treeType, // Match the correct tree
        $expr: { $lt: [{ $size: "$children" }, 4] }, // Node must have less than 4 children
    }).sort({ level: 1, createdAt: 1 }); // Closest to root, oldest nodes first

    if (!parentNode) {
        // If no parent node exists, this is the root node
        return null; // Indicates this user will become the root node for the tree
    }

    // Return the parentAddress for the next insertion
    return parentNode.userAddress;
}
