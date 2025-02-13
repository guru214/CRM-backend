// import { connectDB, closeDB } from "../../config/mongodb.js";
import userProof from "../../models/userProof.js";
import { encryptDocumentProof } from "../../lib/EncryptDecrypt/documentProof.js";
import Tesseract from "tesseract.js";
import { decrypt } from "../../lib/EncryptDecrypt/encryptDecrypt.js";

function extractAadhaarDetails(text) {
  const details = {};

  // Aadhaar number extraction (Only 12 digits, optional spaces between)
  const aadhaarMatch = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\b(?!\s?\d{4})/);
  if (aadhaarMatch) {
    // Ensure that only the first 12 digits are considered (remove any spaces)
    details.aadhaar = aadhaarMatch[0].replace(/\s/g, '');
  }

  // VID number extraction (Only 16 digits, optional spaces between)
  const vidMatch = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/);
  if (vidMatch) {
    // Ensure that only the first 16 digits are considered (remove any spaces)
    details.vid = vidMatch[0].replace(/\s/g, '');
  }

  // Date of Birth extraction (Format: DD/MM/YYYY or YYYY-MM-DD)
  const dobMatch = text.match(/\b(?:\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})\b/);
  if (dobMatch) {
    details.dob = dobMatch[0];
  }

  // Name extraction (Assuming name appears after "Name:" or "नाम:")
  const nameMatch = text.match(/(?:Name|नाम):?\s*([A-Za-z\s]+)/);
  if (nameMatch) {
    details.name = nameMatch[1].trim();
  }

  return details;
}


function extractDrivingLicenseDetails(text) {
  const details = {};

  // Driving License number extraction
  // Driving License number extraction (after "DL No." or similar keyword)
  const drivLicenseMatch = text.match(/(?:DL No\.?|DL)\s*[:\-]?\s*([A-Z]{2}-\d{13})/i);
  if (drivLicenseMatch) {
    details.drivingLicense = drivLicenseMatch[1]; // Capture group contains the DL number
  }

  // Date of Birth extraction (after "DOB" or "Date of Birth")
  const dobMatch = text.match(/(?:DOB|Date of Birth)\s*[:\-]?\s*(\d{2}-\d{2}-\d{4})/i);
  if (dobMatch) {
    details.dob = dobMatch[1]; // Capture group contains the DOB
  }

  // Name extraction (Assuming name appears after "Name:" or "नाम:")
  const nameMatch = text.match(/(?:Name|नाम):?\s*([A-Za-z\s]+)/);
  if (nameMatch) {
    details.name = nameMatch[1].trim();
  }


  // Address extraction (Captures after "Add" or "Address")
  const addressMatch = text.match(/(?:Add|Address)\s*:\s*([\w\s,.-]+)/);
  if (addressMatch) {
    details.address = addressMatch[1].trim();
  }

  return details;
}


function extractPassportDetails(text) {
  const details = {};

  // Passport number extraction
  const passMatch = text.match(/\b[A-Z]{1}[0-9]{7}\b/);
  if (passMatch) {
    details.passport = passMatch[0];
  }

  // Date of Birth extraction (after "DOB" or "Date of Birth")
  const dobMatch = text.match(/(?:DOB|Date of Birth)\s*[:\-]?\s*(\d{2}-\d{2}-\d{4})/i);
  if (dobMatch) {
    details.dob = dobMatch[1]; // Capture group contains the DOB
  }

  // Name extraction (Assuming name appears after "Name:" or "नाम:")
  const nameMatch = text.match(/(?:Name|नाम):?\s*([A-Za-z\s]+)/);
  if (nameMatch) {
    details.name = nameMatch[1].trim();
  }

  return details;
}

