const express = require("express");
const { Pool, Client } = require('pg')
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const express = require("express");
const cors = require('cors');
const utils = require('./utils');
const app     = express();


const port = process.env.PORT || 4000;
app.listen(port,()=>
    console.log(`Listening on port ${port}...`)
);
// enable CORS
app.use(cors());
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));


const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'homect_db',
  password: '616944@TtT',
  port: 5432,
})

// request handlers
app.get('/', (req, res) => {
  res.send("Hello My HOMECT Page !!!");
});

//api get data from progres
app.get("/taikhoan",function(req,res){ 
    //get data
    pool.query('SELECT * FROM taikhoan ORDER BY id ASC', (err, response) => {
      if(err){
        console.log(err);
      }else{
        res.send(response.rows);
      }   
    })
});

app.post('/taikhoan/register',(req,res)=>{
  pool.query('INSERT INTO taikhoan VALUES (?,?,?,?,?)',
  [username,password,hten,gioitinh,sdt],
  (err,result)=>{
    if(err){
      console.log(err);
    }
  });
});
//api post user login data from progres
app.post('/taikhoan/signin', function (req, res) {
  const user = req.body.username;
  const pwd = req.body.password;
  // return 400 status if username/password is not exist
  if (!user || !pwd) {
    return res.status(400).json({
      error: true,
      message: "Username or Password required."
    });
  }
  pool.query('SELECT * FROM taikhoan WHERE username=$1 AND password=$2',
  [user,pwd], (err,response)=>{
     if(err) {
      return res.status(401).json({
        error: true,
        message: "Username or Password is Wrong."
      });
    }else{
      res.send(response.rows);
    }    
  }); 
});
app.use(function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['authorization'];
  if (!token) return next(); //if no token, continue
 
  token = token.replace('Bearer ', '');
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) {
      return res.status(401).json({
        error: true,
        message: "Invalid user"
      });
    } else {
      req.user = user; //set the user to req so other routes can use it
      next();
    }
  });
});
 
// request handlers
app.get('/', (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Invalid user to access it.' });
  res.send('Welcome to the Node.js Tutorial! - ' + req.user.name);
});

//api get data from progres
app.get("/taikhoan",function(req,res){ 
    //get data
    pool.query('SELECT * FROM taikhoan ORDER BY id ASC', (err, response) => {
      if(err){
        console.log(err);
      }else{
        res.send(response.rows);
      }   
    })
});

//api post user login data from progres
app.post('/taikhoan/signin', function (req, res) {
  const user = req.body.username;
  const pwd = req.body.password;
  // return 400 status if username/password is not exist
  if (!user || !pwd) {
    return res.status(400).json({
      error: true,
      message: "Username or Password required."
    });
  }
  pool.query('SELECT * FROM taikhoan WHERE username=$1 AND password=$2',
  [user,pwd], (err,response)=>{
     if(err) {
      return res.status(401).json({
        error: true,
        message: "Username or Password is Wrong."
      });
    }else{
      res.send(response.rows);
    }    

    // generate token
  const token = utils.generateToken(response.rows);
  // get basic user details
  const userObj = utils.getCleanUser(response.rows);
  // return the token along with user details
  return res.json({ user: userObj, token });
  }); 

  
});

app.get('/verifyToken', function (req, res) {
  var token = req.body.token || req.query.token;
  if (!token) {
    return res.status(400).json({
      error: true,
      message: "Token is required."
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) return res.status(401).json({
      error: true,
      message: "Invalid token."
    });
 
    if (user.userId !== userData.userId) {
      return res.status(401).json({
        error: true,
        message: "Invalid user."
      });
    }
    // get basic user details
    var userObj = utils.getCleanUser(userData);
    return res.json({ user: userObj, token });
  });
});

//middleware that checks if JWT token exists and verifies it if it does exist.
//In all future routes, this helps to know if the request is authenticated or not.