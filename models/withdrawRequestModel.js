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

// CREATE TABLE IF NOT EXISTS server_crm.withdraw_requests (
//     id INT NOT NULL AUTO_INCREMENT,
//     AccountID VARCHAR(600) NOT NULL,
//     withdraw_mode ENUM()  NOT NULL, -- Reference to withdraw_modes
//     amount DECIMAL(10, 2) NOT NULL,
//     status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
//     request_date DATETIME DEFAULT CURRENT_TIMESTAMP,
//     processed_date DATETIME NULL,
//     PRIMARY KEY (id),
//     FOREIGN KEY (AccountID) REFERENCES server_crm.users(AccountID) ON DELETE CASCADE,
//     FOREIGN KEY (withdraw_mode) REFERENCES server_crm.withdraw_modes(withdraw_mode) ON DELETE CASCADE
// );