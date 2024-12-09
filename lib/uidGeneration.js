const generateAccountID = () => {
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000); // 9 random digits
    return `10${randomDigits}`; // Prefix "10"
  };
  
  // Generate Referral ID: First 2 letters of FullName + 4 random numbers + Last 2 letters of FullName
  const generateReferralID = (fullName) => {
    const sanitizedFullName = fullName.replace(/\s+/g, ""); // Remove spaces if any
    if (sanitizedFullName.length < 4) {
      throw new Error("Full name must be at least 4 characters long");
    }
    const firstFour = sanitizedFullName.substring(0, 4).toUpperCase(); // First 4 letters
    // const lastTwo = sanitizedFullName.substring(sanitizedFullName.length - 2).toUpperCase(); // Last 2 letters
    const randomNumbers = Math.floor(1000 + Math.random() * 9000); // 4 random digits
    return `${firstFour}${randomNumbers}`;
  };
  
  export {generateAccountID,generateReferralID};