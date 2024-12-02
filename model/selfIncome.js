import { Schema, model } from "mongoose";

const investmentSchema = new Schema({
    address: { type: String, required: true }, // User's address
    amount: { type: Number, required: true }, // Investment amount
    investmentDate: { type: Date, default: Date.now }, // Date of investment
    daysRewarded: { type: Number, default: 0 }, // Days rewards have already been distributed
    planDuration: { type: Number, default: 15 }, // Maximum reward duration in days
}, { timestamps: true });

const selfIncome = model("selfIncome", investmentSchema);

export default selfIncome;
