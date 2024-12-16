import mongoose from "mongoose";
const Schema = mongoose.Schema;

//depositrequest Mode schema 
const userProofSchema = new Schema({
    AccountID: { type: String, required: true, ref: 'User' },
    AadhaarProof: { type: String },
    NationalityProof: { type: String },
    uploadedAt: { type: Date, default: Date.now() },
    updatedAt: { type: Date, default: null }
});

const userProof = mongoose.model("userProof", userProofSchema);

export default userProof;
