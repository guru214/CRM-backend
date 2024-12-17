
const RESPONSE_MESSAGES = {
  ALREADY_EXIST: { //400
    status: 'error',
    message: 'User already exists .'
  },
    REG_SUCCESS: {  //201
      status: 'success',
      message: 'User registered successfully.',
    },
   AUTHOR_ERROR: { //501
      status: 'error',
      message: 'Failed to register user.'
    },
    SERVER_ERROR: { //500
      status: 'error',
      message: 'Internal server error.',
    },
    BAD_REQUEST: { //400
      status: 'error',
      message: ' Please provide all the required data.',
    },
    INVALID: { //401 
      status: 'error',
      message: 'Invalid email or password.'
    },
    SERVER_ERROR: { //500
      status: 'error',
      message: 'Internal server error.',
    },
    NOT_FOUND: { //404
      status: 'error',
      message: 'User not  found.',
    },
    SERVER_ERROR: { //500
      status: 'error',
      message: ' server error.',
    },
    NOT_FOUND: { //404
      status: 'error',
      message: 'User not  found.',
    },
    UPDATE_SUCCESS: { //200
      status: 'success',
      message: 'Profile updated successfully.',
    },
    SERVER_ERROR: { //500
      status: 'error',
      message: ' server error.',
    },
    BAD_REQUEST: { //400
      status: 'error',
      message: 'Document type and number are required.',
    },
    NOT_FOUND: { //404
      status: 'error',
      message: 'User not  found.',
    },
    KYC_SUCCESS: { //200
      status: 'success',
      message:'KYC submitted successfully.'
    },
    SERVER_ERROR: { //500
      status: 'error',
      message: ' Inetrnal server error.',
    },
    BAD_REQUEST: { //400
      status: 'error',
      message: 'Old password and new password are required.'
    },
    NOT_FOUND: { //404
      status: 'error',
      message: 'User not  found.',
    },
    SUCCESS_RESPONSE: { //200
      status: 'success',
      message: 'Password changed successfully.'
    },
    SERVER_ERROR: { //500
      status: 'error',
      message: 'Internal server error.'
    },
    BAD_REQUEST: { //400
      status: 'error',
      message:'Email is required.'
    },
    NOT_FOUND: { //404
      status: 'error',
      message: 'User not  found.',
    },
    SUCCESS_RESPONSE: { //200
      status: 'success',
      message:'Password reset link sent to email.'
    },
    SERVER_ERROR: { //500
      status: 'error',
      message: 'Internal server error.'
    },
    BAD_REQUEST: { //400
      status: 'error',
      message:'New password is required.'
    },
    NOT_FOUND: { //404
      status: 'error',
      message: 'User not  found.',
    },
    SUCCESS_RESPONSE: { //200
      status: 'success',
      message:'Password has been reset successfully.'
    },
    BAD_REQUEST: { //400
      status: 'error',
      message:'Reset token expired.'
    },
    BAD_REQUEST: { //400
      status: 'error',
      message:'Invalid token.'
    },
    BAD_REQUEST: { //400
      status: 'error',
      message:'No token provided.'
    },
    AUTHOR_ERROR: { //401 
      status: 'error',
      message: 'Invalid token.'
    },
    NOT_FOUND: { //404
      status: 'error',
      message: 'User not found.',
    },
    SUCCESS_RESPONSE: { //200
      status: 'success',
      message:'Logout successful.'
    },
    SERVER_ERROR: { //500
      status: 'error',
      message: 'Internal server error. Please try again later.',
    },

    //sailaxmi refresh 
    AUTHOR_ERROR: { //401
      status: 'error',
      message: 'Refresh token is required .'
  },
    INVALID_ERROR: { //403
      status: 'error',
      message:'Invalid or expired refresh token .'
  },
   SUCCESS_RESPONSE: { //200
    status: 'success',
    message: 'Access token refreshed.'
  },
  SERVER_ERROR: { //500
    status: 'error',
    message: 'Internal server error .'
  },
  //reqdoposit
  BAD_REQUEST: { //400
    status: 'error',
    message: 'Somethingg went wrong!!.'
  },
  SUCCESS_RESPONSE: { //201
    status: 'success',
    message: 'deposit request successfully!.'
  },
  SERVER_ERROR: { //500
    status: 'error',
    message: 'Internal server error .'
  },
  BAD_REQUEST: { //400
    status: 'error',
    message: 'AccountID is required.'
  },
  NOT_FOUND: { //404
    status: 'error',
    message:'No deposit requests found.'
  },
  SERVER_ERROR: { //500
    status: 'error',
    message: 'Internal server error .'
  },
  //requswith
  BAD_REQUEST: { //400
    status: 'error',
    message: 'Missing required fields .'
  },
  NOT_FOUND: { //404
    status: 'error',
    message: 'Account not found .'
  },
  BAD_REQUEST: {//400
    status: 'error',
    message: 'Insufficient balance .'
  },
  SUCCESS_RESPONSE: { //201
    status: 'success',
    message: 'Withdrawal request submitted successfully .'
  },
  SERVER_ERROR: { //500
    status: 'error',
    message: 'Internal server error.'
  },
  UNAUTHORIZED: { //401
    status: 'error',
    message: 'Unauthorized .'
  },
  SUCCESS_RESPONSE: { //200
    status: 'success',
    message:'Withdrawal requests fetched successfully .'
  },
  NOT_FOUND: { //404
    status: 'error',
    message: 'No withdrawal requests found .'
  },
  SERVER_ERROR: { //500
    status: 'error',
    message: 'Internal server error.'
  },  
  BAD_REQUEST: { //400
    status: 'error',
    message: 'ID is required .'
  },
  SUCCESS_RESPONSE: { //200
    status: 'success',
    message: 'Withdrawal request canceled successfully .'
  },
  NOT_FOUND: { //404
    status: 'error',
    message: 'Withdrawal request not found .'
  },
  SERVER_ERROR: { //500
    status: 'error',
    message: 'Internal server error.'
  },
  //withdraw
  SUCCESS_RESPONSE: { //201
    status: 'success',
    message: 'Withdraw details submitted successfully .'
  },
  SERVER_ERROR: { //500
    status: 'error',
    message: 'Internal server error.'
  },
  NOT_FOUND: { //404
    status: 'error',
    message: 'Withdraw details not found for this AccountID.'
  },
  SUCCESS_RESPONSE: { //200
    status: 'success',
    message:'Withdraw details updated successfully.'
  },
  SERVER_ERROR: { //500
    status: 'error',
    message: 'Internal server error.'
  },
  NOT_FOUND: { //404
    status: 'error',
    message:'No withdraw details found for this AccountID.'
  },
  SUCCESS_RESPONSE: { //200
    status: 'success',
    message:'Withdraw details fetched successfully.'
  },
  SERVER_ERROR: { //500
    status: 'error',
    message: 'Internal server error.' 
  },
};
  export {RESPONSE_MESSAGES};

  

