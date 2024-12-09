import { Schema, model } from "mongoose";

// Schema for tree nodes
const treeNodeSchema = new Schema({
    address: { 
        type: String, 
    },
    userId: { 
        type: Number, 
        default: null // Default to null for root nodes 
    },
    amount: { 
        type: Number, 
        default: 0 // Default level for the root node
    }
}, { timestamps: true });

const ProTreeNode = model("ProTreeNode", treeNodeSchema);

export default ProTreeNode;
