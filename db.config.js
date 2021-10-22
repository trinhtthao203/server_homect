require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "homect_db",
  password: "616944@TtT",
  // database: 'myDB',
  // password: 'qr123456',
  port: 5432,
});

module.exports = { pool };
