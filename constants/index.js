let errors = {
    notEnoughData: 'Not enough data provided to complete the request.',
    noAuthorization: 'Not sufficient user priviliges to complete the request.',
    noAuthentication: 'You must be logged in to complete the request. Please attach a valid user token.',
    dbError: 'Error with database transaction.',
    general: 'Failed to complete the request.',
    passwordLength: 'Password must be more than six characters.',
    token: 'Error validating token.',
    tokenMismatch: 'Provided token does not match database records.',
    noMatchingRecord: 'No matching id found in database records.',
    couldNotProcessRequest: 'Error processing you request. Check parameters.'
};

let defaultAccessToken = {
    issuer: 'tsuyoku-api',
    expiresIn: 1200
};

export { errors, defaultAccessToken };