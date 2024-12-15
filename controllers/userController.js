// // import activities from "../models/activity.js";
 import incomeTransactions from "../model/IncomeTransaction.js";
import users from "../model/User.js";
import  TreeNode  from "../model/TreeNode.js"; 
import selfIncome from "../model/selfIncome.js";
import dotenv from 'dotenv'
import cloudinary from 'cloudinary'
import fs from 'fs'
import ProTreeNode from "../model/GlobalTreeNode.js";
dotenv.config();
// Admin addresses as fallback
const ADMIN_ADDRESSES = [process.env.ADMIN_ADDRESS, process.env.ADMIN_ADDRESS, process.env.ADMIN_ADDRESS];
// Configure Cloudinary
cloudinary.config({
    cloud_name: 'da1cfszsz',  // Replace with your Cloudinary cloud name
    api_key: '415511321991927',       // Replace with your Cloudinary API key
    api_secret: 'ZkJ61icZGJfvH1g3WwF0xKZymxY', // Replace with your Cloudinary API secret
  });
export const createProfile = async (req, res)=>{
    try{
        const {address , referBy} = req.body;
        let referPaymentAddress,dailyRoyaltyAmount,userAmount,monthlyAmount=0;
        const countingArray = [
            5, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 
            21, 22, 23, 24,  26, 27, 28, 29, 31, 32, 33, 34, 
            36, 37, 38, 39,  41, 42, 43, 44,  46, 47, 48, 49, 
            51, 52, 53, 54,  56, 57, 58, 59,  61, 62, 63, 64, 
            66, 67, 68, 69,  71, 72, 73, 74,  76, 77, 78, 79, 
            81, 82, 83, 84,  86, 87, 88, 89,  91, 92, 93, 94, 
            96, 97, 98, 99
          ];
          let amount=3
        if(!address  || !referBy || !amount){
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
        if(Number(isReferExits.referTo.length)==0 || Number(isReferExits.referTo.length)==2 ){
            referPaymentAddress=isReferExits.referBy;
            userAmount=Number(amount)*Number(0.9);
            dailyRoyaltyAmount=amount-userAmount;
        }
        else if(Number(isReferExits.referTo.length)==1||Number(isReferExits.referTo.length)==3){ 
            referPaymentAddress=referBy
            userAmount=Number(amount)*Number(0.9);
            dailyRoyaltyAmount=amount-userAmount;
        }
        else if(countingArray.includes(isReferExits.referTo.length)){
            referPaymentAddress=referBy
            userAmount=Number(amount)*Number(0.75);
            monthlyAmount=amount-userAmount;
            dailyRoyaltyAmount=userAmount-(userAmount*(0.9));
            userAmount=(userAmount*(0.9));
        }else if ([10, 15, 20, 25,30,35,40,45,55,60,65,70,75,80,85,90,95,100].includes(isReferExits.referTo.length)){
            referPaymentAddress=isReferExits.referBy;
            userAmount=Number(amount)*Number(0.75);
            monthlyAmount=amount-userAmount;
            dailyRoyaltyAmount=userAmount-(userAmount*(0.9));
            userAmount=(userAmount*(0.9));
        }

        if(!referPaymentAddress) referPaymentAddress=process.env.ADMIN_ADDRESS;
        const uplineAddresses=await fetchUplineAddresses(3);
        const data={
            referPaymentAddress,
            referPaymentAmount:userAmount,
            uplineAddresses,
            uplineAmount:[0.81,0.54,1.35],
            royalyAddress:process.env.DAILY_ROYALTIES,
            royalyAmount:dailyRoyaltyAmount+Number(0.3),
            monthlyRoyaltyAddress:process.env.MONTHLY_ROYALTIES,
            monthlyAmount
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
        const isExists = await users.findOne({address});
        const existsReferPaymentAddress = await users.findOne({address:referBy});

        if(!existsRefer){
            return res.status(200).json({message : "Refer Address Not Exits"})
        }
        if(isExists){
            return res.status(200).json({message : " Address Already Exits"})
        }
        const totalUsers = await users.find({}).limit(1).sort({createdAt:-1});    
        if(!totalUsers) return res.status(500).json({error:"Internel Server Error"});
        const userId = Math.floor(Math.random()*1000000);
        let parentAddress=await addUserToTree(address,3)
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


        let uplineAddressesData;
        let i=0;
        while( i< uplineAddresses.length){            
             uplineAddressesData=await users.findOne({address:uplineAddresses[i]})
             await users.updateOne({address:uplineAddresses[i]},{$set:{ globalMatrixIncome:((uplineAddressesData.globalMatrixIncome)+(uplineAddressesAmount[i]))}})
            i++;
        }
        await addUserToTree(address,3);
        const newNode = new ProTreeNode({ address, amount:3 });
        await newNode.save();
        return res.json({ success:true,status:201,message:"user joined"})

    }catch(error){
        console.error(`error in update profile : ${error}`);
        return res.json({success:false,status:500,message : error})
    }
}
export const updateUserProfile = async(req, res)=>{
    try{
        const { address, name } = req.body;
        
        if (!address) {
            return res.status(400).json({ message: "Please provide address" });
        }
        const existingUser = await users.findOne({address : address});
        if(!existingUser){
            return res.status(400).json({message : "No such user found"})
        }
         const profilePicture =  req.files?.profilePicture ? req.files.profilePicture[0].filename : existingUser.profilePicture;
        const updateObject = {};
        if (name) updateObject.name = name;
        console.log("req.files.profilePicture",req.files.profilePicture);
        if (req.files && req.files.profilePicture) {
            updateObject.profilePicture = await uploadFileToCloudinary(req.files.profilePicture[0].path)        // adds the profile picture in the object
        }

        const updatedUser = await users.findOneAndUpdate(
            { address: address},          //updates the user with the provided address
            { $set: updateObject },
            { new: true }
        ); 
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found or invalid transactionHash" });
        }
        return res.status(200).json({ message: "Profile updated successfully"});

    }catch(error){
        console.log(error);
        console.log(`error in updat profile function : ${error.message}`)
        return res.status(500).json({error : "Internal Server error"})
    }
}
export const previewProfile = async(req, res)=>{
    try{
        const {userId} = req.query;
        if(!userId){
            return res.status(400).json({error : "Please specify the userId of the user."})
        }
        const exists = await users.findOne({ userId });
        const treeType=await getUserTreeTypes(exists.address);
        const selfIncomeType=await getUserSelfIncome(exists.address);
        let extraData={
            propowerincome:treeType.count,
            royalyAddress:process.env.DAILY_ROYALTIES,
            adminAddress:process.env.ADMIN_ADDRESS,
            selfIncome:selfIncomeType.count,
        }
        if (!exists) {
            return res.status(400).json({ message: "No such user found" ,status:400});
        } else {
            const userRefferData=users.findOne({ userId });
            return res.status(200).json({ userData: exists,otherData:extraData,data:userRefferData.userId,status:200})
        }

    }catch(error){
        console.log(`error in get profille : ${error.message}`)
        return res.status(500).json({message : error,status:500})
    }
}

export const buyProIncome = async (req, res)=>{
    try{
            const {address , referBy,amount} = req.body;
            let referPaymentAddress,dailyRoyaltyAmount,userAmount,monthlyAmount=0;
            const countingArray = [
                5, 6, 7, 8, 9, 11, 12, 13, 14, 16, 17, 18, 19, 
                21, 22, 23, 24,  26, 27, 28, 29, 31, 32, 33, 34, 
                36, 37, 38, 39,  41, 42, 43, 44,  46, 47, 48, 49, 
                51, 52, 53, 54,  56, 57, 58, 59,  61, 62, 63, 64, 
                66, 67, 68, 69,  71, 72, 73, 74,  76, 77, 78, 79, 
                81, 82, 83, 84,  86, 87, 88, 89,  91, 92, 93, 94, 
                96, 97, 98, 99
              ];
            if(!address  || !referBy || !amount){
                return res.status(400).json({message : "Please provide all the details"});
            }
            const exists = await users.findOne({address});
            const isReferExits =await users.findOne({address:referBy});
            const existingNode = await ProTreeNode.findOne({ address, amount });
        
            if(!isReferExits){
                return res.status(400).json({message : "Reffer Address Not found"})
            }
            
            if (existingNode) {
                return res.status(200).json({message : "User already Bought this package"})
            }
            if(Number(isReferExits.referTo.length)==0 || Number(isReferExits.referTo.length)==2 ){
                referPaymentAddress=isReferExits.referBy;
                userAmount=Number(amount)*Number(0.9);
                dailyRoyaltyAmount=amount-userAmount;
            }
            else if(Number(isReferExits.referTo.length)==1||Number(isReferExits.referTo.length)==3){ 
                referPaymentAddress=referBy
                userAmount=Number(amount)*Number(0.9);
                dailyRoyaltyAmount=amount-userAmount;
            }
            else if(countingArray.includes(isReferExits.referTo.length)){
                referPaymentAddress=referBy
                userAmount=Number(amount)*Number(0.75);
                monthlyAmount=amount-userAmount;
                dailyRoyaltyAmount=userAmount-(userAmount*(0.9));
                userAmount=(userAmount*(0.9));
            }else if ([10, 15, 20, 25,30,35,40,45,55,60,65,70,75,80,85,90,95,100].includes(isReferExits.referTo.length)){
                referPaymentAddress=isReferExits.referBy;
                userAmount=Number(amount)*Number(0.75);
                monthlyAmount=amount-userAmount;
                dailyRoyaltyAmount=userAmount-(userAmount*(0.9));
                userAmount=(userAmount*(0.9));
            }
            const data={
                dailyRoyaltyAddress:process.env.DAILY_ROYALTIES,
                paymentAddress:referPaymentAddress,
                monthlyRoyaltyAddress:process.env.MONTHLY_ROYALTIES,
                dailyRoyaltyAmount,
                userAmount,
                monthlyAmount
            }
            if(!referPaymentAddress) referPaymentAddress=process.env.ADMIN_ADDRESS;
            return res.json({ success:true,status:200,data:data,message:"All good"})
        
    }catch(error){
        console.log(`error in create profile : ${error}`);
        return res.json({success:false,status:500,error : "Internal Server error"})
    }
}
export const updateProIncome=async(req,res)=>{
    try{
        const {address, uplineAddress ,amount,insertAmout} = req.body;
        
        const totalUsers = await users.find({}).limit(1).sort({createdAt:-1});    
        if(!totalUsers) return res.status(500).json({error:"Internel Server Error"});
        const exists = await users.findOne({address});
        if(!exists){
            return res.status(200).json({message : "User doesnt exists"})
        }
        const newNode = new ProTreeNode({ address, amount, userId:exists.userId });
        await newNode.save();
        await users.updateOne({address:uplineAddress},{$set:{ powerMatrixIncome:((exists.powerMatrixIncome)+(insertAmout))}})

        return res.json({ success:true,status:201,message:"user Buy Pro Income success fully"})

    }catch(error){
        console.log(`error in create profile : ${error}`);
        return res.json({success:false,status:500,error : "Internal Server error"})
    }
}

export const buyGlobalIncome = async (req, res)=>{
    try{
        console.log("helo")
        const {address , type} = req.body;
        if(!address){
            return res.status(400).json({message : "Please provide all the details"});
        }
        const exists = await users.findOne({address});
        if(!exists){
            return res.status(200).json({message : "User doesnt exists"})
        }
        const uplineAddress=await fetchParentForTree(type);
        console.log("uplineAddress",uplineAddress);
        return res.json({ success:true,status:200,address:uplineAddress,royalyAddress:process.env.DAILY_ROYALTIES,message:"All good"})
    }catch(error){
        console.log(`error in create profile : ${error}`);
        return res.json({success:false,status:500,error : "Internal Server error"})
    }
}
export const updateGloablIncome=async(req,res)=>{
    try{
        const {address, uplineAddress ,amount} = req.body;
        
        const totalUsers = await users.find({}).limit(1).sort({createdAt:-1});    
        if(!totalUsers) return res.status(500).json({error:"Internel Server Error"});
        const exists = await users.findOne({address:uplineAddress});
        if(!exists){
            return res.status(200).json({message : "User doesnt exists"})
        }
       await addUserToTree(address,amount)
        console.log("amount",amount);
        let newAmount=amount-(amount/10)
        await users.updateOne({address:uplineAddress},{$set:{ powerMatrixIncome:((exists.powerMatrixIncome)+(newAmount))}})

        return res.json({ success:true,status:201,message:"user Buy Pro Income success fully"})

    }catch(error){
        console.log(`error in create profile : ${error}`);
        return res.json({success:false,status:500,error : "Internal Server error"})
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
        const treeType=await getUserTreeTypes(address);
        const globalTreeTypes=await getUserTreeTypeGlobal(address);
        const selfIncomeType=await getUserSelfIncome(address);
        const totalNumberOfReferWhoJoinedToday=await getTodaysRefersCount(address);
        let extraData={
            propowerincome:treeType.count,
            royalyAddress:process.env.DAILY_ROYALTIES,
            adminAddress:process.env.ADMIN_ADDRESS,
            selfIncome:selfIncomeType.count,
            globalSlot:globalTreeTypes,
            totalNumberOfReferWhoJoinedToday:totalNumberOfReferWhoJoinedToday.totalTodaysRefers
        }
        if (!exists) {
            return res.status(400).json({ message: "No such user found" ,status:400});
        } else {
            const userRefferData=users.findOne({ address });
            return res.status(200).json({ userData: exists,otherData:extraData,data:userRefferData.userId,status:200})
        }

    }catch(error){
        console.log(`error in get profille : ${error.message}`)
        return res.status(500).json({message : error,status:500})
    }
}


export const postselfIncome = async(req, res)=>{
    try{
        const {address,amount} = req.body;
        // if(!address){
        //     return res.status(400).json({error : "Please specify the address of the user."})
        // }
        let selfIncomeInfo=await getUserSelfIncome(address)
        if(selfIncomeInfo.treeTypes.includes(amount))  return res.status(401).json({message : "user Already Bought this",status:401})
         // Check if user has any active investments within 15 days
        const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

        const activeInvestment = await selfIncome.findOne({
            address: address,
            investmentDate: { $gte: fifteenDaysAgo }, // Investments made within the last 15 days
        });

        if (activeInvestment) {
            return res.status(403).json({
                message: "You cannot purchase another plan within 15 days of your previous investment.",
                status: 403,
            });
        }
        await selfIncome.create({
            address,
            amount,
        });
        return res.status(200).json({message:"User invested successfully",status:200})
    }catch(error){
        console.log(`error in self income post : ${error.message}`)
        return res.status(500).json({message : error,status:500})
    }
}

export const getSelfIncome=async(req,res)=>{
    try{
        const eligibleInvestments = await selfIncome.find({
            daysRewarded: { $lt: 15 }, // Check if the investment is within the reward duration
        });
        const rewardPercentage = 10; // 10% daily reward
        const userAddresses = [];
        const rewardAmounts = [];
        let royaltyAmount=0;
        for (const investment of eligibleInvestments) {
            const daysElapsed = Math.floor((Date.now() - investment.investmentDate.getTime()) / (1000 * 60 * 60 * 24));
            const daysToReward = Math.min(daysElapsed - investment.daysRewarded, 15 - investment.daysRewarded);
            if (daysToReward > 0) {
                let rewardAmount = (investment.amount * rewardPercentage * daysToReward) / 100;
                rewardAmount=rewardAmount-(rewardAmount/10)
                royaltyAmount+=Number+5((rewardAmount/10))
                // Add to arrays
                userAddresses.push(investment.address);
                rewardAmounts.push((rewardAmount*10**18).toString());
    
                // Update rewarded days in DB
                investment.daysRewarded += daysToReward;
                await investment.save();
            }
        }
        console.log("")
        return res.status(200).json({ data:  { userAddresses, rewardAmounts,royaltyAmount },status:200})

    }catch(error){

    }
}

export const updateselfIncome = async(req, res)=>{
    try{
        const {addresses} = req.body;
        await selfIncome.updateMany(
            { addresses: { $in: addresses }, daysRewarded: { $lt: 15 } },
            { $inc: { daysRewarded: 1 } } // Increment rewarded days by 1
        );
        return res.status(200).json({message:"User rewards distributed  successfully",status:201})
    }catch(error){
        console.log(`error in self income post : ${error.message}`)
        return res.status(500).json({message : error,status:500})
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
            treeType: treeType, // Specify the correct tree type (e.g., 3 USDT tree)
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
    while (currentNode && uplineAddresses.length < 3) {
        console.log("uplineAddresses inside loop",currentNode.address);
        uplineAddresses.push(currentNode.address);
        currentNode = await TreeNode.findOne({ address: currentNode.parentAddress });
    }

    // Pad with admin address if fewer than 3 uplines are found
    while (uplineAddresses.length < 3) {
        uplineAddresses.push(process.env.ADMIN_ADDRESS);
    }

    return uplineAddresses;
}

async function fetchParentForTree( fundAmount) {
    const treeType = fundAmount; // Use fundAmount as treeType

    // Find the next available parent node in the specified tree
    const parentNode = await TreeNode.findOne({
        treeType, // Match the correct tree
        $expr: { $lt: [{ $size: "$children" }, 4] }, // Node must have less than 4 children
    }).sort({ level: 1, createdAt: 1 }); // Closest to root, oldest nodes first
    console.log("parentNode",parentNode);

    if (!parentNode) {
        return null; // Indicates this user will become the root node for the tree
    }

    // Return the parentAddress for the next insertion
    return parentNode.address;
}

async function getUserTreeTypes(userAddress) {
    try {
        // Find distinct treeType values for the given user address
        const count = await ProTreeNode.countDocuments({ address:userAddress });
        // Return the count and the list of tree types
        
        return {
            count: count,
        };
    } catch (error) {
        console.error("Error fetching tree types for user:", error);
        throw new Error("Failed to fetch tree types.");
    }
}

async function getUserSelfIncome(userAddress) {
    try {
        // Find distinct treeType values for the given user address
        const treeTypes = await selfIncome.distinct("amount", { address: userAddress });

        // Return the count and the list of tree types
        return {
            count: treeTypes.length,
            treeTypes,
        };
    } catch (error) {
        console.error("Error fetching tree types for user:", error);
        throw new Error("Failed to fetch tree types.");
    }
}

const fetchTeam = async (userId) => {
    try {
        // Helper function for recursion
        const getTeamMembers = async (userIds, team = []) => {
            if (userIds.length === 0) return team;

            // Find all users referred by the current set of user IDs
            const referredUsers = await users.find({ address: { $in: userIds } }, { address: 1, referTo: 1 });

            // Add referred users to the team
            const newTeam = [...team, ...referredUsers];

            // Extract the addresses of the next level referrals
            const nextLevelAddresses = referredUsers.flatMap(user => user.referTo);

            // Recurse for the next level referrals
            return getTeamMembers(nextLevelAddresses, newTeam);
        };

        // Start recursion with the given user's address
        const user = await users.findOne({ address: userId }, { referTo: 1 });
        if (!user) {
            throw new Error("User not found");
        }

        // Fetch the full team
        const team = await getTeamMembers(user.referTo);
        return team;
    } catch (error) {
        console.error(`Error fetching team for user ${userId}: ${error.message}`);
        throw error;
    }
};


const uploadFileToCloudinary = async (filePath) => {
    try {
      const result = await cloudinary.uploader.upload(filePath, { folder: 'rolex-pro' });
  
      // Delete the local file after upload
      fs.unlinkSync(filePath);
  
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
  
      // Delete the local file even if upload fails
      fs.unlinkSync(filePath);
  
      // Throw the error to handle it in the calling function
      throw new Error('Cloudinary upload failed');
    }
};
  
async function getUserTreeTypeGlobal(userAddress) {
    try {
        // Find the tree node for the given user
        const userTreeNode = await TreeNode.countDocuments({ address: userAddress });

        if (!userTreeNode) {
            throw new Error("User not found in any tree.");
        }

        return userTreeNode;
    } catch (error) {
        console.error(`Error fetching tree type for user: ${error.message}`);
        return null;
    }
}


export const getReferDetails=async(req,res)=> {
    try {
        const {address} = req.query;
        // Find the user by their address
        const user = await users.findOne({ address });

        if (!user) {
            return { error: 'User not found' };
        }

        // Fetch details of users in the referTo array
        const referDetails = await users.find({ address: { $in: user.referTo } });
        const formatDate = (date) => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(date).toLocaleDateString('en-US', options);
        };
        // Map the referDetails to the required format
        const formattedReferDetails = referDetails.map(referUser => ({
            userId: referUser.userId,
            address: referUser.address,
            joinTime: formatDate(referUser.join_time),
            totalIncome: 
                (referUser.powerMatrixIncome || 0) +
                (referUser.globalMatrixIncome || 0) +
                (referUser.selfIncome || 0),
        }));
        

        // Return the formatted refer details
        const data= {
            userId: user.userId,
            address: user.address,
            referDetails: formattedReferDetails
        }
        return res.status(200).json({ data,status:200})
 
    } catch (error) {
        console.error('Error fetching refer details:', error);
        return { error: 'An error occurred while fetching refer details' };
    }
}

async function getTodaysRefersCount(userAddress) {
    try {
        // Get the start and end of today's date
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        // Find the user by their address
        const user = await users.findOne({ address: userAddress });

        if (!user) {
            return { error: 'User not found' };
        }

        // Count users in the referTo array who joined today
        const todaysRefersCount = await users.countDocuments({
            address: { $in: user.referTo }, // Only look at the referred users
            join_time: { $gte: startOfToday, $lte: endOfToday } // Filter today's joins
        });

        // Return the count of today's referred members
        return {
            totalTodaysRefers: todaysRefersCount
        };
    } catch (error) {
        console.error('Error fetching today\'s refer count:', error);
        return { error: 'An error occurred while fetching today\'s refer count' };
    }
}



