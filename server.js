require("dotenv").config();
const utils = require("./utils");
const jwt = require("jsonwebtoken");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 4000;
const { pool } = require("./db.config");
const { response } = require("express");

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.listen(port, () => console.log(`Listening on port ${port}...`));

app.use(function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers["authorization"];
  if (!token) return next(); //if no token, continue

  token = token.replace("Bearer ", "");
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err) {
      return res.status(401).json({
        error: true,
        message: "Invalid user.",
      });
    } else {
      req.user = user; //set the user to req so other routes can use it
      next();
    }
  });
});

//api get data from progres
app.get("/taikhoan", function (req, res) {
  //get data
  pool.query("SELECT * FROM taikhoan ORDER BY userid ASC", (err, response) => {
    if (err) {
      console.log(err);
    } else {
      res.send(response.rows);
    }
  });
});

app.get("/chungcu", function (req, res) {
  //get data
  pool.query(
    "SELECT * FROM chungcu ORDER BY idchungcu ASC",
    (err, response) => {
      if (err) {
        console.log(err);
      } else {
        res.send(response.rows);
      }
    }
  );
});

app.post("/baidang/id", function (req, res) {
  const { idbaidang } = req.body;
  pool.query(
    "SELECT * FROM baidang AS a, taikhoan AS b, chungcu c  WHERE a.userid = b.userid and a.idchungcu=c.idchungcu  and a.idbaidang=$1",
    [idbaidang],
    (err, response) => {
      if (err) {
        console.log(err);
      } else {
        res.send(response.rows);
      }
    }
  );
});

app.get("/baidang", function (req, res) {
  pool.query(
    "SELECT * FROM baidang AS a, taikhoan AS b WHERE a.userid = b.userid",
    (err, response) => {
      if (err) {
        console.log(err);
      } else {
        res.send(response.rows);
      }
    }
  );
});

