import mongoose from "mongoose";
const Schema = mongoose.Schema;

// Withdraw Mode Schema
const WithdrawModeSchema = new Schema({
    AccountID: { type: String, required: true, unique: true, ref: 'User' },
    account_holder_name: { type: String },
    account_number: { type: String },
    ifsc_code: { type: String },
    bic_swift_code: { type: String },
    branch: { type: String },
    bank_account_currency: { type: String },
    upi_address: { type: String },
    btc_withdraw_address: { type: String },
    eth_withdraw_address: { type: String },
    netteller_address: { type: String },
  });
const WithdrawMode = mongoose.model('WithdrawMode', WithdrawModeSchema);

export default WithdrawMode;
