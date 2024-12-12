import DepositRequest from "../models/DepositRequest.js";

// Submit a new deposit request
const submitDepositRequest = async (req, res) => {
  try {
    const { AccountID, Deposit_mode, amount, image_proof } = req.body;

    if (!AccountID || !Deposit_mode || !amount || !image_proof) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create a new deposit request
    const newDepositRequest = new DepositRequest({
      AccountID,
      Deposit_mode: Deposit_mode,
      amount,
      image_proof,
    });

    // Save the deposit request to the database
    await newDepositRequest.save();

    res.status(201).json({
      message: "Deposit request submitted successfully.",
    });
  } catch (error) {
    console.error("Error submitting deposit request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// List all deposit requests for a given AccountID
const listDepositRequests = async (req, res) => {
  try {
    const { AccountID } = req.params;

    if (!AccountID) {
      return res.status(400).json({ message: "AccountID is required" });
    }

    const requests = await DepositRequest.find({ AccountID });

    if (requests.length === 0) {
      return res.status(404).json({ message: "No deposit requests found" });
    }

    res.json(requests);
  } catch (error) {
    console.error("Error listing deposit requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { submitDepositRequest, listDepositRequests };
