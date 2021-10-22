require('dotenv').config();
const utils = require('./utils');
const jwt = require('jsonwebtoken');

const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');

const app     = express();
const port = process.env.PORT || 4000;
const {pool} = require('./db.config');
const { response } = require('express');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port,()=>
    console.log(`Listening on port ${port}...`)
);

app.use(function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['authorization'];
  if (!token) return next(); //if no token, continue
 
  token = token.replace('Bearer ', '');
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) {
      return res.status(401).json({
        error: true,
        message: "Invalid user."
      });
    } else {
      req.user = user; //set the user to req so other routes can use it
      next();
    }
  });
});

//api get data from progres
app.get("/taikhoan",function(req,res){ 
    //get data
    pool.query('SELECT * FROM taikhoan ORDER BY userid ASC', (err, response) => {
      if(err){
        console.log(err);
      }else{
        res.send(response.rows);
      }   
    })
});

app.get("/baidang", function(req, res) {
  pool.query('SELECT * FROM baidang AS a, taikhoan AS b WHERE a.userid = b.userid', (err, response) => {
    if(err){
      console.log(err);
    }
    else{
      res.send(response.rows);
    }
  })
});

app.post('/taikhoan/register',(req, res)=> {  
  try{
    const {userName,
          fullName,
          phoneNumber,
          isMale,
          passwd,
          confirmPasswd
    }= req.body;
    if (!userName || !fullName || !phoneNumber || !isMale || !passwd || !confirmPasswd) {
      return res.status(400).json({
        error: true,
        message: "Vui lòng nhập tất cả các trường !"
      });
    }
    else if (passwd != confirmPasswd) {
      return res.status(402).json({
        error: true,
        message: "Mật khẩu xác nhận không trùng khớp!"
      });
    }
    else if ( 5 > passwd.length || passwd.length >20) {
      return res.status(403).json({
        error: true,
        message: "Mật khẩu tối thiểu 5 ký tự - tối đa 20 ký tự!"
      });
    }

    let query='INSERT INTO taikhoan(userName, fullName, isMale, phoneNumber, passwd) VALUES ($1,$2,$3,$4,$5)';
    let values=[userName,fullName,isMale,phoneNumber,passwd];
    pool.query(query, values, (err,response)=>{
        if(err) {
          return res.status(401).json({
            error: true,
            message: "Tài khoản đã tồn tại"
          });
        }else{
          console.log('Register success!!!');
          return res.json(response.rows);  
        }
        } 
      )
  }catch(err){
    console.log(err.message);
  }
});

app.post('/taikhoan/signin',(req, res)=> {  
  const {userName,
          passwd
    }= req.body;

     if (!userName || !passwd) {
      return res.status(400).json({
        error: true,
        message: "Chưa nhập tài khoản hoặc mật khẩu. Vui lòng kiểm tra lại."
      });
    }
      pool.query('SELECT * FROM taikhoan WHERE userName=$1 AND passwd=$2', [userName,passwd], (err,response)=>{
        if(response.rows.length<=0) {
          return res.status(401).json({
            error: true,
            message: "Tài khoản hoặc mật khẩu chưa đúng!"
          });
        }else{
            console.log('Login success!!!');
            // generate token
            const token = utils.generateToken(...response.rows);
            // get basic user details
            const userObj = utils.getCleanUser(...response.rows);
            // return the token along with user details
            return res.json({ user: userObj, token });
        }} 
      )
});


// verify the token and return it if it's valid
app.get('/verifyToken', function (req, res) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token;
  if (!token) {
    return res.status(400).json({
      error: true,
      message: "Token is required."
    });
  }
  // check token that was passed by decoding token using secret
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) return res.status(401).json({
      error: true,
      message: "Invalid token."
    });

    // return 401 status if the userId does not match.
    var user = req.body.user_str;
    // get basic user details
    var userObj = utils.getCleanUser(user);
    return res.json({ user: userObj, token });
  });
});

