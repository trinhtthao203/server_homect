var jwt = require("jsonwebtoken");

function generateToken(user) {
  if (!user) return null;

  var u = {
    user_id: user.userid,
    userName: user.userName,
    fullName: user.fullName,
    isMale: user.isMale,
    phoneNumber: user.phoneNumber,
  };

  return jwt.sign(u, process.env.JWT_SECRET, {
    expiresIn: 60 * 60 * 24,
  });
}

function getCleanUser(user) {
  if (!user) return null;
  return {
    user_id: user.userid,
    username: user.username,
    fullname: user.fullname,
    ismale: user.ismale,
    phonenumber: user.phonenumber,
  };
}

module.exports = {
  generateToken,
  getCleanUser,
};
