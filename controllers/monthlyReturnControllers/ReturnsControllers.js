import User from '../../models/User.js';
import MonthlyReturns from '../../models/monthlyReturns.js';
import { encrypt, decrypt } from '../../lib/EncryptDecrypt/encryptDecrypt.js';
import DepositRequest from '../../models/DepositRequest.js';
const createReturns = async (req, res) => {
    try {
        const { AccountID, date, returnAmount, returnPercentage } = req.body;

        // Validate input
        if (!date) {
            return res.status(400).json({ error: 'Date is required.' });
        }

        if (!returnAmount && !returnPercentage) {
            return res.status(400).json({ error: 'Either returnAmount or returnPercentage must be provided.' });
        }

        // Check if the user exists
        const userRecord = await User.findOne({ where: { AccountID: AccountID } });
        if (!userRecord) {
            return res.status(404).json({ error: 'User not found.' });
        }

        // Retrieve the user's total investment from deposit records
        const depositData = await DepositRequest.find({ AccountID, status: "Approved" });
        if (!depositData || depositData.length === 0) {
            return res.status(404).json({ error: 'No approved deposits found for the user.' });
        }

        // console.log(depositData)
        const totalInvestment = depositData.reduce((sum, deposit) => sum + parseFloat(decrypt(deposit.amount)), 0);

        // console.log(totalInvestment)
        let calculatedReturnAmount = returnAmount;
        let calculatedReturnPercentage = returnPercentage;

        // Calculate missing value if one is provided
        if (returnAmount && !returnPercentage) {
            calculatedReturnPercentage = (returnAmount / totalInvestment) * 100;
        } else if (returnPercentage && !returnAmount) {
            calculatedReturnAmount = (returnPercentage / 100) * totalInvestment;
            calculatedReturnAmount = calculatedReturnAmount.toString();
        }

        // console.log(calculatedReturnAmount)
        // console.log(calculatedReturnPercentage)
        // Ensure the calculated values are valid numbers
        if (isNaN(calculatedReturnAmount) || isNaN(calculatedReturnPercentage)) {
            return res.status(400).json({ error: 'Invalid return amount or return percentage calculation.' });
        }
        const existingReturn = await MonthlyReturns.findOne({
            AccountID: AccountID,
            returns: {
                $elemMatch: {
                    date: {
                        $gte: new Date(new Date(date).setMonth(new Date(date).getMonth(), 1)), // First day of the month
                        $lt: new Date(new Date(date).setMonth(new Date(date).getMonth() + 1, 0)) // Last day of the month
                    }
                }
            }
        });
        
        if (existingReturn) {
            return res.status(400).json({ error: 'Monthly return for the specified month and year already exists.' });
        }
        
        
        // Decrypt the user's existing amount, update it, and encrypt the new amount
        const existingUserAmount = parseFloat(decrypt(userRecord.amount));
        const updatedAmount = existingUserAmount + parseFloat(calculatedReturnAmount);
        userRecord.amount = encrypt(updatedAmount.toString()); // Encrypt the updated amount

        // Create a new monthly return entry
        const newReturn = {
            date: new Date(date),
            returnAmount: calculatedReturnAmount,
            returnPercentage: calculatedReturnPercentage,
            newDate: Date.now(),
        };

        // Update the user's monthly returns array
        const updatedReturn = await MonthlyReturns.findOneAndUpdate(
            { AccountID: AccountID },
            { $push: { returns: newReturn } },
            { new: true, upsert: true }
        );

        await userRecord.save();

        return res.status(201).json({ message: 'Monthly return created successfully.', data: updatedReturn });
    } catch (error) {
        console.error('Error creating monthly return:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};


const getReturns = async (req, res) => {
    try {
        const AccountID = req.user.AccountID; // Assuming the user is authenticated and AccountID is available in req.user

        // Fetch the user's monthly returns
        const userReturns = await MonthlyReturns.findOne({ AccountID: AccountID });

        if (!userReturns) {
            return res.status(404).json({ error: 'No returns found' });
        }

        // Return the list of returns
        return res.status(200).json({
            message: 'Monthly returns fetched successfully.',
            data: {
                returns: userReturns.returns, // Return the array of returns
                totalReturns: userReturns.totalReturns, // Access the virtual field
            },
        });
    } catch (error) {
        console.error('Error fetching monthly returns:', error.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};


const listAllReturns = async (req, res) => {
    try {
        // Fetch all returns for all users
        const allReturns = await MonthlyReturns.find();

        if (!allReturns || allReturns.length === 0) {
            return res.status(404).json({ error: 'No returns found.' });
        }

        // Format the response to include the total returns for each user
        const formattedReturns = allReturns.map((userReturns) => {
            return {
                AccountID: userReturns.AccountID,
                returns: userReturns.returns,
                totalReturns: userReturns.totalReturns, // Virtual field
                lastUpdated: userReturns.lastUpdated,
            };
        });

        return res.status(200).json({
            message: 'All monthly returns fetched successfully.',
            data: formattedReturns,
        });
    } catch (error) {
        console.error('Error fetching all monthly returns:', error.message);
        return res.status(500).json({ error: 'Internal server error.' });
    }
};

export { createReturns, getReturns, listAllReturns };
