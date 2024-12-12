import mongoose from "mongoose";
const Schema = mongoose.Schema;

//depositrequest Mode schema 
const depositRequestSchema = new Schema({
  AccountID: { type: String, required: true, ref: 'User'  },
  deposit_mode: { type: String, required: true },
  amount: { type: Number, required: true },
  image_proof: { type: String, required: true },
  status: { type: String, enum: ['pending', 'success', 'failure'], default: "pending" },
});

const DepositRequest = mongoose.model("DepositRequest", depositRequestSchema);

export default DepositRequest;
