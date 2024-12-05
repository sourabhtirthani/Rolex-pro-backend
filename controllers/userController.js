// // import activities from "../models/activity.js";
 import incomeTransactions from "../model/IncomeTransaction.js";
import users from "../model/User.js";
import  TreeNode  from "../model/TreeNode.js"; 
import selfIncome from "../model/selfIncome.js";
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
        if(Number(isReferExits.referTo.length)==0 || Number(isReferExits.referTo.length)==2){
            referPaymentAddress=isReferExits.referBy;
        }
        else if(Number(isReferExits.referTo.length)==1||Number(isReferExits.referTo.length)==3) referPaymentAddress=referBy;
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

        // await incomeTransactions.create({
        //     fromUserId:userId,
        //     toUserId:existsReferPaymentAddress.userId,
        //     fromAddress:address,
        //     toAddress:referPaymentAddress,
        //     incomeType:"Referral income",
        //     amount:referPaymentAmount,
        //     transactionHash:transactionHash
        // })
        // await incomeTransactions.create({
        //     fromUserId:userId,
        //     toUserId:1,
        //     fromAddress:address,
        //     toAddress:process.env.DAILY_ROYALTIES,
        //     incomeType:"Royalty income",
        //     amount:0.6,
        //     transactionHash:transactionHash
        // })
        // const updateDataForUser={
        //     transactionHash,
        //     isActive:true
        // }
        // await users.updateOne({address},{$set:updateDataForUser});

        let uplineAddressesData;
        let i=0;
        while( i< uplineAddresses.length){            
             uplineAddressesData=await users.findOne({address:uplineAddresses[i]})
             await users.updateOne({address:uplineAddresses[i]},{$set:{ globalMatrixIncome:((uplineAddressesData.globalMatrixIncome)+(uplineAddressesAmount[i]))}})
            i++;
        }
        return res.json({ success:true,status:201,message:"user joined"})

    }catch(error){
        console.error(`error in update profile : ${error}`);
        return res.json({success:false,status:500,message : error})
    }
}

export const buyProIncome = async (req, res)=>{
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
export const updateProIncome=async(req,res)=>{
    try{
        const {address, uplineAddress ,amount} = req.body;
        
        const totalUsers = await users.find({}).limit(1).sort({createdAt:-1});    
        if(!totalUsers) return res.status(500).json({error:"Internel Server Error"});
        const exists = await users.findOne({address:uplineAddress});
        if(!exists){
            return res.status(200).json({message : "User doesnt exists"})
        }
        console.log("addUserToTree",amount);
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
        console.log("exists",exists);
        const treeType=await getUserTreeTypes(address);
        const selfIncomeType=await getUserSelfIncome(address);
        let extraData={
            propowerincome:treeType.count,
            royalyAddress:process.env.DAILY_ROYALTIES,
            adminAddress:process.env.ADMIN_ADDRESS,
            selfIncome:selfIncomeType.count,
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
        uplineAddresses.push(currentNode.address);
        console.log("uplineAddresses inside loop",uplineAddresses);
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
        const treeTypes = await TreeNode.distinct("treeType", { address: userAddress });

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