import mongoose from "mongoose";

const userProofSchema = new mongoose.Schema({
  AccountID: { type: String, required: true, ref: 'User' },
  Documents: {
    type: Map,
    of: String, // Encrypted documents (e.g., Aadhaar, Nationality, etc.)
  },
  ExtractedDetails: {
    type: Map,
    of: Map, // Extracted details from documents (e.g., AadhaarDetails, NationalityDetails, etc.)
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("UserProof", userProofSchema);


// import mongoose from "mongoose";
// const Schema = mongoose.Schema;

// //depositrequest Mode schema 
// const userProofSchema = new Schema({
//     AccountID: { type: String, required: true, unique: true, ref: 'User' },
//     AadhaarProof: { type: String },
//     NationalityProof: { type: String },
//     uploadedAt: { type: Date, default: Date.now() },
//     updatedAt: { type: Date, default: null }
// });

// const userProof = mongoose.model("userProof", userProofSchema);

// export default userProof;
