require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "db_homect",
  // password: 'qr123456',
  password: "616944@TtT",
  port: 5432,
});

module.exports = { pool };
