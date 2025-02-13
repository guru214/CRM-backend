import crypto from 'crypto';
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// AES-GCM encryption configuration 
const algorithm = 'aes-256-gcm'; 
const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');  // Use secret key from .env 

// Encryption Function 
const encrypt = (text) => { 
  const iv = crypto.randomBytes(12); // Generate a new IV for each encryption 
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv); 
  let encrypted = cipher.update(text, 'utf-8', 'hex'); 
  encrypted += cipher.final('hex'); 
  const authTag = cipher.getAuthTag().toString('hex'); 
  return `${iv.toString('hex')}:${encrypted}:${authTag};` }; // Decryption function 
  
  // Decryption Function
const decrypt = (encryptedText) => { 
    const [ivHex, encryptedData, authTagHex] = encryptedText.split(':'); 
    if (!ivHex || !encryptedData || !authTagHex) { 
      // console.log(ivHex);
      // console.log(authTagHex)
      // console.log(encryptedData)
      throw new Error('Invalid encrypted text format'); 
    } 
      const iv = Buffer.from(ivHex, 'hex'); 
      const authTag = Buffer.from(authTagHex, 'hex'); 
      const decipher = crypto.createDecipheriv(algorithm, secretKey, iv); 
      decipher.setAuthTag(authTag); 
      let decrypted = decipher.update(encryptedData, 'hex', 'utf-8'); 
      decrypted += decipher.final('utf-8'); 
      return decrypted;
};

export {encrypt,decrypt};