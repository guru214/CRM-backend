import { encrypt, decrypt } from "./encryptDecrypt.js";
import fs from "fs";

// Helper function to encrypt deposit request data
const encryptDocumentProof = (documentProof) => {

    const AadhaarProof = fs.readFileSync(documentProof.AadhaarProof); // Read image file as buffer
    const AadhaarBase64 = AadhaarProof.toString("base64"); // Convert image to Base64 string
  
    const NationalityProof = fs.readFileSync(documentProof.NationalityProof);
    const NationalityBase64 = NationalityProof.toString("base64");
  
    return {
      AadhaarProof: AadhaarBase64 ? encrypt(AadhaarBase64) : "", // Encrypt the Base64 string 
      NationalityProof: NationalityBase64 ? encrypt(NationalityBase64) : "", // Encrypt the Base64 string
    };
  };
  
  // Helper function to decrypt deposit request data
  const decryptDocumentProof = (encryptedDocumentProof) => {
    return encryptedDocumentProof.map((data) => {
      const decryptAadhaarProof = decrypt(data.AadhaarProof);
      const decryptNationalityProof = decrypt(data.NationalityProof);
  
      return {
        AadhaarProof: decryptAadhaarProof || "", // Decrypted Base64 string
        Nationality: decryptNationalityProof || "", // Decrypted Base64 string
      };
    });
  };
  export {encryptDocumentProof, decryptDocumentProof};