var success_msg = {
  registered: "User registered successfully",
  login: "Login successful",
  delete_account:"Account deleted successfully",
  alreadyExists: "Account already exists",
  passwordLink: "Password reset link has been sent to your email",
  passwordChange: "Password changed successfully",
  logout: "User logged out successfully!",
  updateProfile: "User profile updated successfully!",
  passwordUpdate: "Password updated successfully.",
  otpSend: "OTP sent successfully",
  otpVerify: "Otp verified successfully",
  otpResend: "OTP resent successfully",
  address_add_success: "Address added successfully!",
  address_add_list: "User address list get successfully",
  stripe_sk_pk:"Stripe sk and pk list get successfully",
  card_add:"Card added successfully",
  delete_card:"Card deleted successfully",
  card_list:"Card list fetched successfully",
  payment_success:"Payment done successfully",
  external_bank_success:"External bank account added successfully",
  external_bank_delete_success:"External bank account deleted successfully",
  default_bank_success:"Default bank account added successfully",
  bankAccountList: "Bank account list get successfully",
  fundTransfer: "Fund transfer get successfully"

};

var failed_msg = {
  userNotFound: "User not found",
  invalidPassword: "Invalid password",
  noAccWEmail: "No account exists with this email",
  pwdNoMatch: "Passwords do not match!",
  userIdReq: "User ID is required.",
  incorrectCurrPwd: "Incorrect current password.",
  tokReq: "Token is required!",
  invTok: "Invalid token!",
};

var error_msg = {
  regUser: "Error registering user",
  loguser: "Error during login",
  forgPwdErr: "Forgot password error",
  resetPwdErr: "Reset password error",
  chngPwdErr: "Error while changing the password",
  logoutErr: "Logout error",
  updPrfErr: "Error while updating profile",
  tokenNotPrv: "Token is not provided!",
  forPwdTokVer: "Forgot password token verification error!",
  pwdResTokExp: "Password reset token is invalid or has expired",
  otpSendErr: "Error while sending the otp",
  otpVerErr: "Error while verifying the otp",
  otpResErr: "Failed to resend OTP",
  address_failed_add: "Failed to add address",
  payment_failed:"Payment not successful"
};

module.exports = {
  success_msg: success_msg,
  failed_msg: failed_msg,
  error_msg: error_msg,
};
