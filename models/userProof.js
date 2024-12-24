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

//updated below, usgin previous for now.
// import mongoose from "mongoose";
// const Schema = mongoose.Schema;

// //depositrequest Mode schema 
// const userProofSchema = new Schema({
//     AccountID: { type: String, required: true, ref: 'User', unique: true },
//     proofs:[{
//         DocumentType: { type: String, required: true },
//         DocumentNumber: {type: String, required: true},
//         DocumentUpload: { type: String, required: true},
//         uploadedAt: { type: Date, default: Date.now() },
//         updatedAt: { type: Date, default: null }
//     }],
//     uploadedAt: { type: Date, default: Date.now() },
//     updatedAt: { type: Date, default: null }
// });

// const userProof = mongoose.model("userProof", userProofSchema);

// export default userProof;