function extractOtherDetails(text) {
  const details = {};

  // Extract Date of Birth (Various formats: DD/MM/YYYY, YYYY-MM-DD, etc.)
  const dobMatch = text.match(/\b(?:\d{2}[-/]\d{2}[-/]\d{4}|\d{4}[-/]\d{2}[-/]\d{2})\b/);
  if (dobMatch) {
    const dob = dobMatch[0];
    details.dob = dob;
  }

  // Extract Aadhaar (12-digit number in XXXX XXXX XXXX format)
  const aadhaarMatch = text.match(/\b\d{4}\s\d{4}\s\d{4}\b/);
  if (aadhaarMatch) {
    details.aadhaar = aadhaarMatch[0];
  }

  // Extract PAN (10-character alphanumeric starting with a letter)
  const panMatch = text.match(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/);
  if (panMatch) {
    details.pan = panMatch[0];
  }

  // Extract Passport Number (8-character alphanumeric starting with a letter)
  const passMatch = text.match(/\b[A-Z]{1}[0-9]{7}\b/);
  if (passMatch) {
    details.passport = passMatch[0];
  }

  // Extract Driving License (16-character alphanumeric with optional hyphen after first 2 letters)
  const drivLicenseMatch = text.match(/\b[A-Z]{2}-?\d{14}\b/);
  if (drivLicenseMatch) {
    details.drivingLicense = drivLicenseMatch[0];
  }

  // Extract Voter ID (10-character alphanumeric starting with 3 letters)
  const voterIdMatch = text.match(/\b[A-Z]{3}[0-9]{7}\b/);
  if (voterIdMatch) {
    details.voterId = voterIdMatch[0];
  }

  // Extract Bank Account Number (10 to 18-digit number)
  const bankAccountMatch = text.match(/\b\d{10,18}\b/);
  if (bankAccountMatch) {
    const bankAccount = bankAccountMatch[0];
    // Validate account number length (if necessary)
    if (bankAccount.length >= 10 && bankAccount.length <= 18) {
      details.bankAccount = bankAccount;
    }
  }

  // Extract IFSC Code (11-character alphanumeric starting with 4 letters)
  const ifscMatch = text.match(/\b[A-Z]{4}0[A-Z0-9]{6}\b/);
  if (ifscMatch) {
    details.ifsc = ifscMatch[0];
  }

  // Extract Credit/Debit Card Number (16-digit number with optional spaces)
  const cardNumberMatch = text.match(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/);
  if (cardNumberMatch) {
    details.cardNumber = cardNumberMatch[0].replace(/\s+/g, ''); // Remove spaces if any
  }

  // Extract Mobile Number (10-digit number starting with 6-9)
  const mobileMatch = text.match(/\b[6-9]\d{9}\b/);
  if (mobileMatch) {
    details.mobileNumber = mobileMatch[0];
  } return details;
}


// Main function to handle extraction based on document type
async function extractDetailsByDocumentType(documentType, buffer) {
  const text = await Tesseract.recognize(buffer, "eng").then((result) => result.data.text);

  if (!text || text.trim().length === 0) {
    throw new Error(`Failed to extract details from ${documentType}. Please upload a valid document.`);
  }

  switch (documentType) {
    case "AadhaarProof":
      return extractAadhaarDetails(text);
    case "DrivingLicenseProof":
      return extractDrivingLicenseDetails(text);
    case "PassportProof":
      return extractPassportDetails(text);
    case "OtherProof":
      return extractOtherDetails(text);
    default:
      throw new Error(`Unknown document type: ${documentType}`);
  }
}

// Sanitize extracted details
function sanitizeExtractedDetails(details) {
  const sanitizedDetails = {};
  for (const key in details) {
    if (!key.startsWith('$')) {
      sanitizedDetails[key] = details[key];
    }
  }
  return sanitizedDetails;
}

// Controller to handle document submission
const submitDocument = async (req, res) => {
  try {
    // await connectDB();

    const AccountID = req.user.AccountID;
    const uploadedFiles = req.files || {};

    if (!AccountID || Object.keys(uploadedFiles).length === 0) {
      return res.status(400).json({ message: "AccountID and at least one document are required." });
    }

    const documentBuffers = {};
    for (const key in uploadedFiles) {
      if (uploadedFiles[key]) {
        documentBuffers[key] = uploadedFiles[key][0]?.buffer || null;
      }
    }

    const encryptedDocumentProof = encryptDocumentProof(documentBuffers);
    //  console.log(encryptedDocumentProof)
    const extractedDetails = {};
    for (const documentType in documentBuffers) {
      if (documentBuffers[documentType]) {
        try {
          extractedDetails[documentType] = await extractDetailsByDocumentType(documentType, documentBuffers[documentType]);
        } catch (error) {
          return res.status(400).json({ message: error.message });
        }
      }
    }
    // console.log(extractedDetails)

    const sanitizedExtractedDetails = sanitizeExtractedDetails(extractedDetails);

    let existingUserProof = await userProof.findOne({ AccountID });

    if (existingUserProof) {
      for (const key in documentBuffers) {
        if (documentBuffers[key]) {
          existingUserProof[key] = encryptedDocumentProof[key] || existingUserProof[key];
        }
      }

      existingUserProof.ExtractedDetails = { ...existingUserProof.ExtractedDetails, ...sanitizedExtractedDetails };

      await existingUserProof.save();
      return res.status(200).json({ message: "Document updated successfully!", extractedDetails });
    } else {
      const newUserProof = new userProof({
        AccountID,
        Documents: encryptedDocumentProof,
        ExtractedDetails: sanitizedExtractedDetails,
      });

      await newUserProof.save();
      return res.status(201).json({ message: "Document submitted successfully!", extractedDetails });
    }
  } catch (error) {
    console.error("Error submitting documents:", error);
    res.status(500).json({ message: "Internal server error." });
  } finally {
    // await closeDB();
  }
};

