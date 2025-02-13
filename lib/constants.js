
const RESPONSE_MESSAGES = {
  ALREADY_EXIST: { //400
    status: 'error',
    message:  'User already exists.'
  },
    REG_SUCCESS: {  //201
      status: 'success',
      message: 'User registered successfully.',
    },
   AUTHOR_ERROR: { //501
      status: 'error',
      message: 'Failed to register user.'
    },
    BAD_REQUEST: { //400
      status: 'error',
      message: ' refresh token is required.',
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
      message: 'User not found.',
    },

    NOT_FOUND: { //404
      status: 'error',
      message: 'User not found.',
    },
    UPDATE_SUCCESS: { //200
      status: 'success',
      message: 'Profile updated successfully.',
    },
    BAD_REQUEST: { //400
      status: 'error',
      message: 'Document type and number are required.',
    },
    NOT_FOUND: { //404
      status: 'error',
      message: 'User not found.',
    },
    KYC_SUCCESS: { //200
      status: 'success',
      message:'KYC submitted successfully.'
    },
    BAD_REQUEST: { //400
      status: 'error',
      message: 'Old password and new password are required.'
    },
    NOT_FOUND: { //404
      status: 'error',
      message: 'User not found.',
    },
    SUCCESS_RESPONSE: { //200
      status: 'success',
      message: 'Password changed successfully.'
    },
    BAD_REQUEST: { //400
      status: 'error',
      message:'Email is required.'
    },
    NOT_FOUND: { //404
      status: 'error',
      message:'User not found.',
    },
    SUCCESS_RESPONSE: { //200
      status: 'success',
      message:'Password reset link sent to email.'
    },
    BAD_REQUEST: { //400
      status: 'error',
      message:'New password is required.'
    },
    NOT_FOUND: { //404
      status: 'error',
      message: 'User not found.',
    },
    SUCCESS_RESPONSE: { //200
      status: 'success',
      message:'Password has been reset successfully.'
    },
    BAD_REQUEST: { //400
      status: 'error',
      message:'Reset token expired.'
    },
    INVALID_ERROR: { //400
      status: 'error',
      message:'Invalid token.'
    },
    BAD_REQUEST: { //400
      status: 'error',
      message:'No token provided.'
    },
    INVALID_ERROR: { //401 
      status: 'error',
      message:'Invalid token.'
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
      message: 'Internal server error.',
    },

    // refresh 
    INVALID_ERROR: { //401
      status: 'error',
      message: 'Refresh token is required.'
    },

    INVALID_ERROR: { //403
      status: 'error',
      message:'Invalid or expired refresh.'
  },
   SUCCESS_RESPONSE: { //200
    status: 'success',
    message: 'Access token refreshed.'
  },
  SERVER_ERROR: { //500
    status: 'error',
    message: 'Internal server error.'
  },

  //reqdoposit
  BAD_REQUEST: { //400
    status: 'error',
    message: 'Missisng required fields'
  },
  SUCCESS_RESPONSE: { //201
    status: 'success',
    message: 'Deposit request submmitted .'
  },
  SERVER_ERROR: { //500
    status: 'error',
    message: 'Internal server error.'
   },
  BAD_REQUEST: { //400
    status: 'error',
    message: 'Account Id is required.'
  },
  NOT_FOUND: { //404
    status: 'error',
    message:'User not found.'
  },
  SERVER_ERROR: { //500
    status: 'error',
    message: 'Internal server error.'
   },
  //requswith
  BAD_REQUEST: { //400
    status: 'error',
    message: 'Missing required fields.'
  },
  NOT_FOUND: { //404
    status: 'error',
    message: 'Account not found.'
  },
  BAD_REQUEST: {//400
    status: 'error',
    message: 'Insufficient balance.'
  },
  SUCCESS_RESPONSE: { //201
    status: 'success',
    message: 'Withdrawal request submitted successfully'
  },
  SERVER_ERROR: { //500
    status: 'error',
    message: '"Internal server error.'
  },
  UNAUTHORIZED: { //401
    status: 'error',
    message: 'Unauthorized'
  },
  SUCCESS_RESPONSE: { //200
    status: 'success',
    message:'Withdrawal requests fetched successfully.'
  },
  NOT_FOUND: { //404
    status: 'error',
    message: '"No withdrawal requests found.'
  },
  SERVER_ERROR: { //500
    status: 'error',
    message: 'Internal server error.'
  },  
  BAD_REQUEST: { //400
    status: 'error',
    message: 'ID is required.'
  },
  SUCCESS_RESPONSE: { //200
    status: 'success',
    message: 'Withdrawal request canceled successfully.'
  },
  NOT_FOUND: { //404
    status: 'error',
    message: 'User not found.'
  },
  SERVER_ERROR: { //500
    status: 'error',
    message: 'Internal server error.'
  },
  //withdraw
  SUCCESS_RESPONSE: { //201
    status: 'success',
    message: 'Withdrawal completed successfully.'
  },
  SERVER_ERROR: { //500
    status: 'error',
    message: 'Internal server error.'
  },
  NOT_FOUND: { //404
    status: 'error',
    message: 'User not found .'
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

  

