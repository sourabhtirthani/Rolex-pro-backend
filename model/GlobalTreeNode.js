import { Schema, model } from "mongoose";

// Schema for tree nodes
const treeNodeSchema = new Schema({
    address: { 
        type: String, 
    },
    parentAddress: { 
        type: String, 
        default: null // Default to null for root nodes 
    },
    children: [{ 
        type: String // Array of child addresses 
    }],
    level: { 
        type: Number, 
        default: 0 // Default level for the root node
    },
    treeType: { 
        type: Number, 
        required: true, // Make treeType mandatory
        default: 3 // Default to the 3 USDT tree
    },
}, { timestamps: true });

const TreeNode = model("GlobalTreeNode", treeNodeSchema);

export default TreeNode;
