import mongoose from "mongoose";
const Schema = mongoose.Schema;

//depositrequest Mode schema 
const depositRequestSchema = new Schema({
  AccountID: { type: String, required: true, ref: 'User'  },
  deposit_mode: { type: String, required: true },
  amount: { type: String, required: true },
  image_proof: { type: String, required: true },
  status: { type: String, required: true },
  requestedAt : { type: Date, default: Date.now()},
  updatedAt : { type: Date, default: null }
});

const DepositRequest = mongoose.model("DepositRequest", depositRequestSchema);

export default DepositRequest;