// Controller to list documents
const getDocument = async (req, res) => {
  try {
    // await connectDB();

    const AccountID = req.user.AccountID;

    if (!AccountID) {
      return res.status(400).json({ message: "AccountID is required." });
    }

    const documentProofs = await userProof.find({ AccountID });

    if (!documentProofs || documentProofs.length === 0) {
      return res.status(404).json({ message: "No documents found." });
    }

    // Decrypt the document field in the 'Documents' object for each document
    const decryptedDocuments = documentProofs.map(doc => {
      if (doc.Documents) {
        // Check if either 'PassportProof' or 'AadhaarProof' exists in the Map
        const documentKey = ['PassportProof', 'AadhaarProof', 'NationalityProof', 'DrivingLicenseProof', 'OtherProof'].find(key => doc.Documents.has(key));

        if (documentKey) {
          // Decrypt the document field
          doc.Documents.set(documentKey, decrypt(doc.Documents.get(documentKey)));
        }
      }
      return doc;
    });
    const documentTitle = ['PassportProof', 'AadhaarProof', 'NationalityProof', 'DrivingLicenseProof', 'OtherProof']
      .find(key => decryptedDocuments[0].Documents.has(key));

    if (documentTitle) {
      const Document = decryptedDocuments[0].Documents.get(documentTitle); // Get the decrypted document
      res.status(200).json({ Document }); // Send the decrypted document in the response
    }
  } catch (error) {
    console.error("Error listing documents:", error);
    res.status(500).json({ message: "Internal server error." });
  } finally {
    // await closeDB();
  }
};


const deleteDocument = async (req, res) => {
  try {
    // await connectDB();

    const AccountID = req.user.AccountID;

    if (!AccountID) {
      return res.status(400).json({ message: "AccountID is required." });
    }
    // Find the document in the database
    const document = await userProof.findOne({ AccountID });

    if (!document) {
      return res.status(404).json({ message: "Document not found." });
    }

    // Delete the document
    await userProof.deleteOne({ AccountID: AccountID });

    res.status(200).json({ message: "Document deleted successfully." });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ message: "Internal server error." });
  } finally {
    // await closeDB();
  }
};

const listDocuments = async (req, res) => {
  try {
    // Retrieve all user proofs
    const userProofs = await userProof.find({});

    // Check if there are no user proofs
    if (!userProofs || userProofs.length === 0) {
      return res.status(404).json({ message: "No userProof found." });
    }
    // Process and decrypt documents
    const processedProofs = userProofs.map((proof) => {
      let documentTitle = null;
      let documentBase64 = null;

      console.log(proof)

      if (proof.Documents) {
        // Find the first document key that exists
        documentTitle = [
          'PassportProof',
          'AadhaarProof',
          'NationalityProof',
          'DrivingLicenseProof',
          'OtherProof',
        ].find(key => proof.Documents.has(key));
        // console.log(documentTitle)

        if (documentTitle) {
          // Decrypt the document (assuming decrypt function exists)
          documentBase64 = decrypt(proof.Documents.get(documentTitle));
        }
      }
      const extractedDetailsMap = proof.ExtractedDetails || new Map();

      // Convert the Map to a plain object
      const extractedDetailsObj = Object.fromEntries(
        Array.from(extractedDetailsMap.entries()).map(([key, value]) => {
          // If the value is a Map, convert it to an object as well
          if (value instanceof Map) {
            return [key, Object.fromEntries(value)];
          }
          return [key, value];
        })
      );

      return {
        AccountID: proof.AccountID,
        DocumentTitle: documentTitle || "No Document Found",
        DocumentProof: documentBase64,
        ExtractedDetails: extractedDetailsObj,
        createdAt: proof.createdAt,
      };
    });

    // Send the processed proofs as the response
    return res.status(200).json({ proofs: processedProofs });
  } catch (error) {
    console.error("Error retrieving or processing documents:", error);
    return res.status(500).json({ message: "An error occurred while processing documents." });
  }
};


export { submitDocument, getDocument, listDocuments, deleteDocument };
