
import dotenv from "dotenv";
import { encryptUserData, decryptUserData } from "../../lib/EncryptDecrypt/UserData.js"; //will be used
import User from "../../models/User.js";
import { openConnection, closeConnection } from "../../config/sqlconnection.js";
import { RESPONSE_MESSAGES } from "../../lib/constants.js";
import { decrypt } from "../../lib/EncryptDecrypt/encryptDecrypt.js";
// import { encryptPassword } from "../../lib/EncryptDecrypt/passwordEncryptDecrypt.js";
dotenv.config(); // Load environment variables

const GetUsers = async (req, res) => {
  try {
    await openConnection();
    const GetUsers = await User.findAll({where:{Role:["User"]}});
    if (!GetUsers) {
      return res.status(404).json({ message: "user not found" })
    };
    return res.status(201).json(GetUsers);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await closeConnection();
  }
}

const GetUsersAndAdmins = async ( req, res) => {
  try {
    await openConnection();
    const GetUsers = await User.findAll({
      where: { Role: ["User", "Admin"] },
      attributes: ['AccountID', 'Email', 'isEmailVerified', 'KYC_Status', 'Role', 'amount', 'FullName'] // Specify the fields to return
    });
    
    if (!GetUsers || GetUsers.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Decrypt the amount field for each user
    const decryptedUsers = GetUsers.map(user => {
      if (user.amount) {
        user.amount = decrypt(user.amount); // Decrypt the amount
        user.FullName = decrypt(user.FullName);
      }
      return user;
    });
    
    return res.status(200).json(decryptedUsers);
    
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal server error" });
  } finally {
    await closeConnection();
  }
}

const ChangeRole = async (req, res) => { //change role to 'admin' or to 'user'
  try {
    await openConnection();
    // const AccountID = req.user.AccountID;
    const { AccountID, Role } = req.body;

    if (!['Admin', 'User'].includes(Role)) {
      return res.status(400).json({ message: "Invalid role." })
    }
    const [FindUser] = await User.update({ Role: Role }, {
      where: { AccountID: AccountID }
    })
    if (FindUser === 0) {
      return res.status(404).json({ message: "user not found!" })
    }
    const updatedUser = await User.findOne({ where: { AccountID: AccountID } });
    return res.status(200).json(updatedUser);
  }
  catch (error) {
    return res.status(500).json({ message: "Internal server error." })

  } finally {
    await closeConnection();
  }
}

const KYCUpdate = async (req, res) => {
  try {
    await openConnection();
    // const AccountID = req.user.AccountID;
    const { AccountID, KYC_Status } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(KYC_Status)) {
      return res.status(400).json({ message: "Invalid Status." })
    }
    const [FindUser] = await User.update({ KYC_Status: KYC_Status }, {
      where: { AccountID: AccountID }
    })
    if (FindUser === 0) {
      return res.status(404).json({ message: "user not found!" })
    }
    const updatedUser = await User.findOne({ where: { AccountID: AccountID } });
    return res.status(200).json(updatedUser);
  }
  catch (error) {
    console.log(error)
    return res.status(500).json({ message: "Internal server error." });

  } finally {
    await closeConnection();
  }
}

const DeleteUser = async(req, res) => {
  try{
    await openConnection();
    // const Email = req.user.Email;
    // const {AccountID, Password} = req.body;
    const {AccountID} = req.body;
    console.log(AccountID)
    const findUser = await User.findOne({where:{AccountID: AccountID}})
    if(!findUser){
      return res.status(404).json({message: "User not found."})
    };
    await findUser.destroy();
    return res.status(201).json({message: "User Deleted Successfully."});
  } catch(error){
    console.log(error)
    return res.status(500).json({message:"Internal server error."});
  } finally{
    await closeConnection();
  }
}
export { KYCUpdate, GetUsers, GetUsersAndAdmins, ChangeRole, DeleteUser };