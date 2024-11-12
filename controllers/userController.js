// // import activities from "../models/activity.js";
// import incomeTransactions from "../models/incomeTransactions.js";
import users from "../model/User.js";
import dotenv from 'dotenv'
dotenv.config();
export const createProfile = async (req, res)=>{
    try{
        const {address , referBy} = req.body;
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
        let sendHalfAmountForReffal=referBy;
        let treeResult =await traverseTree(referBy);
        console.log("treeResult",treeResult);
        if(!treeResult){
            return res.status(400).json({message : "No tree result"})
        }
        const newUser = await users.create({
            address,
            referBy : referBy,
            parentAddress:treeResult.parentAddress,
        });
        if(treeResult.position=="LEFT"){
            await users.updateOne({address:treeResult.parentAddress},{$set:{ leftAddress:address}})
        }else{
            await users.updateOne({address:treeResult.parentAddress},{$set:{ rightAddress:address}})
        }
        let {uplineAddresses,currentLevel}=await getUplineAddresses(address);

        const result = await users.findOneAndDelete({ address });
        if(treeResult.position=="LEFT"){
            await users.updateOne({address:treeResult.parentAddress},{$set:{ leftAddress:""}})
        }else{
            await users.updateOne({address:treeResult.parentAddress},{$set:{ rightAddress:""}})
        }
        return res.status(200).json({message : "All Good!",data:{"refferAddress":sendHalfAmountForReffal,"uplineAddress":uplineAddresses}})
    
    }catch(error){
        console.log(`error in create profile : ${error}`);
        return res.status(500).json({error : "Internal Server error"})
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
        const isReferExits =await users.findOne({address:referBy});
        if(!isReferExits){
            return res.status(400).json({message : "Reffer Address Not found",status:400})
        }

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



const traverseTreeForDownline = async (address, currentLevel = 0, result = []) => {
    const user = await users.findOne({ address });

    if (!user) return result;

    result.push({ address, level: currentLevel });

    if (user.leftAddress) {
        console.log('in left: ' + user.leftAddress)
        await traverseTreeForDownline(user.leftAddress, currentLevel + 1, result); 
    }

    if (user.rightAddress) {
        console.log('in right: ' + user.rightAddress)
        await traverseTreeForDownline(user.rightAddress, currentLevel + 1, result); 
    }
    
    return result;
};

const traverseTree = async (address) => {
    console.log("address", address);
    const userData = await users.findOne({ address });

    if (!userData) {
        console.log("User not found");
        return null;
    }

    console.log("Checking address", address);

    if (!userData.leftAddress) {
        console.log("Found available space at left of", address);
        return { "parentAddress": address, "position": "LEFT" };
    }

    if (!userData.rightAddress) {
        console.log("Found available space at right of", address);
        return { "parentAddress": address, "position": "RIGHT" };
    }

    // Check level 1
    console.log("Checking level 1 bottom from left to right");
    let currentLevel = [userData.leftAddress, userData.rightAddress];
    let nextLevel = [];

    for (const childAddress of currentLevel) {
        const childData = await users.findOne({ address: childAddress });

        // Check if there's space in the child subtree
        if (!childData.leftAddress || !childData.rightAddress) {
            console.log("Found available space in the child subtree of", childAddress);
            return await traverseTree(childAddress);
        }

        // Add children of the current node to the next level
        if (childData.leftAddress) {
            nextLevel.push(childData.leftAddress);
        }
        if (childData.rightAddress) {
            nextLevel.push(childData.rightAddress);
        }
    }

    // Move to the next level if no space is found in level 1
    while (nextLevel.length > 0) {
        currentLevel = nextLevel;
        nextLevel = [];

        console.log("Checking next level bottom from left to right");

        for (const childAddress of currentLevel) {
            const childData = await users.findOne({ address: childAddress });

            // Check if there's space in the child subtree
            if (!childData.leftAddress || !childData.rightAddress) {
                console.log("Found available space in the child subtree of", childAddress);
                return await traverseTree(childAddress);
            }

            // Add children of the current node to the next level
            if (childData.leftAddress) {
                nextLevel.push(childData.leftAddress);
            }
            if (childData.rightAddress) {
                nextLevel.push(childData.rightAddress);
            }
        }
    }

    console.log("No available space found at any level");
    return null;
}

// Function to traverse up the tree and retrieve upline addresses
async function getUplineAddresses (address, uplineAddresses = [], currentLevel = 0, maxLevel = 11) {
    console.log('address',address);
    const userData = await users.findOne({address});
    console.log("userData",userData);
    if(userData){
    if (!userData.parentAddress) {
        return {uplineAddresses,currentLevel};
    }

    uplineAddresses.push(userData.parentAddress);

    // Check if the maximum level is reached
    if (currentLevel === maxLevel) {
        return {uplineAddresses,currentLevel};
    }
    // Recursively traverse up to the parent node
    return getUplineAddresses(userData.parentAddress, uplineAddresses, currentLevel + 1, maxLevel);
}else return  {uplineAddresses,currentLevel};
}


export const fetchAllUsers = async(req, res)=>{
    try{
        const {startDate , endDate} = req.query;
       
        if ((startDate && isNaN(Date.parse(startDate))) || (endDate && isNaN(Date.parse(endDate)))) {
            return res.status(400).json({ error: "Invalid date format" });  // YYYY-MM-DD
          }
        let allUsers;
        if(startDate && endDate){
            allUsers = await filterData(startDate , endDate);
        }else{
            allUsers = await users.find({});
        }

        return res.status(200).json({allUsers});

    }catch(error){
        console.log(`error in fetch all users in controllers : ${error.message}`);
        return res.status(500).json({error : "Internal server error"})
    }
}

const filterData = async ( startDate, endDate ) => {            // this function is used in fetch all users
    let query;
  if (startDate && endDate) {
    const sdate = new Date(startDate);
    const edate = new Date(endDate);
    query = {
        createdAt: { $gte: sdate, $lte: edate },
      };
  let res = await users.find(query);
  return res;
};
}


export const fetchMyReferral = async(req, res)=>{
    try{
        const {address} = req.params;
        const {startDate , endDate} = req.query;
        // console.log(`the address is : ${address} and the start date is : ${startDate} and the enddatae is : ${endDate}`)
        if(!address){
            return res.status(400).json({error : "Please provide address"});
        }
        const userDetails = await users.findOne({address : address});
        if(!userDetails){
            return res.status(400).json({error : "No such user found with that address"});
        }
        if ((startDate && isNaN(Date.parse(startDate))) || (endDate && isNaN(Date.parse(endDate)))) {
            return res.status(400).json({ error: "Invalid date format" });   // YYYY-MM-DD
          }
        let referToUsers;
        if(startDate && endDate){
            referToUsers = await users.find({ address : {$in : userDetails.referTo || []} , createdAt : {$gte : new Date(startDate), $lte : new Date(endDate)}});
        }else{
            referToUsers = await users.find({ address: { $in: userDetails.referTo || [] } });
        }
        return res.status(200).json({referToUsers});

    }catch(error){
        console.log(`error in fetch my referral in controllers : ${error.message}`)
        return res.status(500).json({error : "Internal server error"});
    }
}


export const fetchIncomeTransaction = async(req, res)=>{
    try{
        const { address} = req.params;
        if(!address){
            return res.status(400).json({error : "No address provided"})
        }
        const exists = await users.findOne({address});
        if(!exists){
            return res.status(400).json({error : "No such user found"})
        }
        // const allTeam = await users.find({address : exists.referTo});
        const teamAddresses = exists.referTo;

        const teamTransactions = await incomeTransactions.find({
            $or : [
                {fromAddress : {$in : teamAddresses}},
                {toAddress : {$in : teamAddresses}}
            ]
        });

        return res.status(200).json({teamTransactions});


    }catch(error){
        return res.status(500).json({error : "Internal server error"});
    }
}



export const fetchUserData  = async(req, res)=>{
    try{
        const {address , userId} = req.body;
        let exists;
        if(!address && !userId){
            return res.status(400).json({message : "No userID or address provided"});
        }
        if(!address){
            // console.log("no address")
            exists = await users.findOne({userId : userId});
        }
        if(!userId){
            // console.log("no userid")
            exists = await users.findOne({address : address})
        }

        if(!exists){
            return res.status(500).json({message : "No user found"});
        }

        return res.status(200).json({user : exists});
    }catch(error){
        return res.status(500).josn({error : "Internal server error "})
    }
}