app.post("/loadChungCu", (req, res) => {
  try {
    const { tenchungcu, lat, lng, diachi, tenduong, quan } = req.body;
    console.log(typeof lat);
    console.log(typeof lng);
    console.log(typeof quan);

    if (!tenchungcu || !quan || !tenduong) {
      return res.status(400).json({
        error: true,
        message: "Vui lòng nhập các trường bắt buộc!",
      });
    } else if (!lat || !lng) {
      return res.status(401).json({
        error: true,
        message: "Vui lòng chọn 1 tọa độ trên bản đồ!",
      });
    }
    pool.query(
      "INSERT INTO chungcu(tenchungcu, toado, diachi, tenduong, idquan) VALUES ($1,POINT($2,$3),$4,$5,$6)",
      [tenchungcu, lng, lat, diachi, tenduong, parseInt(quan)],
      (err, response) => {
        if (err) {
          return res.status(403).json({
            error: true,
            message: "Có lỗi vui lòng kiểm tra lại!",
          });
        } else {
          return res.json(response.rows);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.post("/loadBaiDang", (req, res) => {
  try {
    const {
      userid,
      tieude,
      mota,
      ngaydang,
      dientich,
      mucgia,
      tangso,
      sophongNgu,
      sophongVS,
      noithat,
      phaply,
      idchungcu,
      imgData,
    } = req.body;

    if (
      !idchungcu ||
      !tieude ||
      !dientich ||
      !mucgia ||
      !tangso ||
      !sophongNgu ||
      !sophongVS ||
      !noithat ||
      !phaply
    ) {
      return res.status(400).json({
        error: true,
        message: "Vui lòng nhập các trường bắt buộc!",
      });
    } else if (isNaN(dientich)) {
      return res.status(402).json({
        error: true,
        message: "Vui lòng kiểm tra lại trường Diện tích phải là một con số!",
      });
    } else if (isNaN(mucgia)) {
      return res.status(402).json({
        error: true,
        message: "Vui lòng kiểm tra lại trường Mức giá phải là một con số!",
      });
    } else if (isNaN(sophongNgu)) {
      return res.status(402).json({
        error: true,
        message:
          "Vui lòng kiểm tra lại trường số phòng ngủ phải là một con số!",
      });
    } else if (isNaN(sophongVS)) {
      return res.status(402).json({
        error: true,
        message:
          "Vui lòng kiểm tra lại trường số phòng vệ sinh phải là một con số!",
      });
    } else if (isNaN(tangso)) {
      return res.status(402).json({
        error: true,
        message: "Vui lòng kiểm tra lại trường Tầng số phải là một con số!",
      });
    }
    pool.query(
      "INSERT INTO baidang(userid,tieude,mota,ngaydang,dientich,mucgia,tangso,sophongngu,sophongvs,noithat,phaply,idchungcu,hinhanh) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)",
      [
        userid,
        tieude,
        mota,
        ngaydang,
        dientich,
        mucgia,
        tangso,
        sophongNgu,
        sophongVS,
        noithat,
        phaply,
        idchungcu,
        imgData,
      ],
      (err, response) => {
        if (err) {
          return res.status(403).json({
            error: true,
            message: "Có lỗi vui lòng kiểm tra lại!",
          });
        } else {
          return res.json(response.rows);
        }
      }
    );
  } catch (error) {
    console.log(error);
  }
});

app.post("/taikhoan/register", (req, res) => {
  try {
    const { userName, fullName, phoneNumber, isMale, passwd, confirmPasswd } =
      req.body;
    if (
      !userName ||
      !fullName ||
      !phoneNumber ||
      !isMale ||
      !passwd ||
      !confirmPasswd
    ) {
      return res.status(400).json({
        error: true,
        message: "Vui lòng nhập tất cả các trường !",
      });
    } else if (passwd != confirmPasswd) {
      return res.status(402).json({
        error: true,
        message: "Mật khẩu xác nhận không trùng khớp!",
      });
    } else if (5 > passwd.length || passwd.length > 20) {
      return res.status(403).json({
        error: true,
        message: "Mật khẩu tối thiểu 5 ký tự - tối đa 20 ký tự!",
      });
    }

    let query =
      "INSERT INTO taikhoan(userName, fullName, isMale, phoneNumber, passwd) VALUES ($1,$2,$3,$4,$5)";
    let values = [userName, fullName, isMale, phoneNumber, passwd];
    pool.query(query, values, (err, response) => {
      if (err) {
        return res.status(401).json({
          error: true,
          message: "Tài khoản đã tồn tại",
        });
      } else {
        console.log("Register success!!!");
        return res.json(response.rows);
      }
    });
  } catch (err) {
    console.log(err.message);
  }
});

app.post("/taikhoan/signin", (req, res) => {
  const { userName, passwd } = req.body;

  if (!userName || !passwd) {
    return res.status(400).json({
      error: true,
      message: "Chưa nhập tài khoản hoặc mật khẩu. Vui lòng kiểm tra lại.",
    });
  }
  pool.query(
    "SELECT * FROM taikhoan WHERE userName=$1 AND passwd=$2",
    [userName, passwd],
    (err, response) => {
      if (response.rows.length <= 0) {
        return res.status(401).json({
          error: true,
          message: "Tài khoản hoặc mật khẩu chưa đúng!",
        });
      } else {
        console.log("Login success!!!");
        // generate token
        const token = utils.generateToken(...response.rows);
        // get basic user details
        const userObj = utils.getCleanUser(...response.rows);
        // return the token along with user details
        return res.json({ user: userObj, token });
      }
    }
  );
});

// verify the token and return it if it's valid
app.get("/verifyToken", function (req, res) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token;
  if (!token) {
    return res.status(400).json({
      error: true,
      message: "Token is required.",
    });
  }
  // check token that was passed by decoding token using secret
  jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
    if (err)
      return res.status(401).json({
        error: true,
        message: "Invalid token.",
      });

    // return 401 status if the userId does not match.
    var user = req.body.user_str;
    // get basic user details
    var userObj = utils.getCleanUser(user);
    return res.json({ user: userObj, token });
  });
});

app.delete("/delBaiDang/:idbaidang", function (req, res) {
  pool.query(
    `DELETE FROM baidang WHERE idbaidang=${req.params.idbaidang}`,
    (err, response) => {
      if (err) {
        return res.status(403).json({
          error: true,
          message: "Có lỗi vui lòng kiểm tra lại!",
        });
      } else {
        return res.json(response.rows);
      }
    }
  );
});
