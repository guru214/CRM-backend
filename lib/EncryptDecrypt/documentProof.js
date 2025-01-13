import { encrypt, decrypt } from "./encryptDecrypt.js";

// Helper function to encrypt any document proof data
const encryptDocumentProof = (documentProof) => {
  const encryptedDocumentProof = {};

  // Iterate over all keys in documentProof
  Object.keys(documentProof).forEach((key) => {
    const documentBuffer = documentProof[key];
    if (documentBuffer) {
      // Convert buffer to Base64 string and encrypt
      encryptedDocumentProof[key] = encrypt(documentBuffer.toString("base64"));
    } else {
      encryptedDocumentProof[key] = null; // Handle case where there's no document
    }
  });

  return encryptedDocumentProof;
};

// Helper function to decrypt any document proof data
const decryptDocumentProof = (encryptedDocumentProof) => {
  const decryptedDocumentProof = {};

  // Iterate over all keys in encryptedDocumentProof
  Object.keys(encryptedDocumentProof).forEach((key) => {
    const encryptedDocument = encryptedDocumentProof[key];
    if (encryptedDocument) {
      // Decrypt and convert back to Base64 string
      decryptedDocumentProof[key] = decrypt(encryptedDocument);
    } else {
      decryptedDocumentProof[key] = null; // Handle case where there's no encrypted document
    }
  });

  return decryptedDocumentProof;
};

export { encryptDocumentProof, decryptDocumentProof };
