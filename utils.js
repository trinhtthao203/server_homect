var jwt = require('jsonwebtoken');

function generateToken(user) {
  if (!user) return null;

  var u = {
    user_id: user.user_id,
    userName: user.userName,
    fullName:user.fullName,
    isMale:user.isMale,
    phoneNumber:user.phoneNumber
  };

  return jwt.sign(u, process.env.JWT_SECRET, {
    expiresIn: 60 * 60 * 24 
  });
}

function getCleanUser(user) {
  if (!user) return null;
  return {
    user_id: user.user_id,
    username: user.username,
    fullname:user.fullname,
    ismale:user.ismale,
    phonenumber:user.phonenumber
  };
}

module.exports = {
  generateToken,
  getCleanUser
}
