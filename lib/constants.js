
const RESPONSE_MESSAGES = {
    REG_SUCCESS: {  //201
      status: 'success',
      message: 'The registration was successful.',
    },
    CREATED: { //201
      status: 'success',
      message: 'Resource created successfully.',
    },
    UPDATED: { //200
      status: 'success',
      message: 'Resource updated successfully.',
    },
    DELETED: { //200
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
      message: 'This data already exists.'
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
  };
  
 export {RESPONSE_MESSAGES};
  