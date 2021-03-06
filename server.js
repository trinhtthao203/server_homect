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
        message: "Vui l??ng nh???p c??c tr?????ng b???t bu???c!",
      });
    } else if (!lat || !lng) {
      return res.status(401).json({
        error: true,
        message: "Vui l??ng ch???n 1 t???a ????? tr??n b???n ?????!",
      });
    }
    pool.query(
      "INSERT INTO chungcu(tenchungcu, toado, diachi, tenduong, idquan) VALUES ($1,POINT($2,$3),$4,$5,$6)",
      [tenchungcu, lng, lat, diachi, tenduong, parseInt(quan)],
      (err, response) => {
        if (err) {
          return res.status(403).json({
            error: true,
            message: "C?? l???i vui l??ng ki???m tra l???i!",
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
        message: "Vui l??ng nh???p c??c tr?????ng b???t bu???c!",
      });
    } else if (isNaN(dientich)) {
      return res.status(402).json({
        error: true,
        message: "Vui l??ng ki???m tra l???i tr?????ng Di???n t??ch ph???i l?? m???t con s???!",
      });
    } else if (isNaN(mucgia)) {
      return res.status(402).json({
        error: true,
        message: "Vui l??ng ki???m tra l???i tr?????ng M???c gi?? ph???i l?? m???t con s???!",
      });
    } else if (isNaN(sophongNgu)) {
      return res.status(402).json({
        error: true,
        message:
          "Vui l??ng ki???m tra l???i tr?????ng s??? ph??ng ng??? ph???i l?? m???t con s???!",
      });
    } else if (isNaN(sophongVS)) {
      return res.status(402).json({
        error: true,
        message:
          "Vui l??ng ki???m tra l???i tr?????ng s??? ph??ng v??? sinh ph???i l?? m???t con s???!",
      });
    } else if (isNaN(tangso)) {
      return res.status(402).json({
        error: true,
        message: "Vui l??ng ki???m tra l???i tr?????ng T???ng s??? ph???i l?? m???t con s???!",
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
            message: "C?? l???i vui l??ng ki???m tra l???i!",
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

app.get("/quan", function (req, res) {
  pool.query("SELECT * FROM quan", (err, response) => {
    if (err) {
      console.log(err);
    } else {
      res.send(response.rows);
    }
  });
});

app.get("/chungcu", function (req, res) {
  pool.query("SELECT * FROM chungcu", (err, response) => {
    if (err) {
      console.log(err);
    } else {
      res.send(response.rows);
    }
  });
});

app.post("/timkiem/idquan", function (req, res) {
  const { idquan, mucgia } = req.body;
  if (idquan == 30 || idquan == 0) {
    if (mucgia == 1) {
      pool.query(
        "SELECT * FROM baidang AS a, taikhoan AS b, chungcu c  WHERE a.userid = b.userid and a.idchungcu=c.idchungcu order by a.mucgia",
        (err, response) => {
          if (err) {
            console.log(err);
          } else {
            res.send(response.rows);
          }
        }
      );
    } else if (mucgia == 2) {
      pool.query(
        "SELECT * FROM baidang AS a, taikhoan AS b, chungcu c  WHERE a.userid = b.userid and a.idchungcu=c.idchungcu order by a.mucgia desc",

        (err, response) => {
          if (err) {
            console.log(err);
          } else {
            res.send(response.rows);
          }
        }
      );
    } else {
      pool.query(
        "SELECT * FROM baidang AS a, taikhoan AS b, chungcu c  WHERE a.userid = b.userid and a.idchungcu=c.idchungcu",
        (err, response) => {
          if (err) {
            console.log(err);
          } else {
            res.send(response.rows);
          }
        }
      );
    }
  } else {
    if (mucgia == 1) {
      pool.query(
        "SELECT * FROM baidang AS a, taikhoan AS b, chungcu c  WHERE a.userid = b.userid and a.idchungcu=c.idchungcu and c.idquan=$1 order by a.mucgia asc",
        [idquan],
        (err, response) => {
          if (err) {
            console.log(err);
          } else {
            res.send(response.rows);
          }
        }
      );
    } else if (mucgia == 2) {
      pool.query(
        "SELECT * FROM baidang AS a, taikhoan AS b, chungcu c  WHERE a.userid = b.userid and a.idchungcu=c.idchungcu and c.idquan=$1 order by a.mucgia desc",
        [idquan],
        (err, response) => {
          if (err) {
            console.log(err);
          } else {
            res.send(response.rows);
          }
        }
      );
    } else {
      pool.query(
        "SELECT * FROM baidang AS a, taikhoan AS b, chungcu c  WHERE a.userid = b.userid and a.idchungcu=c.idchungcu and c.idquan=$1",
        [idquan],
        (err, response) => {
          if (err) {
            console.log(err);
          } else {
            res.send(response.rows);
          }
        }
      );
    }
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
        message: "Vui l??ng nh???p t???t c??? c??c tr?????ng !",
      });
    } else if (passwd != confirmPasswd) {
      return res.status(402).json({
        error: true,
        message: "M???t kh???u x??c nh???n kh??ng tr??ng kh???p!",
      });
    } else if (5 > passwd.length || passwd.length > 20) {
      return res.status(403).json({
        error: true,
        message: "M???t kh???u t???i thi???u 5 k?? t??? - t???i ??a 20 k?? t???!",
      });
    }

    let query =
      "INSERT INTO taikhoan(userName, fullName, isMale, phoneNumber, passwd, quyensd) VALUES ($1,$2,$3,$4,$5,0)";
    let values = [userName, fullName, isMale, phoneNumber, passwd];
    pool.query(query, values, (err, response) => {
      if (err) {
        return res.status(401).json({
          error: true,
          message: "T??i kho???n ???? t???n t???i",
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
      message: "Ch??a nh???p t??i kho???n ho???c m???t kh???u. Vui l??ng ki???m tra l???i.",
    });
  }
  pool.query(
    "SELECT * FROM taikhoan WHERE userName=$1 AND passwd=$2",
    [userName, passwd],
    (err, response) => {
      if (response.rows.length <= 0) {
        return res.status(401).json({
          error: true,
          message: "T??i kho???n ho???c m???t kh???u ch??a ????ng!",
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
          message: "C?? l???i vui l??ng ki???m tra l???i!",
        });
      } else {
        return res.json(response.rows);
      }
    }
  );
});

app.delete("/delChungCu/:idchungcu", function (req, res) {
  console.log(req.params.idchungcu);
  pool.query(
    `DELETE FROM chungcu WHERE idchungcu=${req.params.idchungcu}`,
    (err, response) => {
      if (err) {
        return res.status(403).json({
          error: true,
          message: "C?? l???i vui l??ng ki???m tra l???i!",
        });
      } else {
        return res.json(response.rows);
      }
    }
  );
});
