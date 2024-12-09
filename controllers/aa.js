// import crypto from 'crypto';

// // AES-GCM encryption configuration
// const algorithm = 'aes-256-gcm';
// const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex'); // Use secret key from .env

// // Encryption function
// const encrypt = (text) => {
//   const iv = crypto.randomBytes(12); // Generate a new IV for each encryption
//   const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
//   let encrypted = cipher.update(text, 'utf-8', 'hex');
//   encrypted += cipher.final('hex');
//   const authTag = cipher.getAuthTag().toString('hex');
//   return `${iv.toString('hex')}:${encrypted}:${authTag}`;
// };

// // Decryption function
// const decrypt = (encryptedText) => {
//   const [ivHex, encryptedData, authTagHex] = encryptedText.split(':');
//   console.log('IV:', ivHex);
//   console.log('Encrypted Data:', encryptedData);
//   console.log('Auth Tag:', authTagHex);

//   if (!ivHex || !encryptedData || !authTagHex) {
//     throw new Error('Invalid encrypted text format');
//   }

//   const iv = Buffer.from(ivHex, 'hex');
//   const authTag = Buffer.from(authTagHex, 'hex');
//   const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
//   decipher.setAuthTag(authTag);
//   let decrypted = decipher.update(encryptedData, 'hex', 'utf-8');
//   decrypted += decipher.final('utf-8');
//   return decrypted;
// };

// // Example usage
// try {
//   const encrypted = encrypt('This is a secret message');
//   console.log('Encrypted:', encrypted);
//   const decrypted = decrypt(encrypted);
//   console.log('Decrypted:', decrypted);
// } catch (error) {
//   console.error('Error during encryption/decryption:', error.message);
// }

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz'; // Define the character set
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
}

// Generate a random string of 10 characters
const randomString = generateRandomString(10);
console.log(randomString);
