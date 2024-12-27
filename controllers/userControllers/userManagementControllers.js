
import dotenv from "dotenv";
import { encryptUserData, decryptUserData } from "../../lib/EncryptDecrypt/UserData.js"; //will be used
import User from "../../models/User.js";
import { openConnection, closeConnection } from "../../config/sqlconnection.js";
import { RESPONSE_MESSAGES } from "../../lib/constants.js";
// import { encryptPassword } from "../../lib/EncryptDecrypt/passwordEncryptDecrypt.js";
dotenv.config(); // Load environment variables

const GetUsers = async (req, res) => {
  try {
    await openConnection();
    const GetUsers = await User.findAll({where:{Role:["User"]}});
    if (!GetUsers) {
      res.status(404).json({ message: "user not found" })
    };
    res.status(201).json(GetUsers);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" }, error);
  } finally {
    await closeConnection();
  }
}

const GetUsersAndAdmins = async ( req, res) => {
  try {
    await openConnection();
    const GetUsers = await User.findAll({where:{Role:["User", "Admin"]}});
    if (!GetUsers) {
      res.status(404).json({ message: "user not found" })
    };
    res.status(201).json(GetUsers);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" }, error);
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
      res.status(400).json({ message: "Invalid role." })
    }
    const [FindUser] = await User.update({ Role: Role }, {
      where: { AccountID: AccountID }
    })
    if (FindUser === 0) {
      res.status(404).json({ message: "user not found!" })
    }
    const updatedUser = await User.findOne({ where: { AccountID: AccountID } });
    res.status(200).json(updatedUser);
  }
  catch (error) {
    res.status(500).json({ message: "Internal server error." }, error)

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
      res.status(400).json({ message: "Invalid Status." })
    }
    const [FindUser] = await User.update({ KYC_Status: KYC_Status }, {
      where: { AccountID: AccountID }
    })
    if (FindUser === 0) {
      res.status(404).json({ message: "user not found!" })
    }
    const updatedUser = await User.findOne({ where: { AccountID: AccountID } });
    res.status(200).json(updatedUser);
  }
  catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error.",  error });

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
      res.status(404).json({message: "User not found."})
    };

     ///lets seeee
    // const superAdmin = await User.findOne({where:{Email: Email}})
    // if(!superAdmin){
    //   res.status(404).json({message: "you dont have access for this request."})
    // };
    // const realIv = superAdmin.iv.substring(5, 29); // Extract the IV from stored data
    // const encryptedPass = encryptPassword(Password, realIv);
    // const storedPassword = superAdmin.Password;
    // // console.log(encryptedPass)
    // // console.log(storedPassword)
    // // console.log("sdf",Finduser.Password)
    // if (encryptedPass !== storedPassword) {
    //   return res.status(401).json({ message: RESPONSE_MESSAGES.INVALID.message });
    // }

    await findUser.destroy();
    res.status(201).json({message: "User Deleted Successfully."});
  } catch(error){
    console.log(error)
    res.status(500).json({message:"Internal server error."});
  } finally{
    await closeConnection();
  }
}
export { KYCUpdate, GetUsers, GetUsersAndAdmins, ChangeRole, DeleteUser };