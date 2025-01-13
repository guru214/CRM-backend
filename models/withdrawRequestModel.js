import mongoose from "mongoose";
const Schema = mongoose.Schema;

const withdrawRequestSchema = new Schema({
    AccountID : {
        type: String,
        required: true,
        ref: 'User'
    },
    withdraw_mode : {
        type: String,
        required: true
    },
    amount : {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
    },
    requestedAt : {
        type: Date,
        default: Date.now()
    },
    processedAt : {
        type: Date,
        default: null
    }
});

const withdrawRequest = mongoose.model('withdrawRequest', withdrawRequestSchema);

export default withdrawRequest;

