require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
<<<<<<< HEAD
  user: "postgres",
  host: "localhost",
  database: "homect_db",
  password: "616944@TtT",
  // database: 'myDB',
  // password: 'qr123456',
=======
  user: 'postgres',
  host: 'localhost',
  database: 'myDB',
  password: 'qr123456',
  //password: '616944@TtT',
>>>>>>> main
  port: 5432,
});

module.exports = { pool };
