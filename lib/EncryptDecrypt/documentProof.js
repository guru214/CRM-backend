import { encrypt, decrypt } from "./encryptDecrypt.js";

// Helper function to encrypt deposit request data
const encryptDocumentProof = (documentProof) => {

    const AadhaarBase64 = documentProof.AadhaarProof; // Convert buffer to Base64 string
    const NationalityBase64 = documentProof.NationalityProof;
  
    return {
      AadhaarProof: AadhaarBase64 ? encrypt(AadhaarBase64.toString("base64")) : null, // Encrypt the Base64 string 
      NationalityProof: NationalityBase64 ? encrypt(NationalityBase64.toString("base64")) : null, // Encrypt the Base64 string
    };
  };

  // Helper function to decrypt deposit request data
const decryptDocumentProof = (encryptedDocumentProof) => {
  // console.log("Initial data:", encryptedDocumentProof); // Log initial data

  if (!Array.isArray(encryptedDocumentProof)) {
    // console.error("Input is not an array");
    return [];
  }

  return encryptedDocumentProof.map((data, index) => {
    // console.log(`Processing item ${index}:`, data); // Log each item

    const decryptAadhaarProof = data.AadhaarProof ? decrypt(data.AadhaarProof) : null;
    const decryptNationalityProof = data.NationalityProof ? decrypt(data.NationalityProof) : null;

    return {
      AadhaarProof: decryptAadhaarProof, // Decrypted Base64 string
      NationalityProof: decryptNationalityProof // Decrypted Base64 string
    };
  });
};

  export {encryptDocumentProof, decryptDocumentProof};