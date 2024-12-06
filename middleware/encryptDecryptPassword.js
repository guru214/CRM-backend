import crypto from 'crypto';
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// AES-GCM encryption configuration 
const algorithm = 'aes-256-gcm'; 
const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');  // Use secret key from .env 

// Encryption Function 
const encryptPassword = (text, iv) => { 
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv); 
  let encrypted = cipher.update(text, 'utf-8', 'hex'); 
  encrypted += cipher.final('hex'); 
  const authTag = cipher.getAuthTag().toString('hex'); 
  return `${iv}:${encrypted}:${authTag};` }; // Decryption function 
  
  // Decryption Function
const decryptPassword = (encryptedText) => { 
    const [ivHex, encryptedData, authTagHex] = encryptedText.split(':'); 
    if (!ivHex || !encryptedData || !authTagHex) { 
      console.log(ivHex);
      console.log(authTagHex)
      console.log(encryptedData)
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


const generateRandomString = (length)=> {
  const characters = 'f01a23b45c67d89e'; // Define the character set
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
};

export {encryptPassword, decryptPassword, generateRandomString};