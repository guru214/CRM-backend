
const RESPONSE_MESSAGES = {
    REG_SUCCESS: {  //201
      status: 'success',
      message: 'User registered successfully.',
    },
    SUCCESS_RESPONSE: { //201
      status: 'success',
      message: 'Resource created successfully.',
    },
    UPDATE_SUCCESS: { //200
      status: 'success',
      message: 'Resource updated successfully.',
    },
    DEL_SUCCESS: { //200
      status: 'success',
      message: 'Resource deleted successfully.',
    },
    ERROR: { //500
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    },
    NOT_FOUND: { //404
      status: 'error',
      message: 'The resource could not be found.',
    },
    BAD_REQUEST: { //400
      status: 'error',
      message: 'Bad request. Please provide all the required data.',
    },
    ALREADY_EXIST: { //400
      status: 'error',
      message: 'User already exists .'
    },
    UNAUTHORIZED: { //401
      status: 'error',
      message: 'You are not authorized to perform this action.',
    },
    INVALID: { //401 
      status: 'error',
      message: 'Invalid data, Please try again.'
    },
    FORBIDDEN: { //403
      status: 'error',
      message: 'You do not have permission to access this resource.',
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
  //requsrwith
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

  

